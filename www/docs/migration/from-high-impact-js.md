---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Migration > From High Impact JS</code></p>

# Migrating from High Impact JS

If your site uses the original High Impact JS library (by SeenThis), migration is minimal. The merged library supports the same `defineSlot`, `setTemplateConfig`, and `setConfig` APIs. Your existing JavaScript configuration will work as-is.

## What Stays the Same

- `window.highImpactJs` global object
- `highImpactJs.defineSlot()` with the same `SlotConfig` shape
- `highImpactJs.setTemplateConfig()` and `highImpactJs.setConfig()`
- The command queue pattern (`highImpactJs.cmd.push(...)`)
- GAM `slotRenderEnded` integration
- Xandr `adAvailable` / `adLoaded` integration
- Post-message handling for one-tag banners (SeenThis)
- CSS classes added to the DOM (`high-impact-ad-wrapper-*`, `high-impact-ad-rendered`, etc.)

## What's Different

The underlying rendering engine is now Advantage's web component system. This means:

| Aspect               | Original HIJS                | Merged Library                                                            |
| :------------------- | :--------------------------- | :------------------------------------------------------------------------ |
| **Rendering**        | Custom DOM manipulation      | `<advantage-wrapper>` web component with Shadow DOM                       |
| **Format isolation** | CSS classes on page elements | Shadow DOM encapsulation — ad styles cannot leak into the page            |
| **Close/reset**      | Template-specific cleanup    | Standardized lifecycle (`close()`, `reset()`) with events                 |
| **Messaging**        | Post-message only            | Post-message + secure `MessageChannel` protocol                           |
| **Format options**   | CSS-heavy configuration      | JavaScript config objects (close button text, peek height, z-index, etc.) |

### CSS Class Compatibility

The merged library continues to add the same CSS classes to the DOM that the original HIJS did:

- `high-impact-ad-wrapper-{template}` on the ad wrapper
- `high-impact-ad-unit-{template}` on the ad unit
- `high-impact-ad-iframe-{template}` on the ad iframe
- `high-impact-ad-rendered` on `document.body`
- `high-impact-topscroll-rendered` on `document.body` (topscroll only)
- `high-impact-topscroll-is-hidden` on `document.body` (when topscroll scrolls out of view)

If you have custom CSS targeting these classes, it will continue to work.

## Step-by-Step Migration

### 1. Swap the script tag

Replace the original High Impact JS script with the new library:

```diff
- <script src="https://cdn.seenthis.se/high-impact-js/latest/high-impact-js.min.js"></script>
+ <script src="https://cdn.jsdelivr.net/npm/highimpact.js/dist/bundles/advantage.umd.cjs"></script>
```

Or install via npm:

```sh
npm install highimpact.js
```

Or self-hosted from your own domain:

Grab `dist/bundles/advantage.umd.cjs` from the [npm package](https://www.npmjs.com/package/highimpact.js) (or build it from source), upload it to your server.


### 2. Keep your existing configuration

Your existing `defineSlot`, `setTemplateConfig`, and `setConfig` calls work without changes:

```html
<script>
    window.highImpactJs = window.highImpactJs || { cmd: [] };
    window.highImpactJs.cmd.push(function () {
        highImpactJs.setConfig({ plugins: ["gam"] });

        highImpactJs.setTemplateConfig("topscroll", {
            peekAmount: "80vh"
        });

        highImpactJs.defineSlot({
            adUnitId: "/1234/topscroll-ad",
            template: "topscroll",
            sizes: [[970, 250]],
            waitForAdSignal: true
        });
    });
</script>
```

### 3. (Recommended) Move custom CSS and layout logic into format integrations

If you had custom CSS or JavaScript to make high-impact formats work on your site — adjusting padding, hiding sticky headers, resetting margins on close, etc. — the best practice is to move that logic into Advantage's **format integration system**.

This gives you proper lifecycle hooks (`setup`, `close`, `reset`) instead of relying on CSS classes that may not reach inside Shadow DOM. It also means your cleanup code runs automatically when a format is dismissed or reset.

#### Simple case: replace CSS with `setTemplateConfig`

If you only had CSS overrides for things like the topscroll height:

**Before (CSS):**

```css
.high-impact-ad-wrapper-topscroll {
    height: 70vh !important;
}
```

**After (configuration):**

```js
highImpactJs.setTemplateConfig("topscroll", {
    peekAmount: "70vh"
});
```

#### Full case: use `formatIntegrations` for layout adjustments

For anything beyond simple property overrides — adjusting page layout, repositioning elements, compensating for fixed headers — use `formatIntegrations`. Each integration defines a `setup` function (called when the format activates) and optional `close` / `reset` functions (called when the user dismisses the ad or when it resets).

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
                    // Push page content down to make room for the topscroll
                    const main = document.querySelector("main") as HTMLElement;
                    (main.parentElement as HTMLElement).style.paddingTop =
                        "80svh";
                    wrapper.style.top = "0";
                    wrapper.style.position = "absolute";
                    resolve();
                });
            },
            close: (wrapper: IAdvantageWrapper, ad?: HTMLElement) => {
                // Undo layout changes when the ad is closed
                const main = document.querySelector("main") as HTMLElement;
                (main.parentElement as HTMLElement).style.paddingTop = "";
                wrapper.style.top = "";
            },
            reset: (wrapper: IAdvantageWrapper, ad?: HTMLElement) => {
                // Same cleanup when the format resets
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

This approach is **optional** — your existing CSS-based customizations will keep working. But moving to `formatIntegrations` is the recommended path forward because:

- **Shadow DOM**: Some external CSS can't target elements inside the wrapper's Shadow DOM. `formatIntegrations` passes values directly into the component.
- **Lifecycle**: `close` and `reset` callbacks ensure cleanup happens automatically, instead of relying on CSS class toggling.
- **Colocation**: All format-related logic lives in one place instead of being split across CSS files and JavaScript.

For the full reference on `formatIntegrations`, see [Step 4 in the Publisher Tutorial](../tutorial/publisher#step-4-integrate-formats-with-your-site).

### 4. Done

The library handles the rest — it detects your ad server, listens for ad render events, processes post-message signals, and activates the formats.

## FAQ

### Will SeenThis one-tag banners still work?

Yes. The post-message protocol is fully supported.

### My site uses custom CSS for the topscroll close button. Will it still work?

It is recommended to move the layout elements and styling to the new format integration, `formatIntegrations`. However, if you wish to continue with the same styling as before, extract the HTML and styling and apply it on `advantage:format-start` instead.

### I use Xandr instead of GAM. Does that work?

Yes. Set the plugin in your global config:

```js
highImpactJs.setConfig({ plugins: ["xandr"] });
```

And use `targetId` instead of `adUnitId` when defining slots:

```js
highImpactJs.defineSlot({
    targetId: "my-xandr-placement",
    template: "topscroll"
});
```

### Can I listen for format lifecycle events?

Yes — this is new. The merged library dispatches `CustomEvent`s on the wrapper element:

- `advantage:format-start` — format activated
- `advantage:format-close` — format closed by user
- `advantage:format-reset` — format reset (e.g., new ad loaded)

```js
document.addEventListener("advantage:format-start", (e) => {
    console.log("Format activated:", e.detail.format);
});
```

These events bubble and are composed, so you can listen on `document` or any ancestor.
