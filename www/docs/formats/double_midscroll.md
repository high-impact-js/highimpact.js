---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Formats</code></p>

# Double Midscroll

The Double Midscroll is a responsive, high-impact format that provides a natural presentation of your message through an intuitive and user-friendly scrolling experience. This format features a background ad that is twice the height of the viewport, with a foreground ad that sticks to the user's scroll position within the background ad's height. The format enables advanced scroll-triggered animations through a secure waypoint system.

<span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Width 100%</span> <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Height: 200%</span> <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Parallax Scrolling</span> <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">Waypoint System</span>

## Overview

The Double Midscroll format consists of two main components:

-   **Background Ad**: A tall creative (twice the viewport height) that provides the visual backdrop
-   **Foreground Ad**: A primary creative that remains fixed to the user's scroll position and orchestrates the experience

As users scroll, the foreground ad maintains its position while the background ad creates a parallax scrolling effect. This setup enables sophisticated scroll-based animations and interactions through a secure messaging system between the two ad components.

## Creative Implementation

### Two-File Architecture

Creative authors need to create two HTML files for this format:

#### 1. Primary (Foreground) Creative

The primary creative is the main ad file that:

-   Requests the Double Midscroll format
-   Provides the URL to its companion background ad
-   Coordinates the overall ad experience

```javascript
import {
    AdvantageCreativeMessenger,
    AdvantageMessageAction,
    AdvantageFormatName
} from "highimpact.js/creative";

async function initializeAd() {
    const messenger = new AdvantageCreativeMessenger();
    const session = await messenger.startSession();

    if (session) {
        const response = await messenger.sendMessage({
            action: AdvantageMessageAction.REQUEST_FORMAT,
            format: AdvantageFormatName.DoubleMidscroll,
            backgroundAdURL: "https://cdn.example.com/background-ad.html"
        });

        if (response?.action === AdvantageMessageAction.FORMAT_CONFIRMED) {
            // Format confirmed, start your ad experience
            document.body.style.opacity = "1";

            // Listen for waypoint triggers from background ad
            messenger.listenToWaypoints((waypointId, isIntersecting) => {
                console.log(
                    `Waypoint ${waypointId} is ${
                        isIntersecting ? "visible" : "hidden"
                    }`
                );
                // Trigger animations based on waypoint state
            });
        }
    }
}
```

#### 2. Background (Companion) Creative

The background creative is the tall visual component that:

-   Sets up waypoints for scroll-triggered events
-   Provides the visual backdrop for the experience

```javascript
import { AdvantageCreativeMessenger } from "highimpact.js/creative";

document.addEventListener("DOMContentLoaded", () => {
    const messenger = new AdvantageCreativeMessenger();

    // Set up waypoints on specific elements
    const waypoints = document.querySelectorAll(".waypoint");
    messenger.setupWaypoints(Array.from(waypoints));
});
```

```html
<!-- Background creative structure -->
<div class="background-content" style="height: 200vh;">
    <!-- Your background visuals -->
    <div class="scene-1">...</div>
    <div class="scene-2">...</div>

    <!-- Waypoint triggers -->
    <div
        class="waypoint"
        data-id="start"
        style="position: absolute; top: 30%;"
    ></div>
    <div
        class="waypoint"
        data-id="midpoint"
        style="position: absolute; top: 75%;"
    ></div>
    <div
        class="waypoint"
        data-id="end"
        style="position: absolute; top: 99%;"
    ></div>
</div>
```

### Waypoint System

The waypoint system enables secure communication between the foreground and background ads:

-   **`setupWaypoints(elements)`**: Called in the background ad to register scroll trigger points
-   **`listenToWaypoints(callback)`**: Called in the foreground ad to receive waypoint events
-   **Secure Messaging**: Uses BroadcastChannel with session IDs for secure inter-frame communication

### Animation Opportunities

The waypoint system enables sophisticated animations:

-   **Parallax effects** synchronized with scroll position
-   **Element reveals** triggered at specific scroll points
-   **Scene transitions** coordinated between foreground and background
-   **Interactive elements** that respond to user scroll behavior

## Publisher Configuration

### Security and Origin Control

Publishers must configure allowed origins for background ad URLs to maintain security:

```javascript
import { Advantage, AdvantageFormatName } from "highimpact.js";

const advantage = Advantage.getInstance();
advantage.configure({
    formatIntegrations: [
        {
            format: AdvantageFormatName.DoubleMidscroll,
            // Every integration needs a setup hook, even if it only sets options
            setup: async () => {},
            options: {
                // Recommended: Specify allowed origins for background ads
                allowedOrigins: [
                    "https://cdn.certified-vendor.com",
                    "https://assets.trusted-network.com"
                ],
                // Alternative: Allow all origins (NOT RECOMMENDED)
                dangerouslyAllowAllOrigins: false
            }
        }
    ]
});
```

### Configuration Options

#### `allowedOrigins` (Recommended)

-   **Type**: `string[]`
-   **Description**: Array of allowed origins for background ad URLs
-   **Usage**: Only background ads served from these origins will be loaded
-   **Security**: Prevents malicious or unauthorized content from being loaded

#### `dangerouslyAllowAllOrigins` (Use with Caution)

-   **Type**: `boolean`
-   **Default**: `false`
-   **Description**: Bypasses origin validation for background ad URLs
-   **Risk**: ⚠️ **Security Risk**: Allows any origin to serve background ads, potentially exposing users to malicious content
-   **Recommendation**: Only use in controlled environments or for testing

### Best Practices

1. **Certified Vendors Only**: In production, only allow origins from certified advertising vendors
2. **Regular Audits**: Periodically review and update the allowed origins list
3. **Testing Environment**: Use `dangerouslyAllowAllOrigins: true` only in development/testing environments
4. **Content Security Policy**: Consider implementing additional CSP headers for extra protection

### Example Integration

```javascript
// Secure production configuration
advantage.configure({
    formatIntegrations: [
        {
            format: AdvantageFormatName.DoubleMidscroll,
            options: {
                allowedOrigins: [
                    "https://creatives.certified-network.com",
                    "https://ads.premium-vendor.com"
                ]
            },
            setup: async (wrapper, iframe) => {
                // Custom site adjustments for Double Midscroll
                document.body.classList.add("double-midscroll-active");

                // Hide sticky elements that might interfere
                const stickyHeader = document.querySelector(".sticky-header");
                if (stickyHeader) {
                    stickyHeader.style.display = "none";
                }
            },
            reset: (wrapper, iframe) => {
                // Restore site state
                document.body.classList.remove("double-midscroll-active");

                const stickyHeader = document.querySelector(".sticky-header");
                if (stickyHeader) {
                    stickyHeader.style.display = "";
                }
            }
        }
    ]
});
```

## Technical Requirements

### For Creatives

-   Two separate HTML files (foreground and background)
-   Background creative must be exactly twice the viewport height (200vh)
-   Use `AdvantageCreativeMessenger` for format requests and waypoint communication
-   Implement waypoints in background creative for scroll-triggered events

### Example Creative

If you're a creative author, you can examine a working example by cloning this repository and starting the development server. The relevant example files are located at:

-   `playground/local-dev/double-midscroll/short.html` (foreground creative)
-   `playground/local-dev/double-midscroll/tall.html` (background creative)

To run the example:

```bash
git clone https://github.com/high-impact-js/highimpact.js
cd highimpact.js
npm install
npm run dev
```

Then navigate to the playground examples to see the Double Midscroll format in action.

### For Publishers

-   Configure `allowedOrigins` to whitelist trusted ad servers
-   Avoid `dangerouslyAllowAllOrigins: true` in production
-   Consider site-specific adjustments in format integration setup
-   Test thoroughly with your site's layout and existing sticky elements
