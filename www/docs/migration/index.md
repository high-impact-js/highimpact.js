---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Migration</code></p>

# The Merge: Advantage + High Impact JS → High Impact JS

**Advantage** and **High Impact JS** have merged into a single, unified library: **High Impact JS**.

This section explains why the projects merged, what it means for you, and how to migrate depending on which library you were using before.

## Why Merge?

The goal of both projects has always been the same: make high-impact advertising on the web better — more standardized, more secure, and easier to implement.

Having two libraries solving the same problem was creating fragmentation. Publishers had to choose between them. Creatives had to support both. Neither could become the standard on its own.

By merging, we create **one open-source standard** for high-impact advertising that benefits everyone:

-   **Publishers** get a single, well-maintained library with broad ad platform support
-   **Creatives & ad tech vendors** target one implementation instead of two
-   **The ecosystem** moves toward interoperability rather than fragmentation

The merged library keeps the name **High Impact JS** and combines the best of both projects:

| From Advantage                                           | From High Impact JS                       |
| :------------------------------------------------------- | :---------------------------------------- |
| Web Component architecture (`<advantage-wrapper>`)       | Declarative slot-based API (`defineSlot`) |
| Secure messaging protocol (MessageChannel)               | Ad server plugin integrations             |
| Format system (Topscroll, Midscroll, Welcome Page, etc.) | Template configuration system             |
| UI Layer customization                                   | One-tag banner compatibility              |
| Shadow DOM isolation                                     | Post-message signal handling              |

## What Changed?

At the technical level, the Advantage core engine now powers everything, while the High Impact JS API is available as a first-class configuration layer on top.

### New Package & Repository

|                 | Before                               | After                                     |
| :-------------- | :----------------------------------- | :---------------------------------------- |
| **NPM package** | `@get-advantage/advantage`           | `highimpact.js`                           |
| **Repository**  | `github.com/get-advantage/advantage` | `github.com/high-impact-js/highimpact.js` |
| **Website**     | `get-advantage.org`                  | `gethighimpact.org`                       |

### The Two API Styles

The merged library supports **two ways** to configure ad slots. Both work simultaneously and can be mixed on the same page.

**Wrapper API** (from Advantage) — wrap your ad slots in HTML:

```html
<advantage-wrapper>
    <div slot="advantage-ad-slot">
        <!-- your ad slot -->
    </div>
</advantage-wrapper>
```

**Slot API** (from High Impact JS) — declare slots in JavaScript:

```js
highImpactJs.defineSlot({
    adUnitId: "/1234/my-topscroll-ad",
    template: "topscroll",
    sizes: [
        [970, 250],
        [1920, 1080]
    ]
});
```

Both approaches end up using the same underlying `<advantage-wrapper>` web component. The Slot API simply creates and manages wrappers automatically.

## Choose Your Migration Path

<div class="flex flex-col sm:flex-row gap-4 my-8">
  <a href="./from-advantage" class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
    Migrating from Advantage →
  </a>
  <a href="./from-high-impact-js" class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
    Migrating from High Impact JS →
  </a>
  <a href="./api" class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
    Slot API Reference →
  </a>
</div>
