---
name: highimpact-publisher
description: Integrate highimpact.js on a publisher website — wrapper and Slot API setup, format integrations (layout changes for Topscroll, Midscroll, Welcome Page, Double Midscroll), GAM/Xandr connection, lifecycle events and publisher-side messaging. Use when adding, configuring or debugging high-impact ad formats on a site that loads highimpact.js.
---

# highimpact.js — publisher integration

You are helping a publisher put high-impact ad formats on their site with
highimpact.js. Work from the documentation that ships with the version
installed in this project, not from memory.

## 1. Find the installed release

This skill may be newer or older than the package in the project, so locate the
installed documentation first:

1. Look for `node_modules/highimpact.js/package.json` in the current directory,
   then in each parent directory (workspaces often hoist it to the repository
   root). If `AGENTS.md` or `CLAUDE.md` has a `highimpact.js` block, it already
   names the path.
2. If that fails, run `npx --no-install highimpact.js info`. It prints the
   version and absolute paths of the installed package and its docs.
3. Read the `version` from that `package.json`, then read `ai/index.md` next to
   it. It routes to the guides (`www/docs/`), generated API reference
   (`www/api/`) and type declarations (`dist/**/*.d.ts`) for that version.

If the package is not installed, say so and ask whether to install it
(`npm install highimpact.js`) before writing code. Only fall back to
<https://gethighimpact.org/docs/> if the user does not want it installed, and
warn that the website documents the latest release.

When this skill and the installed docs disagree, follow the installed docs and
types.

## 2. Choose the integration style

Read `www/docs/tutorial/publisher.md` and confirm with the user, or infer from
their code:

- **Loading:** npm import (bundler sites), self-hosted bundle, or jsDelivr CDN.
  Pin CDN URLs to the installed version.
- **API:** the default `highimpact.js` entry (Slot API: `defineSlot`,
  `setConfig`, `setTemplateConfig`, `window.highImpactJs.cmd`) or the lean
  `highimpact.js/advantage` core (wrapper API only, plus the optional
  `highimpact.js/advantage/gam` bridge). Use the default entry if the site calls
  `defineSlot` or uses `window.highImpactJs`.
- **Ad server:** GAM, Xandr, or none. See `www/docs/migration/api.md` for
  plugins and slot matching.

## 3. Implement

- Mark slots with `defineSlot` (or wrap them in `<advantage-wrapper>`). Check
  `SlotConfig` fields and template names in `www/docs/migration/api.md`.
- Configure `formatIntegrations` through `Advantage.getInstance().configure()`
  for every format the site accepts. `setup` makes the layout room the format
  needs (sticky headers, container padding, full-bleed width) and resolves its
  promise; `close` and `reset` undo exactly what `setup` changed. Inspect the
  site's real DOM and CSS for selectors; do not invent them.
- Read the page in `www/docs/formats/` for each format involved, especially
  the Double Midscroll pages for origin and waypoint settings.
- Subscribe to `advantage:format-start`, `advantage:format-close` and
  `advantage:format-reset` for side effects such as pausing video or hiding
  sticky elements.
- For format-agnostic one-tag creatives on the lean core, configure
  `formatAgnosticCreatives.formatMappings` and connect the GAM bridge.

Check names and signatures against `dist/types/index.d.ts`,
`dist/advantage/index.d.ts` or `dist/advantage/core.d.ts` before using them.

## 4. Verify

- Run the project's type check and build.
- If possible, load a page with a test creative (see
  `www/docs/tutorial/creative.md` for a minimal `AD_RENDERED` creative) and
  confirm the format starts, closes and resets without leaving layout changes
  behind.
- Tell the user which highimpact.js version the integration targets and which
  docs you relied on.

## Debugging checklist

- Nothing happens: the slot ID does not match `adUnitId`/`targetId`, the
  rendered size is not in `sizes`, or `waitForAdSignal` is set but the creative
  never sends its signal.
- Format starts but the page looks broken: a `setup` integration is missing or
  targets the wrong element.
- Layout stays changed after closing: `close`/`reset` do not undo `setup`.
- Two copies of the library on one page: see "Multiple bundles in one window"
  in `www/docs/migration/from-advantage.md`.
