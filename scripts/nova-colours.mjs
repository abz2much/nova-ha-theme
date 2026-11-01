// Nova's colour maths, copied from the Nova panel (frontend/src/panel/themes.js,
// Nova 8.83.1) so this repo builds on its own. If Nova's themes change, copy the
// seeds and `themeBuild` again, then run scripts/generate-theme.mjs.
// Each theme is two seed colours, a base and an accent; themeBuild works out
// every other token from them.

export const THEME_LOGS = { "log-conv": "#5fd0e0", "log-reply": "#4fb8ff", "log-local": "#5fbf7a", "log-learn": "#8fd15c", "log-auto": "#ffb454", "log-mode": "#c9a0ff", "log-config": "#9d8cff", "log-classify": "#9d8cff", "log-camera": "#5fbf7a", "log-energy": "#ffcf6a", "log-bio": "#ff8fc7", "log-offer": "#ffd27a", "log-safety": "#ff8a8a", "log-error": "#ff6b81", "log-voice": "#7fe0c4" };

export const SEEDS = {
    deep_teal: { label: "Deep Teal", style: "dark", base: "#03313A", accent: "#8FFFE0" },
    midnight_signal: { label: "Midnight Signal", style: "dark", base: "#0B132B", accent: "#39FF88" },
    plum_dusk: { label: "Plum Dusk", style: "dark", base: "#1A0B2E", accent: "#FFB7A5" },
    cocoa_bark: { label: "Cocoa Bark", style: "dark", base: "#382A28", accent: "#C1A094" },
    forest_mint: { label: "Forest Mint", style: "dark", base: "#18251D", accent: "#B7FF72" },
    slate_harbour: { label: "Slate Harbour", style: "dark", base: "#11212D", accent: "#9BA8AB" },
    // Light themes (8.80.0). Classic is Oriel's warm stone and sage look,
    // with its own page and text colour.
    classic: { label: "Classic", style: "light", base: "#A99A8C", accent: "#B9DC8A", page: ["#CBBDAE", "#A99A8C", "#8A7B6E"], ink: "#1F1A17" },
    violet_mist: { label: "Violet Mist", style: "light", base: "#F0F2F5", accent: "#7A35FF" },
    berry_sky: { label: "Berry Sky", style: "light", base: "#E0F2FE", accent: "#C2185B" },
    quantum_ice: { label: "Quantum Ice", style: "light", base: "#DFF7FF", accent: "#2457FF" },
    pine_mist: { label: "Pine Mist", style: "light", base: "#DAF1DE", accent: "#235347", depth: 1.3 },
    ember: { label: "Ember", style: "light", base: "#FFFCF4", accent: "#FF6115" },
};

export function themeBuild(def) {
    const hex = h => { h = String(h).replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
    const toHex = c => "#" + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    // Step c towards `to` until it reaches `ratio` on every surface given.
    const reach = (c, surfaces, ratio, to) => {
      for (let t = 0; t <= 1; t += 0.02) { const x = mix(c, to, t); if (surfaces.every(s => contrast(x, s) >= ratio)) return x; }
      return to;
    };
    const W = [255, 255, 255], K = [0, 0, 0];
    const B = hex(def.base), A = hex(def.accent), dark = def.style !== "light";
    // Solar and home keep their colours in every theme.
    const SOLAR = hex("#facc15"), HOME = hex("#60a5fa"), GRID = hex("#94a3b8");
    const on = [W, mix(A, K, 0.85)].sort((x, y) => contrast(y, A) - contrast(x, A))[0];
    let t;
    if (dark) {
      // The page: a gradient of the base, lit near the top.
      const page = [mix(B, W, 0.07), B, mix(B, K, 0.35)];
      const pageRep = mix(page[1], page[2], 0.3);
      // The lightest glass that keeps near-white text readable on cards and cells.
      let g = 0.4, glass, surface, cell, ink;
      for (; g >= 0.06; g -= 0.02) {
        glass = mix(B, W, g); surface = mix(pageRep, glass, 0.2); cell = mix(surface, glass, 0.34);
        ink = mix(W, B, 0.06);
        if ([surface, cell].every(s => contrast(mix(s, ink, 0.62), s) >= 4.6)) break;
      }
      const cards = [surface, cell];
      const GOOD = hex("#8fdc9c"), WARN = hex("#f4c860"), BAD = hex("#ff9a86"), BAD_STRONG = hex("#ff6a58");
      const alarmBg = mix(mix(B, K, 0.45), BAD_STRONG, 0.42);
      t = {
        page: `radial-gradient(1100px 700px at 46% 0%,${toHex(mix(B, W, 0.18))}99,transparent 62%),radial-gradient(800px 600px at 92% 100%,${toHex(A)}12,transparent 70%),linear-gradient(160deg,${toHex(page[0])} 0%,${toHex(page[1])} 55%,${toHex(page[2])} 100%)`,
        bg: page[1], glass, "glass-hi": "22%", "glass-lo": "12%", shadow: mix(B, K, 0.75),
        surface, "surface-2": cell, "line-soft": mix(surface, glass, 0.9),
        ink, "ink-dim": reach(mix(cell, ink, 0.84), cards, 4.6, ink), "ink-faint": reach(mix(cell, ink, 0.58), cards, 4.6, ink),
        gold: reach(A, cards, 4.6, W), "gold-pale": mix(A, W, 0.45),
        warn: reach(WARN, cards, 4.6, W), good: reach(GOOD, cards, 4.6, W), "good-ink": reach(mix(GOOD, W, 0.25), cards, 4.6, W),
        bad: reach(BAD, cards, 4.6, W), "bad-strong": BAD_STRONG, "bad-ink": reach(mix(BAD, W, 0.3), cards, 4.6, W),
        "alarm-bg": alarmBg, "alarm-line": BAD_STRONG, "alarm-ink": reach(hex("#ffe4e8"), [alarmBg], 4.6, W),
        info: reach(hex("#7cb8ff"), cards, 4.6, W),
        "dark-a": mix(B, K, 0.45), black: mix(B, K, 0.8), "on-dark": mix(W, B, 0.03),
        "orb-deep": mix(A, B, 0.6), "media-bg": mix(B, K, 0.8), "glow-top": mix(B, W, 0.16), "hero-end": mix(B, K, 0.2),
      };
      t.head = { deep: mix(A, B, 0.6), pale: mix(A, W, 0.65) };
    } else {
      // Light: white glass over a page shaded from the base towards a deep
      // shade of its own hue, and near-black text.
      const depth = def.depth || 1, deep = mix(B, K, 0.72);
      const page = def.page ? def.page.map(hex) : [mix(B, deep, 0.09 * depth), mix(B, deep, 0.21 * depth), mix(B, deep, 0.34 * depth)];
      const pageRep = mix(page[1], page[2], 0.3);
      const surface = mix(pageRep, W, 0.64), cell = mix(surface, W, 0.34), cards = [surface, cell];
      const ink = def.ink ? hex(def.ink) : mix(K, B, 0.12);
      const GOOD = hex("#3f6a1c"), WARN = hex("#7a5200"), BAD = hex("#9a3a1d"), BAD_STRONG = hex("#c0392b");
      const alarmBg = hex("#ffd9cf");
      t = {
        page: `radial-gradient(1100px 700px at 46% 0%,#ffffffb3,transparent 62%),radial-gradient(800px 600px at 92% 100%,${toHex(mix(B, deep, 0.5))}a6,transparent 70%),linear-gradient(160deg,${toHex(page[0])} 0%,${toHex(page[1])} 55%,${toHex(page[2])} 100%)`,
        bg: page[1], glass: W, "glass-hi": "72%", "glass-lo": "56%", shadow: mix(deep, K, 0.3),
        surface, "surface-2": cell, "line-soft": mix(surface, ink, 0.14),
        ink, "ink-dim": reach(mix(cell, ink, 0.84), cards, 4.6, ink), "ink-faint": reach(mix(cell, ink, 0.58), cards, 4.6, ink),
        gold: reach(A, cards, 4.6, K), "gold-pale": reach(mix(A, K, 0.2), cards, 4.6, K),
        warn: reach(WARN, cards, 4.6, K), good: reach(GOOD, cards, 4.6, K), "good-ink": reach(mix(GOOD, K, 0.15), cards, 4.6, K),
        bad: reach(BAD, cards, 4.6, K), "bad-strong": BAD_STRONG, "bad-ink": reach(mix(BAD, K, 0.15), cards, 4.6, K),
        "alarm-bg": alarmBg, "alarm-line": BAD_STRONG, "alarm-ink": reach(hex("#8a2a12"), [alarmBg], 4.6, K),
        info: reach(hex("#2563eb"), cards, 4.6, K),
        "dark-a": mix(A, K, 0.8), black: mix(A, K, 0.93), "on-dark": W,
        "orb-deep": mix(A, K, 0.4), "media-bg": mix(A, K, 0.93), "glow-top": W, "hero-end": mix(B, deep, 0.1),
      };
      t.head = { deep: mix(A, K, 0.45), pale: mix(A, W, 0.55) };
    }
    const cards = [t.surface, t["surface-2"]];
    for (const [k, v] of Object.entries(THEME_LOGS)) t[k] = reach(hex(v), cards, 4.6, dark ? W : K);
    Object.assign(t, { ember: A, "on-accent": on, "c-solar": SOLAR, "c-grid": GRID, "c-house": HOME, "c-battery": A });
    const unit = c => c.map(v => +(v / 255).toFixed(3));
    const head = { main: unit(A), deep: unit(t.head.deep), pale: unit(t.head.pale) };
    delete t.head;
    const tokens = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Array.isArray(v) ? toHex(v) : v]));
    return { tokens, head, math: { hex, toHex, mix, contrast, reach, W, K } };
}
