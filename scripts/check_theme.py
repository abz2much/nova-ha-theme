#!/usr/bin/env python3
"""Checks themes/nova.yaml. Run: python3 scripts/check_theme.py (needs PyYAML).

Fails (exit 1) when a theme is missing, a required token is absent, a hex
colour is unquoted, or a text colour is below 4.5:1 on the surface it sits on.
"""
import re
import sys
from pathlib import Path

import yaml

THEME_FILE = Path(__file__).resolve().parent.parent / "themes" / "nova.yaml"

LABELS = {
    "deep_teal": "Deep Teal", "midnight_signal": "Midnight Signal", "plum_dusk": "Plum Dusk",
    "cocoa_bark": "Cocoa Bark", "forest_mint": "Forest Mint", "slate_harbour": "Slate Harbour",
    "classic": "Classic", "violet_mist": "Violet Mist", "berry_sky": "Berry Sky",
    "quantum_ice": "Quantum Ice", "pine_mist": "Pine Mist", "ember": "Ember",
}
DARK = ["deep_teal", "midnight_signal", "plum_dusk", "cocoa_bark", "forest_mint", "slate_harbour"]
EXPECTED = ["Nova " + v for v in LABELS.values()] + ["Nova Deep Teal Compact", "Nova"]

# Tokens every theme must set (inside its mode block).
REQUIRED = [
    # core colours and text
    "primary-color", "accent-color", "primary-background-color", "secondary-background-color",
    "card-background-color", "primary-text-color", "secondary-text-color", "disabled-text-color",
    "text-primary-color", "divider-color", "lovelace-background",
    # idea 1 and 2: fonts, shape
    "ha-font-family-body", "ha-font-family-heading", "ha-font-family-code",
    "ha-font-weight-heading", "ha-card-header-font-family", "ha-card-header-font-size", "ha-card-border-radius", "ha-border-radius-lg", "ha-border-radius-xl",
    # idea 4: energy colours
    "energy-solar-color", "energy-grid-consumption-color", "energy-grid-return-color",
    "energy-battery-in-color", "energy-battery-out-color",
    # idea 7: dialogs and form fields
    "dialog-background-color", "ha-color-form-background", "ha-color-form-background-hover",
    "ha-color-form-background-disabled", "ha-color-text-primary", "ha-color-text-secondary",
    "ha-color-focus", "ha-color-fill-primary-loud-resting", "ha-color-on-primary-loud",
    "input-fill-color", "input-ink-color", "input-label-ink-color",
    # semantic
    "error-color", "warning-color", "success-color", "info-color",
]

# (text colour token, surface token). Each must reach 4.5:1.
TEXT_PAIRS = [
    ("primary-text-color", "card-background-color"),
    ("secondary-text-color", "card-background-color"),
    ("state-active-color", "card-background-color"),
    ("error-color", "card-background-color"),
    ("warning-color", "card-background-color"),
    ("success-color", "card-background-color"),
    ("info-color", "card-background-color"),
    ("ha-color-text-primary", "ha-color-form-background"),
    ("ha-color-text-secondary", "ha-color-form-background"),
    ("input-ink-color", "input-fill-color"),
    ("text-primary-color", "primary-color"),
]
# Energy colours and the "on" look of switches and sliders are graphics, so 3:1
# on the card is enough.
GRAPHIC_PAIRS = [(k, "card-background-color") for k in (
    "energy-solar-color", "energy-grid-consumption-color", "energy-battery-out-color",
    "switch-checked-color", "slider-color", "slider-bar-color")]

# Every theme has glass cards except Compact (blur costs performance on wall tablets).
GLASS_THEMES = {f"Nova {label}" for label in LABELS.values()} | {"Nova"}

HEX = re.compile(r"^#[0-9a-fA-F]{6}$")


def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    x, y = sorted((lum(a), lum(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


def mode_block(theme):
    modes = theme.get("modes") or {}
    return modes.get("dark") or modes.get("light") or {}


def get_top(theme, block, key):
    return block.get(key, theme.get(key))


def main():
    errors = []
    if not THEME_FILE.exists():
        print(f"FAIL: {THEME_FILE} not found")
        return 1
    text = THEME_FILE.read_text()
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError as e:
        print(f"FAIL: YAML does not parse: {e}")
        return 1

    # An unquoted hex colour starts a YAML comment, so the value parses as None.
    def empty_values(node, path):
        if isinstance(node, dict):
            for k, v in node.items():
                if v is None:
                    errors.append(f"{path}{k}: empty value (unquoted hex colour?)")
                else:
                    empty_values(v, f"{path}{k} > ")
    empty_values(data, "")

    for name in EXPECTED:
        if name not in data:
            errors.append(f"missing theme: {name}")

    for key, label in LABELS.items():
        name = f"Nova {label}"
        theme = data.get(name)
        if not theme:
            continue
        modes = theme.get("modes") or {}
        want = "dark" if key in DARK else "light"
        other = "light" if want == "dark" else "dark"
        if want not in modes:
            errors.append(f"{name}: needs a `modes: {want}:` block")
        if other in modes:
            errors.append(f"{name}: must be {want}-only, but declares `{other}`")
        block = modes.get(want) or {}
        if get_top(theme, block, "ha-card-header-font-family") != get_top(theme, block, "ha-font-family-heading"):
            errors.append(f"{name}: card titles must use the heading font (ha-card-header-font-family)")
        for tok in REQUIRED:
            if tok not in block and tok not in theme:
                errors.append(f"{name}: missing token {tok}")
        get = lambda t: block.get(t, theme.get(t))
        for fg, bg in TEXT_PAIRS:
            a, b = get(fg), get(bg)
            if not (isinstance(a, str) and HEX.match(a) and isinstance(b, str) and HEX.match(b)):
                continue  # missing tokens are reported above
            r = contrast(a, b)
            if r < 4.5:
                errors.append(f"{name}: {fg} on {bg} is {r:.2f}:1 (needs 4.5)")
        for fg, bg in GRAPHIC_PAIRS:
            a, b = get(fg), get(bg)
            if isinstance(a, str) and HEX.match(a) and isinstance(b, str) and HEX.match(b):
                r = contrast(a, b)
                if r < 3:
                    errors.append(f"{name}: {fg} on {bg} is {r:.2f}:1 (needs 3)")

    # Glass cards: only Deep Teal (and its alias) have them for now. The glass needs an
    # ambient background to sit over, a fallback, and a reset for nested cards.
    for name, theme in data.items():
        mode_vals = mode_block(theme)
        css = theme.get("card-mod-card", "")
        if name in GLASS_THEMES:
            if mode_vals.get("lovelace-background", "").count("radial-gradient") < 3:
                errors.append(f"{name}: lovelace-background needs the ambient glow (3 radial gradients)")
            for needle in ("backdrop-filter", "@supports", ":host-context(ha-card) ha-card"):
                if needle not in css:
                    errors.append(f"{name}: card-mod-card is missing {needle}")
            # Cards are translucent, so text sits on the card blended with the page.
            m = re.search(r"var\(--card-background-color\) (\d+)%", css)
            card, page = mode_vals.get("card-background-color"), mode_vals.get("primary-background-color")
            if m and card and page and HEX.match(card) and HEX.match(page):
                a = int(m.group(1)) / 100
                eff = "#" + "".join(f"{round(int(card[i:i+2], 16) * a + int(page[i:i+2], 16) * (1 - a)):02x}" for i in (1, 3, 5))
                for fg in ("primary-text-color", "secondary-text-color", "state-active-color"):
                    c = mode_vals.get(fg)
                    if c and HEX.match(c) and contrast(c, eff) < 4.5:
                        errors.append(f"{name}: {fg} on the glass card is {contrast(c, eff):.2f}:1 (needs 4.5)")
        elif "backdrop-filter" in css:
            errors.append(f"{name}: glass is not enabled for this theme")

    # Sidebar pill, header bar and tile states: every theme has them. The header only
    # blurs where cards do (not on Compact).
    for name, theme in data.items():
        side, root, card = theme.get("card-mod-sidebar", ""), theme.get("card-mod-root", ""), theme.get("card-mod-card", "")
        if "ha-list-item-button" not in side or ".selected" not in side:
            errors.append(f"{name}: card-mod-sidebar must style the selected sidebar item")
        if "border-radius: 12px !important" not in side or "margin: 2px 10px !important" not in side:
            errors.append(f"{name}: sidebar pill radius and margin need !important (Home Assistant's own styles win otherwise)")
        if ".header" not in root:
            errors.append(f"{name}: card-mod-root must style the header bar")
        if ":has(" not in card or ":active" not in card:
            errors.append(f"{name}: card-mod-card must have tile hover and press states")
        if name in GLASS_THEMES and "backdrop-filter" not in root:
            errors.append(f"{name}: header bar should be frosted like the cards")
        if name in GLASS_THEMES and "backdrop-filter: blur(16px) saturate(1.3) !important" not in root:
            errors.append(f"{name}: header blur needs !important (Home Assistant's own header styles win otherwise)")
        if name not in GLASS_THEMES and "backdrop-filter" in root:
            errors.append(f"{name}: header bar must not blur on this theme")

    # "Nova" is an alias of Deep Teal, so dashboards and profiles that still name
    # the old single theme keep working.
    alias, deep = data.get("Nova"), data.get("Nova Deep Teal")
    if alias and deep:
        same = lambda t: {k: v for k, v in t.items() if k not in ("card-mod-theme", "card-mod-card")}
        if same(alias) != same(deep):
            errors.append("Nova: must match Nova Deep Teal (it is its alias)")
        if alias.get("card-mod-theme") != "Nova":
            errors.append("Nova: card-mod-theme must be \"Nova\"")

    if errors:
        print(f"FAIL: {len(errors)} problem(s)")
        for e in errors[:60]:
            print("  -", e)
        if len(errors) > 60:
            print(f"  ... and {len(errors) - 60} more")
        return 1
    print(f"OK: {len(EXPECTED)} themes pass")
    return 0


if __name__ == "__main__":
    sys.exit(main())
