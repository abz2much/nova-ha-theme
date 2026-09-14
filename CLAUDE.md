# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Home Assistant frontend theme, distributed as a HACS custom repository (category: Theme). It's a single YAML file (`themes/nova.yaml`) that maps color/typography tokens onto Home Assistant's theme variable surface — there's no build step, no compiler, no tests to run.

## Repo layout

- `themes/nova.yaml` — the theme itself, under the top-level key `Nova:`. Defined flat (no `modes:` block), so it applies the same regardless of the user's light/dark profile preference — this is a deliberately dark-only theme.
- `hacs.json` — HACS theme-repo manifest.
- `README.md` — install instructions (HACS + manual), the required font-loading step, and scope/upkeep notes.

## Source of truth for the palette

Every color in `themes/nova.yaml` is copied from the CSS custom properties in the Nova Home Assistant integration's own panel — `custom_components/nova/frontend/nova-panel-new.js`, in the sibling `nova` repo (`~/Documents/Dev Env/nova`), inside its `_css()` method's `:host{...}` block. Each theme variable carries a comment naming which Nova token it came from (e.g. `# --ember`), or `# derived:` when a value had to be computed (a darkened/lightened primary, an alpha-blended track color) rather than copied directly.

When Nova's own panel palette changes, re-diff `themes/nova.yaml` against that `:host{...}` block and update values (and their comments) to match — that file is the only source of truth, not this repo's own history.

## Working on the theme

- YAML hex colors must stay quoted (`"#e2542f"`) — an unquoted `#` starts a YAML comment and silently truncates the value.
- Validate the file parses before committing: `python3 -c "import yaml; yaml.safe_load(open('themes/nova.yaml'))"`.
- There's no live-reload harness here; testing a change means copying `themes/nova.yaml` into a real Home Assistant instance's `config/themes/` (or pointing HACS at this repo) and reloading themes from Developer Tools → YAML → Themes.
- Home Assistant themes can't fetch web fonts on their own — the theme sets `primary-font-family` (Manrope) and `code-font-family` (IBM Plex Mono), but those only render if the Google Fonts CSS is also registered as a Lovelace resource (documented in README.md). Don't assume a font change here will show up without that resource also being added on the HA side.
- Nova's own panel uses Fraunces for display headings, but Home Assistant's theme variables have no heading-font hook to attach it to — this is a known, intentional gap, not an oversight to "fix."
