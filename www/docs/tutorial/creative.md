---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Quick Start Guide</code></p>

# Creative tutorial

This part of the tutorial is aimed at creatives and developers who build high-impact ads.

## Quick Start (CDN) {#quick-start-cdn}

The fastest way to build an Advantage-compatible ad is to use the CDN-hosted library. This works in any HTML environment.

### 1. Include the Library

Add this to your ad's HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/highimpact.js@0.13/dist/bundles/creative-side.iife.js"></script>
```

### 2. Request a Format

Use the following script to communicate with the publisher's website and request a high-impact format (like `topscroll`).

```html
<script>
    const { AdvantageCreativeMessenger, AdvantageMessageAction, AdvantageFormatName } = window.advantage;

    async function startAd() {
        const messenger = new AdvantageCreativeMessenger();
        const session = await messenger.startSession();

        if (session) {
            // Request the format your ad was built for
            const response = await messenger.sendMessage({
                action: AdvantageMessageAction.REQUEST_FORMAT,
                format: AdvantageFormatName.TopScroll
            });

            if (response?.action === AdvantageMessageAction.FORMAT_CONFIRMED) {
                // Success! The site has adjusted its layout for your ad.
                console.log("Advantage format confirmed. Starting ad animation...");
            }
        }
    }

    startAd();
</script>
```

## Professional Workflow (NPM)

For advanced creative builds using modern bundling tools (Webpack, Vite, etc.).

### 1. Install

```sh
npm i highimpact.js
```

### 2. Implementation

```ts
import {
    AdvantageCreativeMessenger,
    AdvantageMessageAction,
    AdvantageFormatName
} from "highimpact.js/creative";

async function init() {
    const messenger = new AdvantageCreativeMessenger();
    const session = await messenger.startSession();

    if (session) {
        const response = await messenger.sendMessage({
            action: AdvantageMessageAction.REQUEST_FORMAT,
            format: AdvantageFormatName.TopScroll
        });

        if (response?.action === AdvantageMessageAction.FORMAT_CONFIRMED) {
            // Initialize your high-impact creative logic here
        }
    }
}

init();
```

### Listen for messages (optional)

After a session is established, you can listen for incoming messages from the publisher side. This is useful for reacting to format lifecycle changes or custom events.

```ts
advantageMessenger.onMessage((message) => {
    console.log("Received from publisher:", message.action);
});
```

### Waypoints (optional)

Waypoints let a creative track element visibility across iframe boundaries. This is useful for triggering animations or analytics when specific parts of the ad scroll into view.

Waypoints use a `BroadcastChannel` tied to the session ID, so they work across different browsing contexts (e.g., between an ad iframe and the publisher page).

#### Setting up waypoints (producer side)

In the context that contains the elements you want to track, call `setupWaypoints` with an array of elements. Each element must have a `data-id` attribute.

```ts
// Mark elements with data-id attributes
// <div data-id="cta-button">...</div>
// <div data-id="product-image">...</div>

const waypoints = document.querySelectorAll("[data-id]");
const observer = advantageMessenger.setupWaypoints([...waypoints]);

// Later, when done:
observer.disconnect();
```

#### Listening to waypoints (consumer side)

In a different context (e.g., another iframe or the creative's main frame), listen for waypoint triggers:

```ts
const listener = advantageMessenger.listenToWaypoints(
    (waypointId, isIntersecting) => {
        if (waypointId === "cta-button" && isIntersecting) {
            // The CTA button scrolled into view — trigger animation
        }
    }
);

// Later, when done:
listener.disconnect();
```


## Post-Message Signal (simple one-tag) {#post-message}

If your creative doesn't need two-way communication — it just needs to announce "I'm here, activate the format" — you can skip the Advantage library entirely and send a single `postMessage` from the creative.

This is the approach used by one-tag banner solutions, where a banner is built to be responsive and works in multiple high impact formats.

### Minimal creative

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
        <img src="https://example.com/ad-image.jpg" alt="Ad" />
        <script>
            // Tell the publisher page to activate the format
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

That's it — no library, no session, no build step. The publisher's library receives this message, matches it to a defined slot, and activates the format.

### Accepted message formats

Any of the following work:

```js
// Option 1: JSON string (recommended — works across all origins)
window.top.postMessage(
    JSON.stringify({ sender: "high-impact-js", action: "AD_RENDERED" }),
    "*"
);

// Option 2: Object
window.top.postMessage(
    { sender: "high-impact-js", action: "AD_RENDERED" },
    "*"
);

// Option 3: Typed message
window.top.postMessage({ type: "high-impact-ad-responsive" }, "*");
```


## Why is this necessary?

Standard ad banners are often stuck inside fixed-size `iframes`. To create "High Impact" experiences like parallax scrolling or full-screen takeovers, the ad needs a secure way to tell the parent website: *"I'm not a regular banner, please give me more space!"*

Advantage provides this secure communication bridge.

## Next Steps

-   View the [Messaging Protocol](../concepts/creative.md) for more advanced actions.
-   Check out the [Hello World Example](../examples/hello-world.md).
