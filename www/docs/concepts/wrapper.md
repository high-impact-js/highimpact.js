---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Key Concepts</code></p>

# Wrapper

The **Wrapper** is a custom HTML tag (`<advantage-wrapper>`) that acts as a container for your ad slots. Think of it as a "smart box" for your ads. When a normal ad is served, the box does nothing. But when a high-impact Advantage ad is served, the box tells the website how to change its layout to accommodate the ad.

It's designed to securely and efficiently load the designated [format](formats.md) into the page's content, ensuring that ads are displayed in the intended manner without disrupting the user experience or site layout.

<div class="tip custom-block" style="padding-top: 8px">
  ℹ️ Using the Advantage Wrapper is highly recommended as it makes implementing Advantage high-impact formats on your website quick and easy. But if you already have custom implementations of the formats that you want, you can choose not to use the wrapper.
</div>

## Layout

When no high-impact format is active, the wrapper doesn't change your layout. It sizes and positions itself like the ad element it wraps, so a banner that is centered by its parent stays centered, and a banner in a plain block container keeps its usual place. When a format starts, the format sizes the wrapper itself, for example `100svw` for topscroll and `100vw` for midscroll.

### Custom templates with fixed-position content

If you build your own ad template whose content is positioned out of the normal flow (for example a custom interscroller with a `position: fixed` creative clipped by its ad element), the wrapper has nothing to size itself by. In a parent that shrinks its children to their content, such as a flex column with `align-items: center`, it collapses to 0px wide.

Give the wrapper a width for that template in your own CSS. Target the ad element's class so regular banners in the same slot are not affected:

```css
advantage-wrapper:has(> .my-interscroller) {
    width: 100%;
}
```

Page styles on `advantage-wrapper` override the sizes that high-impact formats set. Scope rules like this to your template, or add `:not([current-format])`, so they don't change how the formats render.

## Force Format

The wrapper provides a `forceFormat` method that allows publishers to directly control which ad format to display without waiting for communication from the ad iframe. This is useful when you want to programmatically trigger a specific format based on your own logic or conditions.

### Usage

```javascript
// Basic usage - force a format by name
await wrapper.forceFormat("interstitial");

// With an iframe element
const iframe = document.querySelector("#my-ad-iframe");
await wrapper.forceFormat("expandable", iframe);

// With additional options
await wrapper.forceFormat("sticky", iframe, {
    backgroundAdURL: "https://example.com/background-ad",
    customOption: "value"
});
```

### Parameters

-   **format** (`AdvantageFormatName | string`): The name of the format to apply
-   **iframe** (`HTMLIFrameElement`, optional): The iframe element to use for the ad
-   **options** (`any`, optional): Additional options to pass to the format's setup function

### How it Works

1. **Setup Ad Context**: If an iframe is provided, the method creates an `AdvantageAd` object with the iframe and sets up the necessary messaging infrastructure
2. **Generate Session**: Creates a unique session ID for tracking the format instance
3. **Create Message**: Constructs an internal `AdvantageMessage` with the format request and any provided options
4. **Apply Format**: Calls the internal `morphIntoFormat` method to apply the specified format

### When to Use

-   **Manual Control**: When you want to trigger formats based on user interactions or custom business logic
-   **Testing**: For testing different formats programmatically
-   **Fallback Scenarios**: When normal iframe-based communication fails or isn't available
-   **Custom Integrations**: When integrating with external ad servers or custom ad delivery systems

### Example Implementation

```javascript
// Get reference to the wrapper element
const wrapper = document.querySelector("advantage-wrapper");

// Force format based on screen size
if (window.innerWidth < 768) {
    await wrapper.forceFormat("mobile-banner");
} else {
    await wrapper.forceFormat("desktop-interstitial");
}

// Force format with custom background ad
const adIframe = document.querySelector("#ad-container iframe");
await wrapper.forceFormat("expandable", adIframe, {
    backgroundAdURL: "https://cdn.example.com/bg-ad.jpg",
    expandDirection: "down"
});
```

The method returns a Promise that resolves when the format has been successfully applied or rejects if there's an error during format application.
