---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Quick Start Guide</code></p>

# Publisher tutorial

This part of the tutorial is aimed at website owners and publishers who want to implement High Impact JS on their site(s).

## Step 1: Add High Impact JS to your site {#installation}

There are three ways to consume the library. They all expose the same API — pick the one that fits how your site is built.

| Method | Best for | Build step |
| :----- | :------- | :--------- |
| [npm package](#install-npm) | Sites with a bundler (Vite, webpack, Rollup) or a framework (React, Vue, etc.) | Yes |
| [Self-hosted from your own domain](#install-self-hosted) | AdOps/publishers who want full control and no third-party request | No |
| [jsDelivr CDN](#install-cdn) | The fastest, lowest-code way to get started | No |

### Option A — npm package {#install-npm}

Install the package with your package manager of choice:

::: code-group

```sh [npm]
$ npm i highimpact.js
```

```sh [pnpm]
$ pnpm add highimpact.js
```

```sh [yarn]
$ yarn add highimpact.js
```

```sh [bun]
$ bun i highimpact.js
```

:::

Then import it where you need it:

```ts
import { Advantage } from "highimpact.js";
```

Publishers that only use the Advantage wrapper API can select the smaller core
entry point. It excludes the High Impact JS Slot API and the GAM/Xandr
compatibility adapters, while retaining the Advantage creative messaging
protocol and opt-in support for format-agnostic creatives. This new entry point
and its format-agnostic creative configuration are experimental while
publishers evaluate the API:

```ts
import { Advantage } from "highimpact.js/advantage";
```

Use the default `highimpact.js` entry if the site calls `defineSlot` or uses the
`window.highImpactJs` API. The core entry can receive one-tag creatives that
send `AD_RENDERED` when configured with a size-to-format mapping and an
ad-server render reporter.

For GAM, import the small optional bridge and map the booked sizes to formats:

```ts
import { Advantage, AdvantageFormatName } from "highimpact.js/advantage";
import { connectGoogleAdManager } from "highimpact.js/advantage/gam";

const advantage = Advantage.getInstance();
advantage.configure({
    formatAgnosticCreatives: {
        formatMappings: [
            { format: AdvantageFormatName.TopScroll, sizes: [[1, 1]] },
            { format: AdvantageFormatName.Midscroll, sizes: [[1, 2]] }
        ]
    }
});
connectGoogleAdManager(advantage);
```

This uses the size reported by GAM's `slotRenderEnded` event, not the rendered
iframe dimensions.

With the npm package you call the API directly on the imported `Advantage` instance — you don't need the `window.highImpactJs` command queue described below.

### Option B — Self-hosted from your own domain {#install-self-hosted}

If you'd rather not depend on a third-party CDN, serve the bundle from your own domain. Grab `dist/bundles/advantage.umd.cjs` from the [npm package](https://www.npmjs.com/package/highimpact.js) (or build it from source), upload it to your server, and load it with a `<script>` tag:

```html
<script src="https://www.your-domain.com/scripts/advantage.umd.cjs"></script>
```

For an Advantage-only installation, use
`dist/bundles/advantage-core.umd.cjs` instead. To support format-agnostic
creatives with GAM, load the optional bridge after the core bundle and configure
the globals after both scripts have loaded:

```html
<script src="https://www.your-domain.com/scripts/advantage-core.umd.cjs"></script>
<script src="https://www.your-domain.com/scripts/advantage-core-gam.umd.cjs"></script>
<script>
    const advantageInstance = advantage.Advantage.getInstance();
    advantageInstance.configure({
        formatAgnosticCreatives: {
            formatMappings: [
                { format: "TOPSCROLL", sizes: [[1, 1]] },
                { format: "MIDSCROLL", sizes: [[1, 2]] }
            ]
        }
    });
    advantageGam.connectGoogleAdManager(advantageInstance);
</script>
```

### Option C — jsDelivr CDN {#install-cdn}

The quickest, no-build option — perfect for AdOps and low-code integrations. Add this `<script>` tag to your page:

```html
<script src="https://cdn.jsdelivr.net/npm/highimpact.js/dist/bundles/advantage.umd.cjs"></script>
```

The smaller Advantage-only CDN bundle is available at
`dist/bundles/advantage-core.umd.cjs`. If format-agnostic creatives are
enabled, also load `dist/bundles/advantage-core-gam.umd.cjs` after it and use
the same global configuration shown in the self-hosted example.

<div class="tip custom-block" style="padding-top: 8px">

**Tip:** Pin a specific version for production so a new release can't change behaviour unexpectedly, e.g. `highimpact.js@0.11.1`.

</div>

### Using the command queue (script-tag methods)

When you load the full library with a `<script>` tag (Option B or C), use the global command queue to call the Slot API. The command queue (`window.highImpactJs.cmd`) lets you queue API calls before the library has finished loading; queued commands run automatically once it's ready. The lean core bundle instead exposes the `advantage` global shown above.

```html
<script>
    window.highImpactJs = window.highImpactJs || { cmd: [] };
    window.highImpactJs.cmd.push(function () {
        // High Impact JS is ready — call the API here
    });
</script>
```

Define this `window.highImpactJs` object before your `<script src=...>` tag so commands queued early aren't lost.

## Step 2: Define your ad slots

Use `defineSlot` to register each ad placement that should support high-impact formats. The library will automatically find the matching DOM element, wrap it, detect when an ad renders, and activate the format.

```html
<script>
    window.highImpactJs = window.highImpactJs || { cmd: [] };
    window.highImpactJs.cmd.push(function () {
        highImpactJs.defineSlot({
            adUnitId: "/1234/topscroll-ad",
            template: "topscroll",
            sizes: [
                [970, 250],
                [1920, 1080]
            ]
        });
    });
</script>
```

### SlotConfig properties

| Property          | Type         | Required | Description                                                                                                            |
| :---------------- | :----------- | :------- | :--------------------------------------------------------------------------------------------------------------------- |
| `adUnitId`        | `string`     | **Yes**  | The ad unit ID (e.g., a GAM slot element ID).                                                                          |
| `template`        | `string`     | No       | `"topscroll"`, `"midscroll"`, or `"double-fullscreen"`.                                                                |
| `targetId`        | `string`     | No       | Xandr target ID. Use instead of `adUnitId` for Xandr.                                                                  |
| `sizes`           | `number[][]` | No       | Accepted creative sizes, e.g. `[[970, 250]]`. Format only activates when the rendered ad matches.                      |
| `waitForAdSignal` | `boolean`    | No       | Wait for the creative to send a post-message signal before activating. Default: `false`. |

<div class="tip custom-block" style="padding-top: 8px">
  ℹ️ If your ad slot can serve both standard size ads and high-impact ads, nothing will happen when a non-high-impact ad is served. The slot behaves like a normal ad placement until a matching creative is detected.
</div>

## Step 3: Integrate formats with your site

High-impact formats take over parts of the page layout (e.g., a topscroll pushes content down, a midscroll goes full-width). Almost every website needs some adjustments to make this work smoothly — hiding a sticky header, resetting padding, expanding a container to full viewport width, etc.

You configure this with `formatIntegrations`. For each format you provide a `setup` function (called when the format activates) and optional `close` / `reset` functions (called when the user dismisses the ad or when the format is reset).

```ts
import {
    Advantage,
    AdvantageFormatName,
    IAdvantageWrapper
} from "highimpact.js";

const advantage = Advantage.getInstance();

advantage.configure({
    formatIntegrations: [
        {
            format: AdvantageFormatName.TopScroll,
            options: {
                closeButtonText: "Ad",
                closeButtonAnimationDuration: 0
            },
            setup: (wrapper: IAdvantageWrapper, ad?: HTMLElement) => {
                return new Promise<void>((resolve) => {
                    // Push the page content down to make room for the topscroll
                    const main = document.querySelector("main") as HTMLElement;
                    (main.parentElement as HTMLElement).style.paddingTop =
                        "80svh";
                    wrapper.style.top = "0";
                    wrapper.style.position = "absolute";
                    resolve();
                });
            },
            close: (wrapper: IAdvantageWrapper, ad?: HTMLElement) => {
                // Undo the layout changes when the ad is closed
                const main = document.querySelector("main") as HTMLElement;
                (main.parentElement as HTMLElement).style.paddingTop = "";
                wrapper.style.top = "";
            },
            reset: (wrapper: IAdvantageWrapper, ad?: HTMLElement) => {
                // Same cleanup when the format is reset
                const main = document.querySelector("main") as HTMLElement;
                (main.parentElement as HTMLElement).style.paddingTop = "";
                wrapper.style.top = "";
            }
        },
        {
            format: AdvantageFormatName.Midscroll,
            setup: (wrapper: IAdvantageWrapper, ad?: HTMLElement) => {
                return new Promise<void>((resolve) => {
                    // Remove margins so the ad stretches to full viewport width
                    const container = ad?.parentElement
                        ?.parentElement as HTMLElement;
                    if (container) {
                        container.style.margin = "0";
                        container.style.borderWidth = "0";
                    }

                    // Compensate if the wrapper isn't flush with the left edge
                    const rect = wrapper.getBoundingClientRect();
                    if (rect.left > 0) {
                        wrapper.style.marginLeft = `-${rect.left}px`;
                    }

                    resolve();
                });
            },
            reset: (wrapper: IAdvantageWrapper, ad?: HTMLElement) => {
                // Restore original styles
                const container = ad?.parentElement
                    ?.parentElement as HTMLElement;
                if (container) {
                    container.style.margin = "";
                    container.style.borderWidth = "";
                }
                wrapper.style.marginLeft = "";
            }
        }
    ]
});
```

### FormatIntegration properties

| Property  | Type                                                              | Required | Description                                                                                               |
| :-------- | :---------------------------------------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------- |
| `format`  | `AdvantageFormatName \| string`                                   | **Yes**  | Which format this integration applies to.                                                                 |
| `options` | `object`                                                          | No       | Format-specific options (e.g., `closeButtonText`, `autoCloseDuration`, `logo`). Varies by format.         |
| `setup`   | `(wrapper: IAdvantageWrapper, ad?: HTMLElement) => Promise<void>` | **Yes**  | Called when the format is about to activate. Make your layout adjustments here, then call `resolve()`.    |
| `close`   | `(wrapper: IAdvantageWrapper, ad?: HTMLElement) => void`          | No       | Called when the user dismisses the ad (e.g., clicks the close button). Undo your layout changes here.     |
| `reset`   | `(wrapper: IAdvantageWrapper, ad?: HTMLElement) => void`          | No       | Called when the format is reset (e.g., a new ad loads into the same slot). Undo your layout changes here. |

<div class="tip custom-block" style="padding-top: 8px">

**Tip:** If your `close` and `reset` handlers do the same thing, extract the cleanup into a shared function to avoid duplication.

</div>

## Step 4: Lifecycle Events

The library dispatches lifecycle events that bubble up through the DOM. Use them to react to format changes on your page (e.g., pause a video player, adjust analytics, hide sticky elements).

| Event                    | When                                    | `event.detail`                |
| :----------------------- | :-------------------------------------- | :---------------------------- |
| `advantage:format-start` | Format has been activated               | `{ format, wrapper, iframe }` |
| `advantage:format-close` | User closed the format (e.g., × button) | `{ format, wrapper, iframe }` |
| `advantage:format-reset` | Format was reset (e.g., new ad loaded)  | `{ format, wrapper, iframe }` |

```js
document.addEventListener("advantage:format-start", (e) => {
    console.log("Format activated:", e.detail.format);
    // e.g. hide a sticky header
});

document.addEventListener("advantage:format-close", (e) => {
    console.log("Format closed:", e.detail.format);
    // e.g. restore the sticky header
});
```

## Success!

Congratulations! Your website is now set up for high-impact ad formats!

## Full Example

A complete publisher-side setup:

```html
<script>
    window.highImpactJs = window.highImpactJs || { cmd: [] };
    window.highImpactJs.cmd.push(function () {
        // Global settings
        highImpactJs.setConfig({
            plugins: ["gam"]
        });

        // Template settings
        highImpactJs.setTemplateConfig("topscroll", {
            peekAmount: "80vh"
        });

        // Define slots
        highImpactJs.defineSlot({
            adUnitId: "/1234/topscroll-ad",
            template: "topscroll",
            sizes: [
                [970, 250],
                [1920, 1080]
            ],
            waitForAdSignal: true
        });

        highImpactJs.defineSlot({
            adUnitId: "/1234/midscroll-ad",
            template: "midscroll",
            sizes: [
                [1080, 1920]
            ],
        });
    });
</script>
<script src="https://cdn.jsdelivr.net/npm/highimpact.js/dist/bundles/advantage.umd.cjs"></script>
```

The library will:

1. Find the DOM elements matching each ad unit ID
2. Wrap them with `<advantage-wrapper>` elements configured for the right format
3. Listen for the GAM `slotRenderEnded` event
4. Wait for the creative's post-message signal (when `waitForAdSignal: true`)
5. Activate the format once all conditions are met

For the full Slot API reference (all properties, getter functions, post-message signals, etc.), see the [Slot API Reference](../migration/api).
