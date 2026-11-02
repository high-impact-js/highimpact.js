---
name: highimpact-creative
description: Build or debug an ad creative that uses highimpact.js — creative-side messaging with AdvantageCreativeMessenger, requesting and negotiating formats (Topscroll, Midscroll, Welcome Page, Double Midscroll), scroll progress and waypoints, and one-tag AD_RENDERED post-message banners. Use when writing HTML5 ad creatives that run inside a publisher's iframe and talk to highimpact.js.
---

# highimpact.js — creative development

You are helping build an ad creative that runs in an iframe on a publisher page
and talks to highimpact.js there. Work from the documentation that ships with
the version the creative uses, not from memory.

## 1. Find the release you are targeting

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

Creatives often load the library from a CDN instead of npm. If there is no
local install, check the version in the creative's
`cdn.jsdelivr.net/npm/highimpact.js@<version>/...` URL, and ask whether to
install that version as a dev dependency so you can read its docs and types.
Only fall back to <https://gethighimpact.org/docs/> if the user declines, and
warn that the website documents the latest release.

When this skill and the installed docs disagree, follow the installed docs and
types.

## 2. Choose the creative style

Read `www/docs/tutorial/creative.md`, then pick with the user:

- **Messaging creative:** uses `AdvantageCreativeMessenger` (from
  `highimpact.js/creative`, or `window.advantage` from
  `dist/bundles/creative-side.iife.js`) to start a session, request a format and
  react to publisher messages.
- **One-tag banner:** no library; the creative posts a single
  `{ sender: "high-impact-js", action: "AD_RENDERED" }` message and the
  publisher's slot configuration decides the format. See "Post-Message Ad
  Signal" in `www/docs/migration/api.md`.

## 3. Implement

- Start a session with `startSession()` and handle `false`: the creative is
  then not inside a highimpact.js page and must still render as a normal
  banner.
- Request the format with `AdvantageMessageAction.REQUEST_FORMAT` and an
  `AdvantageFormatName`. Only start the high-impact experience after
  `FORMAT_CONFIRMED`; handle `FORMAT_REJECTED` or no response by staying in the
  standard layout.
- Read the page for the target format in `www/docs/formats/`. Double Midscroll
  uses two files and waypoints; Double Midscroll Single Creative uses
  `SCROLL_PROGRESS` messages with a 0–1 progress value.
- Use `onMessage` for lifecycle messages and `setupWaypoints` /
  `listenToWaypoints` for cross-frame visibility when the format calls for it.
- Pin CDN script URLs to the targeted version.

Check message actions, format names and method signatures against
`dist/types/index.d.ts` and `dist/advantage/messaging/creative-side.d.ts`.

## 4. Verify

- Test in a page that hosts the creative in an iframe with highimpact.js
  loaded (see `www/docs/examples/hello-world.md` and the publisher tutorial).
- Confirm the creative behaves as a normal banner when no session starts or the
  format is refused.
- Tell the user which highimpact.js version the creative targets and which docs
  you relied on.

## Debugging checklist

- `startSession()` never resolves to a session: the page does not run
  highimpact.js, or the creative is in a nested iframe the publisher side does
  not see.
- Format is not confirmed: the publisher has not enabled that format for the
  slot, or the format name is misspelled; compare with `AdvantageFormatName`.
- One-tag banner does nothing: the message is not sent to `window.top`, the
  `sender`/`action` values are wrong, or the slot size does not match the
  publisher's `sizes`.
