---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Formats</code></p>

# Double Midscroll Single Creative

The Double Midscroll Single Creative is a simplified version of the Double Midscroll format that requires only one creative file instead of two. This format provides a 2x viewport height scroll area with real-time scroll progress events, allowing a single creative to implement scroll-based animations without requiring a separate background creative.

<span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Width 100%</span> <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Height: 200%</span> <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Parallax Scrolling</span> <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">Scroll Progress Events</span>

## Overview

The Double Midscroll Single Creative format is designed for advertisers who want the immersive 2x viewport height experience but prefer to implement everything in a single creative file. This is particularly useful when:

-   Delivering creatives as a single tag
-   Simplifying creative production workflows
-   Implementing custom scroll-based animations within one file
-   Avoiding the complexity of coordinating two separate creative files

## Key Differences from Standard Double Midscroll

| Feature | Standard Double Midscroll | Single Creative |
|---------|--------------------------|-----------------|
| **Number of Files** | Two (foreground + background) | One |
| **Background URL** | Required (`backgroundAdURL`) | Not needed |
| **Scroll Events** | Waypoint-based (discrete triggers) | Continuous progress (0-1) |
| **Animation Control** | Coordinated between two files | Self-contained in one file |
| **Use Case** | Complex multi-layer experiences | Simpler single-file implementations |

## Creative Implementation

### Single-File Architecture

Creative authors only need to create one HTML file that:

-   Requests the DoubleMidscrollSingleCreative format
-   Listens for scroll progress events
-   Implements scroll-based animations based on progress value

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
            format: AdvantageFormatName.DoubleMidscrollSingleCreative
            // Note: No backgroundAdURL needed!
        });

        if (response?.action === AdvantageMessageAction.FORMAT_CONFIRMED) {
            // Format confirmed, start your ad experience
            document.body.style.opacity = "1";

            // Listen for scroll progress events
            messenger.onMessage((message) => {
                if (message.action === AdvantageMessageAction.SCROLL_PROGRESS) {
                    const progress = message.progress; // Value from 0 to 1
                    updateAnimations(progress);
                }
            });
        }
    }
}

function updateAnimations(progress) {
    // progress = 0: User just started scrolling into the ad
    // progress = 0.5: User is halfway through the ad
    // progress = 1: User has scrolled through the entire ad

    // Example: Fade in elements based on scroll
    const hero = document.querySelector(".hero");
    hero.style.opacity = Math.min(1, progress * 2);

    // Example: Parallax effect
    const background = document.querySelector(".background");
    background.style.transform = `translateY(${progress * -50}px)`;

    // Example: Trigger animations at specific points
    if (progress > 0.3 && progress < 0.35) {
        document.querySelector(".cta").classList.add("animate-in");
    }
}
```

### SCROLL_PROGRESS Message Format

The format sends continuous scroll progress updates to your creative:

```typescript
{
    action: AdvantageMessageAction.SCROLL_PROGRESS,
    progress: number // Value from 0 to 1
}
```

**Progress Values:**
-   `0.0`: The ad container has just entered the viewport (top of scroll area)
-   `0.5`: User is halfway through scrolling the 2x viewport height
-   `1.0`: User has scrolled through the entire ad container

### Animation Opportunities

The continuous progress value enables sophisticated scroll-based effects:

-   **Smooth parallax animations** that respond to every scroll pixel
-   **Progressive reveals** of content elements
-   **Dynamic transformations** (scale, rotate, translate) based on scroll position
-   **Color transitions** that evolve as the user scrolls
-   **Video scrubbing** synchronized with scroll position
-   **Interactive storytelling** that unfolds with scroll

### Example Creative Structure

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 200vh; /* Full 2x viewport height */
            overflow: hidden;
            opacity: 0; /* Hidden until format confirmed */
            transition: opacity 0.3s;
        }

        .background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
            will-change: transform;
        }

        .content {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: white;
        }

        .hero {
            font-size: 3rem;
            font-weight: bold;
            opacity: 0;
            will-change: opacity;
        }

        .cta {
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: white;
            color: #667eea;
            border-radius: 8px;
            transform: scale(0);
            transition: transform 0.3s;
        }

        .cta.animate-in {
            transform: scale(1);
        }
    </style>
</head>
<body>
    <div class="background"></div>
    <div class="content">
        <h1 class="hero">Your Message Here</h1>
        <button class="cta">Learn More</button>
    </div>

    <script type="module">
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
                    format: AdvantageFormatName.DoubleMidscrollSingleCreative
                });

                if (response?.action === AdvantageMessageAction.FORMAT_CONFIRMED) {
                    document.body.style.opacity = "1";

                    messenger.onMessage((message) => {
                        if (message.action === AdvantageMessageAction.SCROLL_PROGRESS) {
                            updateAnimations(message.progress);
                        }
                    });
                }
            }
        }

        function updateAnimations(progress) {
            const hero = document.querySelector(".hero");
            const background = document.querySelector(".background");

            // Fade in hero
            hero.style.opacity = Math.min(1, progress * 2);

            // Parallax background
            background.style.transform = `translateY(${progress * -50}px)`;

            // Trigger CTA animation
            if (progress > 0.3) {
                document.querySelector(".cta").classList.add("animate-in");
            }
        }

        initializeAd();
    </script>
</body>
</html>
```

## Publisher Configuration

### Basic Setup

This format is built in, so publishers don't need any configuration to support it.

### Advanced Configuration with Site Adjustments

```javascript
import { Advantage, AdvantageFormatName } from "highimpact.js";

const advantage = Advantage.getInstance();
advantage.configure({
    formatIntegrations: [
        {
            format: AdvantageFormatName.DoubleMidscrollSingleCreative,
            setup: async (wrapper, iframe) => {
                // Custom site adjustments
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

-   Single HTML file with embedded JavaScript
-   Creative must handle 200vh (2x viewport height) scroll area
-   Use `AdvantageCreativeMessenger` to request format
-   Listen for `SCROLL_PROGRESS` messages with `onMessage()`
-   Implement scroll-based animations using progress value (0-1)
-   Optimize animations with `will-change` CSS property for performance

### Performance Considerations

-   Use `requestAnimationFrame` for smooth animations
-   Leverage CSS transforms and opacity for GPU-accelerated animations
-   Avoid layout thrashing by batching DOM reads and writes
-   Consider using `will-change` CSS property for animated elements
-   Test on mobile devices to ensure smooth 60fps scrolling

### Example Creative

If you're a creative author, you can examine a working example by cloning this repository and starting the development server. The relevant example file is located at:

-   `playground/local-dev/double-midscroll-single/index.html`

To run the example:

```bash
git clone https://github.com/high-impact-js/highimpact.js
cd highimpact.js
npm install
npm run dev
```

Then navigate to the playground examples to see the Double Midscroll Single Creative format in action.

### For Publishers

-   No special security configuration required (no external URLs)
-   Consider site-specific adjustments in format integration setup
-   Test thoroughly with your site's layout and existing sticky elements
-   Monitor scroll performance on mobile devices

## When to Use This Format

**Choose Double Midscroll Single Creative when:**
-   You want a simpler single-file creative workflow
-   You're delivering creatives as tags
-   You need full control over scroll animations in one place
-   Your creative doesn't require complex background/foreground coordination

**Choose Standard Double Midscroll when:**
-   You need separate background and foreground layers
-   You want discrete waypoint triggers instead of continuous progress
-   You're building complex multi-layer experiences
-   You need independent control of background and foreground animations
