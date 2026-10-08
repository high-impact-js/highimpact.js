---
pageClass: docs
---

<style>
.path-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin: 2.5rem 0;
}
@media (min-width: 768px) {
  .path-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.path-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: border-color 0.2s;
  background: var(--vp-c-bg-soft);
}
.dark .path-card {
  border-color: #3f3f46;
}
.path-card:hover {
  border-color: #6b04fd;
}
.icon-box {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: white;
  background-color: #6b04fd;
  transition: background-color 0.2s;
  text-decoration: none !important;
}
.btn-primary:hover {
  background-color: #5b03d6;
}
</style>

<p class="text-sm text-slate-500"><code>Docs > Get started</code></p>

## The Merge: Advantage + High Impact JS

High Impact JS is the result of merging two open-source projects — **Advantage** and the original **High Impact JS** — into a single library. Both projects set out to solve the same problem: making high-impact advertising on the web more standardized, more secure, and easier to implement. Having two libraries created fragmentation, so we combined the best of both into one:

| From Advantage                               | From High Impact JS                          |
| :------------------------------------------- | :------------------------------------------- |
| Web Component engine (`<advantage-wrapper>`) | Declarative Slot API (`defineSlot`)          |
| Secure MessageChannel messaging              | Ad server plugin integrations              |
| Format system (Topscroll, Midscroll, etc.)   | Template configuration system                |
| Shadow DOM isolation & UI Layer              | One-tag banner / post-message signal support |

### Why some things are still called "Advantage"

You'll notice that the HTML element is still `<advantage-wrapper>`, events are prefixed `advantage:`, and some TypeScript APIs use `Advantage` in their names (e.g., `AdvantageFormatName`, `AdvantageCreativeMessenger`).

This is intentional. For this first merged release we kept the internal naming from Advantage to ensure a **smooth, non-breaking transition**. Existing Advantage integrations continue to work without changes, and the High Impact JS Slot API is layered on top.

In a future **2.0 major release** with breaking changes, we plan to rename all elements, events, and APIs to use the `highImpactJs` / `high-impact-js` naming consistently. Until then, both naming conventions coexist and work correctly.

For the full story behind the merge, migration guides for both libraries, and the complete Slot API reference, see the **[Migration section](./migration/)**.

## Explore More

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <a href="./concepts/formats" class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors">
    <strong>🎯 Core Concepts</strong><br>
    <span class="text-sm text-gray-500">Learn about Formats, Wrappers, and the Messaging Protocol.</span>
  </a>
  <a href="./formats/topscroll" class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors">
    <strong>🛠 Available Formats</strong><br>
    <span class="text-sm text-gray-500">Specs for Topscroll, Midscroll, Welcome Page and more.</span>
  </a>
  <a href="./examples/hello-world" class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors">
    <strong>💡 Developer Tools</strong><br>
    <span class="text-sm text-gray-500">MCP Server and ready-to-use code examples.</span>
  </a>
  <a href="../api/" class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors">
    <strong>🔧 API Reference</strong><br>
    <span class="text-sm text-gray-500">Complete TypeScript API documentation.</span>
  </a>
</div>

## Community & Support

-   **[GitHub Issues](https://github.com/high-impact-js/highimpact.js/issues)** - Report bugs and request features
-   **[Slack Community](https://join.slack.com/t/high-impact-js/shared_invite/zt-2gy6c4z4m-4~pIuwRfe8eqPM5H7iV9MQ)** - Connect with other developers and get help
-   **[Contributing Guide](../about/contributions.md)** - Learn how to contribute to the project
-   **[API Documentation](../api/)** - Complete TypeScript API reference
-   **[GitHub Repository](https://github.com/high-impact-js/highimpact.js)** - Source code and examples
-   **[Changelog](./changelog.md)** - Track updates and new features

Ready to transform your advertising experience? Choose your path above and start building with High Impact JS today!
