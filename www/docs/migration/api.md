---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Migration > Slot API Reference</code></p>

# Slot API Reference

The Slot API is the declarative JavaScript interface for configuring high-impact ad slots. It originates from the original High Impact JS library and is now a first-class part of the merged library.

Use it when you want to define ad behavior in JavaScript rather than (or in addition to) wrapping elements in HTML.

## Installation

```js
import { defineSlot, setTemplateConfig, setConfig } from "highimpact.js";
```

Or use the global object (available automatically when the library is loaded via a `<script>` tag):

```js
window.highImpactJs.defineSlot({ ... });
```

### Command Queue

If you need to call API functions before the library has loaded, use the command queue pattern:

```html
<script>
    window.highImpactJs = window.highImpactJs || { cmd: [] };
    window.highImpactJs.cmd.push(function () {
        window.highImpactJs.defineSlot({
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

Commands are executed immediately once the library is ready, and any commands pushed after initialization run synchronously.

---

## `defineSlot(config)`

Defines an ad slot and associates it with a high-impact template. The library will automatically find the matching DOM element, wrap it with an `<advantage-wrapper>`, and activate the format when the ad renders.

```js
highImpactJs.defineSlot({
    adUnitId: "/1234/topscroll-ad",
    template: "topscroll",
    sizes: [
        [970, 250],
        [1920, 1080]
    ]
});
```

### SlotConfig

| Property              | Type         | Required | Description                                                                                                                                     |
| :-------------------- | :----------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `adUnitId`            | `string`     | **Yes**  | The ad unit ID. Used to find the DOM element (e.g., a GAM slot element ID).                                                                     |
| `template`            | `string`     | No       | The high-impact template to use: `"topscroll"`, `"midscroll"`, or `"double-fullscreen"`. If omitted, the slot remains a regular banner.         |
| `targetId`            | `string`     | No       | Xandr target ID. Used instead of `adUnitId` when running Xandr as the ad server.                                                                |
| `sizes`               | `number[][]` | No       | Array of accepted creative sizes, e.g. `[[970, 250]]`. If specified, the format only activates when the rendered ad matches one of these sizes. |
| `waitForAdSignal`     | `boolean`    | No       | If `true`, the format waits for the creative to send a post-message signal before activating. Default: `false`.                                 |
| `testTagToBeInserted` | `string`     | No       | HTML string to inject into the ad iframe for testing purposes.                                                                                  |

### Example: Post-message banner

For ads that communicate via post-message:

```js
highImpactJs.defineSlot({
    adUnitId: "/1234/topscroll-ad",
    template: "topscroll",
    sizes: [[970, 250]],
    waitForAdSignal: true
});
```

Setting `waitForAdSignal: true` tells the library to wait for the creative to announce itself via a post-message before activating the format. For messaging format [read here](#post-message-ad-signal-one-tag-banners)

---

## `setTemplateConfig(template, config)`

Configures display options for a specific template. Applied to all slots using that template, including slots defined before this call.

```js
highImpactJs.setTemplateConfig("topscroll", {
    peekAmount: "80vh"
});
```

### TemplateConfig

| Property          | Type      | Templates            | Description                                                                     |
| :---------------- | :-------- | :------------------- | :------------------------------------------------------------------------------ |
| `peekAmount`      | `string`  | topscroll, midscroll | How much of the viewport the format occupies, e.g. `"80vh"` or `"70%"`.         |
| `fadeOnScroll`    | `boolean` | topscroll            | Whether the ad fades as the user scrolls past it.                               |
| `zIndex`          | `number`  | all                  | CSS z-index applied to the wrapper element.                                     |

---

## `setConfig(config)`

Sets global configuration that applies to the entire library.

```js
highImpactJs.setConfig({
    plugins: ["gam"],
    zIndex: 9999
});
```

### GlobalConfig

| Property          | Type                        | Description                                                                                                                                            |
| :---------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugins`         | `string[]`                  | Ad server plugins to use: `"gam"` (Google Ad Manager) and/or `"xandr"`. Default: `["gam", "xandr"]`.                                                   |
| `zIndex`          | `number`                    | Default z-index for all format wrappers. Can be overridden per template.                                                                               |
| `topBarHeight`    | `number`                    | Height in pixels of any fixed top navigation bar on the page.                                                                                          |
| `bottomBarHeight` | `number`                    | Height in pixels of any fixed bottom navigation bar.                                                                                                   |
| `ignoreSlotOn`    | `(html: string) => boolean` | A callback that receives the ad's HTML content. Return `true` to prevent the format from activating (e.g., to filter out blank or fallback creatives). |

---

## `getSlotConfig(elementId)`

Returns the configuration for a previously defined slot, or `undefined` if not found.

```js
const config = highImpactJs.getSlotConfig("/1234/topscroll-ad");
if (config) {
    console.log("Template:", config.template);
}
```

---

## `getTemplateConfig(template)`

Returns the configuration for a template. Returns an empty object if no config has been set.

```js
const topscrollConfig = highImpactJs.getTemplateConfig("topscroll");
```

---

## `getConfig()`

Returns the current global configuration.

```js
const globalConfig = highImpactJs.getConfig();
console.log("Active plugins:", globalConfig.plugins);
```

---

## Available Templates

| Template name         | Format           | Description                                                    |
| :-------------------- | :--------------- | :------------------------------------------------------------- |
| `"topscroll"`         | Topscroll        | Sticks the ad to the top of the page. Content scrolls over it. |
| `"midscroll"`         | Midscroll        | Full-viewport ad fixed in the middle of the page content.      |
| `"double-fullscreen"` | Double Midscroll | Two full viewports of scroll with a background creative.       |

---

## Full Example

A complete publisher-side setup using the Slot API with GAM:

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

        // Define slot
        highImpactJs.defineSlot({
            adUnitId: "/1234/topscroll-ad",
            template: "topscroll",
            sizes: [
                [970, 250],
                [1920, 1080]
            ],
            waitForAdSignal: true
        });
    });
</script>
<script src="https://cdn.example.com/high-impact-js/latest/high-impact-js.umd.js"></script>
```

The library will:

1. Find the DOM element matching the ad unit ID
2. Pre-wrap it with an `<advantage-wrapper>` configured for the topscroll format
3. Listen for the GAM `slotRenderEnded` event
4. Wait for the creative's post-message signal (because `waitForAdSignal: true`)
5. Activate the topscroll format once both conditions are met

---

## Post-Message Ad Signal

When a slot is configured with `waitForAdSignal: true`, the library waits for the creative inside the ad iframe to announce itself via `window.postMessage` before activating the format.

### Message Format

The creative must send a message to `window.top` in one of the following formats:

**Option 1: JSON string** (recommended — works across all origins)

```js
window.top.postMessage(
    JSON.stringify({
        sender: "high-impact-js",
        action: "AD_RENDERED"
    }),
    "*"
);
```

**Option 2: Object**

```js
window.top.postMessage(
    {
        sender: "high-impact-js",
        action: "AD_RENDERED"
    },
    "*"
);
```

**Option 3: Typed message** (modern format)

```js
window.top.postMessage(
    {
        type: "high-impact-ad-responsive"
    },
    "*"
);
```

All three are equivalent — the library accepts any of them.

### Required Fields

| Field    | Value                         | Required            |
| :------- | :---------------------------- | :------------------ |
| `sender` | `"high-impact-js"`            | Yes (options 1 & 2) |
| `action` | `"AD_RENDERED"`               | Yes (options 1 & 2) |
| `type`   | `"high-impact-ad-responsive"` | Yes (option 3 only) |

### How It Works

1. The creative loads inside the ad server's iframe (e.g., a GAM SafeFrame or a friendly iframe)
2. The creative calls `window.top.postMessage(...)` with one of the formats above
3. The library receives the message, identifies which iframe sent it by traversing the frame hierarchy, and matches it to a defined slot
4. If the slot has `waitForAdSignal: true` and a matching template, the format is activated

### Minimal Creative Example

A bare-bones one-tag creative that triggers a topscroll:

```html
<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                margin: 0;
            }
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        </style>
    </head>
    <body>
        <img src="https://example.com/campaign-image.jpg" alt="Ad" />
        <script>
            // Signal to the publisher page that this ad is ready
            window.top.postMessage(
                JSON.stringify({
                    sender: "high-impact-js",
                    action: "AD_RENDERED"
                }),
                "*"
            );
        </script>
    </body>
</html>
```

::: tip
The creative does **not** need to import or know about High Impact JS. It only needs to send the post-message signal. The publisher-side library handles everything else.
:::
