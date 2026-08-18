> [!NOTE]
> **Advantage + High Impact JS → High Impact JS**
>
> Advantage and High Impact JS have merged into a single, unified library: High Impact JS.
> 
> Learn more at [highimpact.org](https://gethighimpact.org/docs/migration/).

<p align="center">
  <picture>
    <img src="./www/public/logo/hi-logo.svg" height="80">
  </picture>
</p>

<h3 align="center">The open JavaScript library for high-performing ad formats</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@get-advantage/advantage"><img src="https://img.shields.io/npm/v/@get-advantage/advantage?label=npm" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg" alt="contributions welcome"></a>
  <a href="https://www.jsdelivr.com/package/npm/@get-advantage/advantage"><img src="https://data.jsdelivr.com/v1/package/npm/@get-advantage/advantage/badge" alt="jsDelivr hits"></a>
</p>

---

**highimpact.js** is the open-source JavaScript library that connects publishers and advertisers through a unified, standards-based API for high-impact ad formats — enabling attention-driven advertising without the fragmentation, vendor lock-in, or security trade-offs that come with traditional integrations.

---

## What it does

highimpact.js sits between your site and the ad formats running on it. It provides a single, consistent interface for integrating high-impact formats — regardless of which ad tech platform delivers them.

- **Unified API** — one integration covers all high-impact formats and platforms
- **Secure by default** — sandboxed communication between page and ad creative
- **Publisher control** — configure behavior, constraints, and fallbacks on your own terms
- **Ad server agnostic** — works alongside GAM, Prebid, and any standards-based setup
- **Typed & tree-shakeable** — full TypeScript support, ESM and CJS builds included

## Why

High-impact advertising works. Attention-driven formats consistently outperform standard display on every metric that matters — viewability, recall, engagement. But implementing them has historically meant accepting a mess: one-off vendor scripts, opaque iframe communication, inconsistent behavior across formats, and security risks from unconstrained creative code.

highimpact.js was built to fix that. It formalizes the contract between publisher and ad creative so that high-impact formats can be delivered safely, predictably, and at scale — without surrendering control of your site to the ad server.

## Quick Start

> [!NOTE] 
> **Package names during rename transition**
>
> The library is being renamed from **Advantage** to **highimpact.js**. Dual-published packages are available during the transition. 
> 
> Internal code, class names, and element names (e.g. `Advantage`, `<advantage-wrapper>`) still reflect the old name and will be updated in a future release.

### Install

```bash
# new name
npm install highimpact.js

# or legacy name (identical package)
npm install @get-advantage/advantage
```

### Add to your page

```js
import { Advantage } from "highimpact.js";

const advantage = new Advantage();
await advantage.setup();
```

### Mark your ad slots

Wrap any ad slot you want highimpact.js to manage with the `<advantage-wrapper>` element:

```html
<advantage-wrapper>
  <!-- your ad slot here -->
  <div id="ad-unit-top"></div>
</advantage-wrapper>
```

That's it. highimpact.js handles format negotiation, creative communication, and lifecycle management from there.

Read the full [documentation](https://get-advantage.org) for configuration options, format guides, and advanced usage.

---

## Contributing

Any kind of positive contribution is welcome. Please help us grow by contributing to the project.

> Please read [`CONTRIBUTING`](CONTRIBUTING.md) for details on our [`CODE OF CONDUCT`](CODE-OF-CONDUCT.md), and the process for submitting pull requests.

Interested in becoming a maintainer? Check out our [Governance](GOVERNANCE.md) and [Maintainers](MAINTAINERS.md) documentation.

New to Open Source? Follow this [guide](https://opensource.guide/how-to-contribute/) to get started.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/en/reference/emoji-key/)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pattan"><img src="https://avatars.githubusercontent.com/u/1073964?v=4?s=100" width="100px;" alt="Patrik Wilhelmsson"/><br /><sub><b>Patrik Wilhelmsson</b></sub></a><br /><a href="https://github.com/get-advantage/advantage/commits?author=pattan" title="Documentation">📖</a> <a href="#ideas-pattan" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pontusarmini"><img src="https://avatars.githubusercontent.com/u/4329077?v=4?s=100" width="100px;" alt="Pontus Armini"/><br /><sub><b>Pontus Armini</b></sub></a><br /><a href="https://github.com/get-advantage/advantage/commits?author=pontusarmini" title="Code">💻</a> <a href="https://github.com/get-advantage/advantage/commits?author=pontusarmini" title="Documentation">📖</a> <a href="#ideas-pontusarmini" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rebeckasjostrom1"><img src="https://avatars.githubusercontent.com/u/73482574?v=4?s=100" width="100px;" alt="Rebecka Sjöström"/><br /><sub><b>Rebecka Sjöström</b></sub></a><br /><a href="https://github.com/get-advantage/advantage/commits?author=rebeckasjostrom1" title="Documentation">📖</a> <a href="#ideas-rebeckasjostrom1" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dsoohn"><img src="https://avatars.githubusercontent.com/u/27854867?v=4?s=100" width="100px;" alt="Daniel Granlund"/><br /><sub><b>Daniel Granlund</b></sub></a><br /><a href="#design-dsoohn" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sannheim"><img src="https://avatars.githubusercontent.com/u/26486263?v=4?s=100" width="100px;" alt="Joakim Sannheim"/><br /><sub><b>Joakim Sannheim</b></sub></a><br /><a href="https://github.com/get-advantage/advantage/commits?author=sannheim" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/erikarvidssonmadington"><img src="https://avatars.githubusercontent.com/u/73878569?v=4?s=100" width="100px;" alt="erikarvidssonmadington"/><br /><sub><b>erikarvidssonmadington</b></sub></a><br /><a href="#ideas-erikarvidssonmadington" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/linusforsell"><img src="https://avatars.githubusercontent.com/u/4910742?v=4?s=100" width="100px;" alt="Linus Forsell"/><br /><sub><b>Linus Forsell</b></sub></a><br /><a href="https://github.com/get-advantage/advantage/commits?author=linusforsell" title="Documentation">📖</a> <a href="#ideas-linusforsell" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/get-advantage/advantage/commits?author=linusforsell" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://nicolaykjaernet.com"><img src="https://avatars.githubusercontent.com/u/89392338?v=4?s=100" width="100px;" alt="Nicolay Kjærnet"/><br /><sub><b>Nicolay Kjærnet</b></sub></a><br /><a href="https://github.com/get-advantage/advantage/commits?author=NicolayKjarnet" title="Code">💻</a> <a href="https://github.com/get-advantage/advantage/commits?author=NicolayKjarnet" title="Documentation">📖</a> <a href="#ideas-NicolayKjarnet" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/patrik-eriksson1"><img src="https://avatars.githubusercontent.com/u/167439779?v=4?s=100" width="100px;" alt="Patrik Eriksson"/><br /><sub><b>Patrik Eriksson</b></sub></a><br /><a href="https://github.com/get-advantage/advantage/commits?author=patrik-eriksson1" title="Code">💻</a> <a href="https://github.com/get-advantage/advantage/commits?author=patrik-eriksson1" title="Documentation">📖</a> <a href="#ideas-patrik-eriksson1" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/billyohgren"><img src="https://avatars.githubusercontent.com/u/1451050?v=4?s=100" width="100px;" alt="Billy Ohgren"/><br /><sub><b>Billy Ohgren</b></sub></a><br /><a href="https://github.com/get-advantage/advantage/commits?author=billyohgren" title="Code">💻</a> <a href="https://github.com/get-advantage/advantage/commits?author=billyohgren" title="Documentation">📖</a> <a href="#ideas-billyohgren" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT — see [LICENSE](LICENSE) for details.
