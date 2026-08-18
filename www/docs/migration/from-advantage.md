---
pageClass: docs
---

<p class="text-sm text-slate-500"><code>Docs > Migration > From Advantage</code></p>

# Migrating from Advantage

If your site already uses the `@get-advantage/advantage` package, the migration is straightforward. **Your existing code will continue to work without changes.** The merged library is a superset — everything that worked before still works.

## What Stays the Same

- The `<advantage-wrapper>` web component and its API
- `Advantage.getInstance()` and `.configure()`
- `advantageWrapAdSlotElement()` helper function
- All format names (`TOPSCROLL`, `MIDSCROLL`, `WELCOME_PAGE`, etc.)
- The `AdvantageCreativeMessenger` for creative-side code
- Format integrations (`setup`, `reset`, `close`, `onReset`, `onClose`)
- Shadow DOM isolation, UI Layer, and the messaging protocol

## What's New

The merged library adds the **Slot API** — a JavaScript-based way to define ad slots. This is what enables compatibility with one-tag banner solutions (creatives that are built to work anywhere).

You don't have to use it if your current setup works, but it opens up new capabilities:

| Feature                    | Wrapper API              | Slot API                  |
| :------------------------- | :----------------------- | :------------------------ |
| Define slots in HTML       | ✅                       | —                         |
| Define slots in JavaScript | —                        | ✅                        |
| One-tag banner support     | —                        | ✅                        |
| GAM/Xandr auto-detection   | —                        | ✅                        |
| Template configuration     | Via `formatIntegrations` | Via `setTemplateConfig()` |

## Step-by-Step Migration

### 1. Update the package

```sh
# Remove the old package
npm uninstall @get-advantage/advantage

# Install the new package
npm install highimpact.js
```

### 2. Update imports

```diff
- import { Advantage } from "@get-advantage/advantage";
+ import { Advantage } from "highimpact.js";
```

```diff
- import { advantageWrapAdSlotElement } from "@get-advantage/advantage/utils";
 import { advantageWrapAdSlotElement } from "highimpact.js/utils";
```

```diff
- import { AdvantageCreativeMessenger } from "@get-advantage/advantage/creative";
 import { AdvantageCreativeMessenger } from "highimpact.js/creative";
```

### 3. Add one-tag banner support

Add `defineSlot` calls for the relevant ad slots:

```js
import { defineSlot } from "highimpact.js";

defineSlot({
    adUnitId: "/your-network/topscroll-ad",
    template: "topscroll",
    sizes: [[1920, 1080]],
    waitForAdSignal: true
});
```

This can coexist with your existing `<advantage-wrapper>` elements. If a slot is already wrapped, `defineSlot` will recognize it and skip the wrapping step.

### 4. Done

That's it. Your existing Advantage implementation continues to work, and you now have access to the Slot API for any new slots where you want one-tag banner support or prefer JavaScript-based configuration.

## FAQ

### Can I use both the Wrapper API and the Slot API on the same page?

Yes. They're complementary. An `<advantage-wrapper>` in HTML and a `defineSlot()` call can coexist. If `defineSlot` finds that a slot is already wrapped, it uses the existing wrapper.

### Do I need to change my creative code?

No. The `AdvantageCreativeMessenger` works exactly as before. Just update the import path to the new package name.

### What about `formatIntegrations` in my Advantage config?

They continue to work. The Slot API's `setTemplateConfig` serves a similar purpose but with a different API shape. You can use either or both — they don't conflict.
