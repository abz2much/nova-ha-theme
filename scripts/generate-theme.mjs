#!/usr/bin/env node
// Writes themes/nova.yaml from the 12 Nova seed colours. Run: node scripts/generate-theme.mjs
// Do not edit themes/nova.yaml by hand; change this file and run it again.
import { writeFileSync } from "node:fs";
import { SEEDS, themeBuild } from "./nova-colours.mjs";

const OUT = new URL("../themes/nova.yaml", import.meta.url);

const FONT_BODY = "'Manrope', -apple-system, 'Segoe UI', sans-serif";
const FONT_HEADING = "'Fraunces', Georgia, serif";
const FONT_CODE = "'IBM Plex Mono', 'SF Mono', monospace";

const SHAPE = {
  regular: { title: "22px", card: "16px", lg: "14px", xl: "20px", scale: null, space: null },
  compact: { title: "19px", card: "12px", lg: "10px", xl: "14px", scale: "0.92", space: { 2: "6px", 3: "9px", 4: "12px", 5: "15px", 6: "18px" } },
};

function themeEntries(seed, shape) {
  const built = themeBuild(seed);
  const k = built.tokens;
  const { hex, toHex, mix, reach, W, K } = built.math;
  const dark = seed.style !== "light";
  const A = hex(k.ember), ink = hex(k.ink), surface = hex(k.surface), cell = hex(k["surface-2"]);
  const to = dark ? W : K;
  const alpha = (c, a) => toHex(c) + a;
  // Energy colours are graphics: 3:1 on the card, stepped the way the panel steps its text.
  const g = c => toHex(reach(typeof c === "string" ? hex(c) : c, [surface], 3, to));
  const e = (key, value, comment = "") => [key, value, comment];

  return [
    ["Core palette", [
      e("primary-color", k.ember, "accent seed"),
      e("accent-color", k.gold, "accent as text"),
      e("dark-primary-color", toHex(mix(A, K, 0.2)), "derived: accent, darkened"),
      e("light-primary-color", toHex(mix(A, W, 0.3)), "derived: accent, lightened"),
      e("primary-background-color", k.bg, "page"),
      e("secondary-background-color", k.surface, "surface"),
      e("divider-color", k["line-soft"], "line-soft"),
      e("lovelace-background", k.page, "page gradient"),
      e("primary-text-color", k.ink, "ink"),
      e("secondary-text-color", k["ink-dim"], "ink-dim"),
      e("disabled-text-color", k["ink-faint"], "ink-faint"),
      e("text-primary-color", k["on-accent"], "text on the accent"),
    ]],
    ["Sidebar", [
      e("sidebar-background-color", k.surface),
      e("sidebar-text-color", k["ink-dim"]),
      e("sidebar-icon-color", k["ink-dim"]),
      e("sidebar-selected-background-color", k["surface-2"]),
      e("sidebar-selected-icon-color", k.gold),
      e("sidebar-selected-text-color", k.gold),
      e("sidebar-divider-color", k["line-soft"]),
      e("sidebar-badge-text-color", k["on-accent"]),
    ]],
    ["App header", [
      e("app-header-background-color", k.surface),
      e("app-header-text-color", k.ink),
      e("app-header-edit-background-color", k["surface-2"]),
    ]],
    ["Cards and dialogs", [
      e("card-background-color", k.surface),
      e("ha-card-background", k.surface),
      e("ha-card-border-color", k["line-soft"]),
      e("ha-card-box-shadow", `0 8px 24px -14px ${k.shadow}`),
      e("ha-card-header-color", k.ink),
      e("dialog-background-color", k.surface),
      e("mdc-dialog-scrim-color", alpha(mix(hex(k.bg), K, 0.5), "cc"), "derived: page, darkened"),
    ]],
    ["Text fields and selects (card editors, form dialogs)", [
      e("input-fill-color", k["surface-2"]),
      e("input-disabled-fill-color", k.surface),
      e("input-ink-color", k.ink),
      e("input-label-ink-color", k["ink-dim"]),
      e("input-disabled-ink-color", k["ink-faint"]),
      e("input-idle-line-color", k["line-soft"]),
      e("input-hover-line-color", k.gold),
      e("input-outlined-idle-border-color", k["line-soft"]),
      e("input-outlined-hover-border-color", k.gold),
      e("input-outlined-disabled-border-color", k["line-soft"]),
      e("input-dropdown-icon-color", k["ink-dim"]),
    ]],
    ["Form fields in newer components (ha-color tokens)", [
      e("ha-color-form-background", k["surface-2"]),
      e("ha-color-form-background-hover", toHex(mix(cell, ink, 0.07)), "derived: field, towards text"),
      e("ha-color-form-background-disabled", k.surface),
      e("ha-color-text-primary", k.ink),
      e("ha-color-text-secondary", k["ink-dim"]),
      e("ha-color-text-disabled", k["ink-faint"]),
      e("ha-color-text-link", k.gold),
      e("ha-color-focus", k.gold),
      e("ha-color-fill-primary-loud-resting", k.ember),
      e("ha-color-fill-primary-loud-hover", toHex(mix(A, to, 0.14)), "derived: accent, towards contrast"),
      e("ha-color-fill-primary-loud-active", toHex(mix(A, to, 0.24)), "derived: accent, towards contrast"),
      e("ha-color-on-primary-loud", k["on-accent"]),
      e("ha-color-fill-primary-normal-resting", toHex(mix(surface, A, 0.22)), "derived: surface and accent"),
      e("ha-color-on-primary-normal", k.gold),
      e("ha-color-fill-primary-quiet-resting", toHex(mix(surface, A, 0.1)), "derived: surface and accent"),
      e("ha-color-on-primary-quiet", k.gold),
      e("ha-color-border-primary-normal", k.ember),
      e("ha-color-fill-neutral-quiet-resting", toHex(mix(surface, ink, 0.04)), "derived: surface, towards text"),
      e("ha-color-fill-neutral-quiet-hover", k["surface-2"]),
      e("ha-color-fill-neutral-normal-resting", k["line-soft"]),
      e("ha-color-fill-neutral-loud-resting", k["ink-faint"]),
      e("ha-color-border-neutral-quiet", k["line-soft"]),
      e("ha-color-border-neutral-normal", k["ink-faint"]),
      e("ha-color-border-neutral-loud", k["ink-dim"]),
      e("ha-color-on-neutral-quiet", k["ink-dim"]),
      e("ha-color-on-neutral-normal", k.ink),
      e("ha-color-on-neutral-loud", k.ink),
    ]],
    ["Switches, sliders and Material components", [
      e("switch-checked-color", g(k.ember), "accent, stepped to 3:1 so it shows on the card"),
      e("switch-checked-button-color", k["on-accent"]),
      e("switch-checked-track-color", alpha(hex(g(k.ember)), "66"), "derived: stepped accent at 40%"),
      e("switch-unchecked-button-color", k["ink-faint"]),
      e("switch-unchecked-track-color", k["line-soft"]),
      e("slider-color", g(k.ember), "accent, stepped to 3:1"),
      e("slider-secondary-color", k["line-soft"]),
      e("slider-bar-color", g(k.ember), "accent, stepped to 3:1"),
      e("mdc-theme-primary", k.ember),
      e("mdc-theme-secondary", k.gold),
      e("mdc-theme-surface", k.surface),
      e("mdc-theme-background", k.bg),
      e("mdc-theme-on-primary", k["on-accent"]),
      e("mdc-theme-on-secondary", k["on-accent"]),
      e("mdc-theme-on-surface", k.ink),
    ]],
    ["State and semantic colours", [
      e("state-icon-color", k["ink-dim"]),
      e("state-icon-active-color", k.gold),
      e("state-active-color", k.gold),
      e("state-inactive-color", k["ink-faint"]),
      e("state-unavailable-color", k["ink-faint"]),
      // HA colours climate and other domain states through these Material names.
      e("blue-color", k.info, "climate cool"),
      e("deep-orange-color", k.bad, "climate heat"),
      e("orange-color", k.warn, "climate dry"),
      e("cyan-color", k.info, "climate fan only"),
      e("green-color", k.good, "climate auto"),
      e("amber-color", k.gold, "climate heat and cool"),
      e("error-color", k.bad),
      e("warning-color", k.warn),
      e("success-color", k.good),
      e("info-color", k.info),
    ]],
    ["Energy dashboard", [
      e("energy-solar-color", g(k["c-solar"]), "c-solar, stepped to 3:1"),
      e("energy-grid-consumption-color", g(k["c-grid"]), "c-grid, stepped to 3:1"),
      e("energy-grid-return-color", g(k.info), "info, stepped to 3:1"),
      e("energy-battery-out-color", g(k["c-battery"]), "c-battery, stepped to 3:1"),
      e("energy-battery-in-color", g(k.good), "good, stepped to 3:1"),
    ]],
    ["Label badges and tables", [
      e("label-badge-red", k.bad),
      e("label-badge-yellow", k.warn),
      e("label-badge-green", k.good),
      e("label-badge-blue", k.info),
      e("label-badge-grey", k["ink-faint"]),
      e("label-badge-background-color", k.surface),
      e("label-badge-text-color", k.ink),
      e("table-row-background-color", k.surface),
      e("table-row-alternative-background-color", toHex(mix(surface, hex(k.bg), 0.5)), "derived: surface and page"),
    ]],
    ["RGB variants (opacity-aware components)", [
      ["primary-color", "ember"], ["accent-color", "gold"], ["primary-background-color", "bg"],
      ["secondary-background-color", "surface"], ["card-background-color", "surface"],
      ["primary-text-color", "ink"], ["secondary-text-color", "ink-dim"], ["disabled-text-color", "ink-faint"],
      ["state-inactive-color", "ink-faint"], ["error-color", "bad"], ["warning-color", "warn"],
      ["success-color", "good"], ["info-color", "info"],
    ].map(([name, tok]) => e("rgb-" + name, hex(k[tok]).join(", "), tok))],
  ].map(([title, list]) => [title, list]);
}

function cardMod(k) {
  return [
    "    ha-card {",
    "      position: relative;",
    "      overflow: hidden;",
    "      transition: box-shadow .25s ease, border-color .25s ease;",
    "    }",
    "    ha-card::before {",
    '      content: "";',
    "      position: absolute;",
    "      top: 0;",
    "      left: 0;",
    "      right: 0;",
    "      height: 3px;",
    `      background: linear-gradient(90deg, ${k.info}, ${k.gold} 55%, ${k.ember});`,
    "      opacity: .55;",
    "      pointer-events: none;",
    "    }",
    "    ha-card:hover {",
    `      border-color: ${k.ember}70;`,
    `      box-shadow: 0 0 18px 1px ${k.ember}22;`,
    "    }",
  ].join("\n");
}

const q = v => JSON.stringify(String(v));
const pad = (s, n, comment) => (comment ? s + " ".repeat(Math.max(1, n - s.length)) : s);

function themeYaml(name, seed, shapeName) {
  const shape = SHAPE[shapeName];
  const k = themeBuild(seed).tokens;
  const mode = seed.style === "light" ? "light" : "dark";
  const lines = [`${name}:`];
  const top = (key, value, comment = "") => lines.push("  " + pad(`${key}: ${q(value)}`, 46, comment) + (comment ? " # " + comment : ""));
  lines.push("  # Fonts, shape and card-mod: the same in any mode.");
  top("primary-font-family", FONT_BODY, "older cards and the frontend still read this");
  top("code-font-family", FONT_CODE);
  top("ha-font-family-body", FONT_BODY);
  top("ha-font-family-heading", FONT_HEADING, "Fraunces, as the panel's headings");
  top("ha-font-family-code", FONT_CODE);
  top("ha-font-weight-heading", "600");
  top("ha-card-header-font-family", FONT_HEADING, "card titles in Fraunces, no card-mod needed");
  top("ha-card-header-font-size", shape.title, "card title size");
  top("ha-font-weight-action", "600");
  if (shape.scale) top("ha-font-size-scale", shape.scale, "compact: smaller type");
  top("ha-card-border-radius", shape.card);
  top("ha-card-border-width", "1px");
  top("ha-border-radius-lg", shape.lg);
  top("ha-border-radius-xl", shape.xl);
  if (shape.space) for (const [n, v] of Object.entries(shape.space)) top(`ha-space-${n}`, v, "compact: tighter spacing");
  lines.push("", "  # card-mod (optional). Needs the card-mod or UIX HACS integration; Home Assistant ignores these keys without it.");
  top("card-mod-theme", name, "must repeat this theme's own name exactly");
  lines.push("  card-mod-card: |", cardMod(k), "", "  modes:", `    ${mode}:`);
  for (const [title, list] of themeEntries(seed, shape)) {
    lines.push(`      # === ${title} ===`);
    for (const [key, value, comment] of list) lines.push("      " + pad(`${key}: ${q(value)}`, 54, comment) + (comment ? " # " + comment : ""));
    lines.push("");
  }
  return lines.join("\n").replace(/\n+$/, "\n");
}

const header = `# Nova: a Home Assistant frontend theme, 12 colour themes from Nova's panel
#
# GENERATED by scripts/generate-theme.mjs. Do not edit by hand; change the
# generator and run it again (node scripts/generate-theme.mjs).
#
# Each theme is two seed colours, a base and an accent, taken from Nova's panel
# (frontend/src/panel/themes.js). The generator works out every other colour
# with the panel's own maths, and scripts/check_theme.py checks that text
# reaches 4.5:1 contrast on its card.
#
# Dark themes declare only a dark mode and light themes only a light mode, so
# Home Assistant layers its matching baseline underneath (this is what keeps
# card editor fields and dropdowns readable).
#
# Fonts need the Google Fonts resource in the README (Manrope, Fraunces and
# IBM Plex Mono). The card-mod keys are optional and are not validated by
# Home Assistant: check them by eye after a change.
`;

const blocks = [];
for (const [key, seed] of Object.entries(SEEDS)) blocks.push(themeYaml(`Nova ${seed.label}`, seed, "regular"));
blocks.push(themeYaml("Nova Deep Teal Compact", SEEDS.deep_teal, "compact"));
writeFileSync(OUT, header + "\n" + blocks.join("\n"));
console.log(`wrote ${blocks.length} themes to themes/nova.yaml`);
