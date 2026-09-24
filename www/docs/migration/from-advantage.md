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
| One-tag banner support     | With optional mapping    | ✅                        |
| Ad-server detection        | Small optional bridge    | Built-in GAM/Xandr plugins |
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
+ import { Advantage } from "highimpact.js/advantage";
```

The `/advantage` entry contains the wrapper API and Advantage creative
messaging protocol without loading the High Impact JS Slot API or its full
GAM/Xandr compatibility adapters. Import from `highimpact.js` instead if the
installation also uses `defineSlot`. Format-agnostic `AD_RENDERED` creatives
can be enabled on the lean entry with `formatAgnosticCreatives` and the
optional `highimpact.js/advantage/gam` bridge.

```diff
- import { advantageWrapAdSlotElement } from "@get-advantage/advantage/utils";
 import { advantageWrapAdSlotElement } from "highimpact.js/utils";
```

```diff
- import { AdvantageCreativeMessenger } from "@get-advantage/advantage/creative";
 import { AdvantageCreativeMessenger } from "highimpact.js/creative";
```

### 3. Add one-tag banner support (optional)

There are two ways to add format-agnostic creatives. If you prefer the Slot API,
add `defineSlot` calls for the relevant ad slots:

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

To keep the legacy Advantage installation lean, keep the wrappers and map the
booked sentinel sizes instead:

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

These are example mappings, not library defaults. Configure the sizes your
publisher uses to designate each format. Detection uses the size selected by
the ad server, not the creative iframe's `width`, `height`, or CSS dimensions.

### 4. Done

That's it. Your existing Advantage implementation continues to work, and you now have access to the Slot API for any new slots where you want one-tag banner support or prefer JavaScript-based configuration.

## FAQ

### Can I use both the Wrapper API and the Slot API on the same page?

Yes. They're complementary. An `<advantage-wrapper>` in HTML and a `defineSlot()` call can coexist. If `defineSlot` finds that a slot is already wrapped, it uses the existing wrapper.

### Do I need to change my creative code?

No. The `AdvantageCreativeMessenger` works exactly as before. Just update the import path to the new package name.

### What about `formatIntegrations` in my Advantage config?

They continue to work. The Slot API's `setTemplateConfig` serves a similar purpose but with a different API shape. You can use either or both — they don't conflict.

## Incremental configuration

`Advantage.configure()` now shallow-merges top-level settings. An omitted key
retains its previous value. A supplied array or nested object replaces the whole
previous value; entries are not concatenated or deeply merged.

```ts
const advantage = Advantage.getInstance();
advantage.configure({ formatIntegrations: siteIntegrations });
advantage.configure({
    formatAgnosticCreatives: {
        formatMappings: [{ format: "TOPSCROLL", sizes: [[970, 250]] }]
    }
});
// Both the integrations and creative mappings are now configured.
```

Providing `formats` replaces the previous custom formats; built-in defaults
remain available and custom entries override defaults by name. Providing
`formatIntegrations` replaces the previous integrations, removing omitted entries.
If the same name occurs more than once in a supplied array, the last entry wins.
`formats: []` restores the instance's default formats; `formatIntegrations: []`
removes all integration overrides.

To clear a single setting, supply `undefined`. To replace all settings, pass
`{ merge: false }`:

```ts
advantage.configure({ formatAgnosticCreatives: undefined });
advantage.configure(nextConfig, { merge: false });
advantage.configure({}, { merge: false }); // Restore configuration defaults.
```

This changes repeated-call behavior from 0.13.0: previously the config object was
replaced, custom formats could disappear when omitted, and integration entries
accumulated. Callers that need replacement should opt into `{ merge: false }`.
Callers building integration lists over multiple calls must now pass the full
intended list. Configuration updates do not reset existing wrappers or tear down
already initialized compatibility plugins. Compatibility initialization is
requested only when the incoming config explicitly sets
`enableHighImpactCompatibility: true`; unrelated updates do not request it again.

### Remote configuration

A `configUrlResolver` supplied in a call loads a module that must default-export a
configuration object. As before, local settings alongside that resolver are not
applied. The loaded object follows the same merge/replacement option as that
call; an inherited resolver is never invoked by an unrelated update.

```ts
advantage.configure({ configUrlResolver: () => "/publisher-config.js" });
// /publisher-config.js: export default { formatIntegrations: [...] };
```

A newer `configure()` call supersedes any pending remote result, even when the
newer call only updates an unrelated setting. Between concurrent remote loads,
only the most recently requested result may apply. Failed loads or modules
without a valid default config object are logged and leave the active
configuration intact. Replacement mode also waits for a valid result before
replacing settings. `configure()` remains synchronous and returns `void`; when
using remote loading, combine the intended settings in the exported config
instead of following the load request with an immediate local update.
