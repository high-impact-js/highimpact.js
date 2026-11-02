# highimpact.js — guide for coding agents

This file ships inside the `highimpact.js` npm package. Every link below points
to documentation and type declarations from the **same release**, so prefer
them over web search, the live website, or the GitHub `main` branch, which may
describe newer APIs than the version installed in this project.

Check the installed version in `../package.json` (`version` field) before
writing code, and mention it when you explain an API choice.

## Pick your side

highimpact.js has two sides that talk to each other over `postMessage` /
`MessageChannel`:

| You are working on…                                                    | Side      | Start with                                                       |
| :--------------------------------------------------------------------- | :-------- | :--------------------------------------------------------------- |
| A website that shows ads (wrapper, slots, layout changes, GAM/Xandr)   | Publisher | [Publisher tutorial](../www/docs/tutorial/publisher.md)          |
| An ad creative (HTML5 banner) that asks the page for a high-impact format | Creative  | [Creative tutorial](../www/docs/tutorial/creative.md)            |

If a task touches both (for example a test page that hosts a creative), read
both tutorials.

## Entry points

Import from these package subpaths. Their declarations are the source of truth
for signatures.

| Import                         | Use                                                                     | Types                                                                                  |
| :----------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| `highimpact.js`                | Full publisher library: `Advantage`, Slot API (`defineSlot`, `setConfig`, `setTemplateConfig`) | [dist/advantage/index.d.ts](../dist/advantage/index.d.ts)                      |
| `highimpact.js/advantage`      | Lean publisher core (wrapper API, no Slot API or GAM/Xandr adapters)    | [dist/advantage/core.d.ts](../dist/advantage/core.d.ts)                               |
| `highimpact.js/advantage/gam`  | Optional GAM bridge for the lean core (`connectGoogleAdManager`)        | [dist/advantage/ad-servers/gam.d.ts](../dist/advantage/ad-servers/gam.d.ts)           |
| `highimpact.js/creative`       | Creative-side messenger (`AdvantageCreativeMessenger`)                  | [dist/advantage/messaging/creative-side.d.ts](../dist/advantage/messaging/creative-side.d.ts) |
| `highimpact.js/publisher`      | Publisher-side responder (`AdvantageAdSlotResponder`)                   | [dist/advantage/messaging/publisher-side.d.ts](../dist/advantage/messaging/publisher-side.d.ts) |
| `highimpact.js/types`          | Shared enums and interfaces (`AdvantageFormatName`, `AdvantageMessageAction`, config types) | [dist/types/index.d.ts](../dist/types/index.d.ts)                    |
| `highimpact.js/utils`          | Messaging and DOM helpers                                               | [dist/utils/index.d.ts](../dist/utils/index.d.ts)                                     |

Script-tag builds live in `../dist/bundles/` (`advantage.umd.js`,
`advantage-core.umd.js`, `advantage-core-gam.umd.js`,
`creative-side.iife.js`). The publisher tutorial explains which globals each
one exposes.

## Documentation map

Guides (maintained by hand):

- [Docs home and naming notes](../www/docs/index.md) — why APIs are still called `Advantage`.
- Concepts: [formats](../www/docs/concepts/formats.md), [wrapper](../www/docs/concepts/wrapper.md), [integrations](../www/docs/concepts/integration.md), [creative messaging](../www/docs/concepts/creative.md), [UI layer](../www/docs/concepts/ui-layer.md).
- Formats: [Topscroll](../www/docs/formats/topscroll.md), [Midscroll](../www/docs/formats/midscroll.md), [Welcome Page](../www/docs/formats/welcome_page.md), [Double Midscroll](../www/docs/formats/double_midscroll.md), [Double Midscroll Single Creative](../www/docs/formats/double_midscroll_single_creative.md).
- [Slot API reference](../www/docs/migration/api.md) — `defineSlot`, `setConfig`, `setTemplateConfig`, the command queue, and the post-message `AD_RENDERED` signal.
- Migration: [overview](../www/docs/migration/index.md), [from Advantage](../www/docs/migration/from-advantage.md), [from High Impact JS](../www/docs/migration/from-high-impact-js.md).
- [Hello World example](../www/docs/examples/hello-world.md).

API reference (generated from this release's source):

- [API index](../www/api/index.md)
- [`Advantage`](../www/api/classes/advantage_advantage.Advantage.md) — singleton, `configure()`, wrappers.
- [`AdvantageWrapper`](../www/api/classes/advantage_wrapper.AdvantageWrapper.md) — `<advantage-wrapper>`, `forceFormat`, `close`, `reset`.
- [`AdvantageCreativeMessenger`](../www/api/classes/advantage_messaging_creative_side.AdvantageCreativeMessenger.md) — creative sessions and messages.
- [`AdvantageAdSlotResponder`](../www/api/classes/advantage_messaging_publisher_side.AdvantageAdSlotResponder.md) — publisher-side message handling.
- [`AdvantageConfig`](../www/api/interfaces/types.AdvantageConfig.md) and [`AdvantageFormatIntegration`](../www/api/interfaces/types.AdvantageFormatIntegration.md).
- [`AdvantageFormatName`](../www/api/enums/types.AdvantageFormatName.md) and [`AdvantageMessageAction`](../www/api/enums/types.AdvantageMessageAction.md).

The guides use VitePress syntax (`::: code-group`, `{#anchors}`, site-absolute
links such as `/docs/...`). Site-absolute links map to `../www/docs/...` in this
package.

## Rules of thumb

- Element, event and class names still use the `Advantage` prefix
  (`<advantage-wrapper>`, `advantage:format-start`, `AdvantageFormatName`).
  Do not rename them.
- Format names are the `AdvantageFormatName` values (`TOPSCROLL`, `MIDSCROLL`,
  `WELCOME_PAGE`, `DOUBLE_MIDSCROLL`, `DOUBLE_MIDSCROLL_SINGLE_CREATIVE`).
  Slot API templates use lowercase names (`"topscroll"`, `"midscroll"`).
- When a guide and a `.d.ts` file disagree, trust the `.d.ts` file and tell the
  user the guide looks out of date.
- Pin CDN URLs to the installed version (`highimpact.js@<version>`) instead of
  copying the version in a guide.
