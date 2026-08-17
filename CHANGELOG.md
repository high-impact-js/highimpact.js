# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.12.0 (2026-08-17)


### Bug Fixes

* add disconnectedCallback to AdvantageWrapper to ensure cleanup ([#60](https://github.com/high-impact-js/highimpact.js/issues/60)) ([7a5e4f7](https://github.com/high-impact-js/highimpact.js/commit/7a5e4f7437f0eb53a157e12166dce15f14faef7d)), closes [#61](https://github.com/high-impact-js/highimpact.js/issues/61)
* add utils entry point to build configuration ([0254be8](https://github.com/high-impact-js/highimpact.js/commit/0254be8c9ebebdd096725aae12ed940ffb5ce62f))
* change name of retry interval in send message ([36cd9df](https://github.com/high-impact-js/highimpact.js/commit/36cd9df358a4d8576d1918e179340a0d9646d953))
* changed the execution order so that integration setup is run after default setup. ([#9](https://github.com/high-impact-js/highimpact.js/issues/9)) ([e5831cc](https://github.com/high-impact-js/highimpact.js/commit/e5831cc832a52f32bc58bf6d0291701303fe8a5d))
* clip-path instead of clip ([e31bfd5](https://github.com/high-impact-js/highimpact.js/commit/e31bfd530cbd1f9701fda0c6f4cb2f11e25c3322))
* deprecate onReset, onClose ([cfd5f91](https://github.com/high-impact-js/highimpact.js/commit/cfd5f914552f341aabc1bd1aa23ea1fe36800c81))
* detect reset ([#56](https://github.com/high-impact-js/highimpact.js/issues/56)) ([333fc5a](https://github.com/high-impact-js/highimpact.js/commit/333fc5ae99dbe70eb00d12f63cc7b1904592bec3))
* dev/demo updates ([d4faa19](https://github.com/high-impact-js/highimpact.js/commit/d4faa19fa1fa3abf37bc0a63e1d38e455e82a7db))
* export missing types ([d5d2a45](https://github.com/high-impact-js/highimpact.js/commit/d5d2a45b8364e837e7c74171aa2919d5c3339033))
* fallback when "CSSStyleSheet" not supported ([#38](https://github.com/high-impact-js/highimpact.js/issues/38)) ([ccd5206](https://github.com/high-impact-js/highimpact.js/commit/ccd520620a62e80580d8dc2361ddeb934ff8dea0))
* remove advantage-ad-background on reset in multi-midscroll formats ([#71](https://github.com/high-impact-js/highimpact.js/issues/71)) ([c29bd83](https://github.com/high-impact-js/highimpact.js/commit/c29bd837a9c87bd5f1dbc1a081ecb3638dd51663))
* remove dev images ([12f2911](https://github.com/high-impact-js/highimpact.js/commit/12f2911b544c75473396618c122aa0c4f2257082))
* remove need for running configure ([10c5dec](https://github.com/high-impact-js/highimpact.js/commit/10c5dec8af0fb9025158f1f9b5b79d578edc5c1c))
* removed unused close-button from midscroll ([#11](https://github.com/high-impact-js/highimpact.js/issues/11)) ([7d5f793](https://github.com/high-impact-js/highimpact.js/commit/7d5f793ebe50f7577d896b6c1f0ae223ec538e7e))
* reset topscroll styles on close ([#63](https://github.com/high-impact-js/highimpact.js/issues/63)) ([b1fe55c](https://github.com/high-impact-js/highimpact.js/commit/b1fe55c97e6b07fdd13ec5e1e8b10d8d06b0bdc3))
* set default height dimensions on formats ([933e209](https://github.com/high-impact-js/highimpact.js/commit/933e2096005f90b6a6757b4b17837520392ac227))
* throw if element not provided ([af79fb7](https://github.com/high-impact-js/highimpact.js/commit/af79fb740b856d46fbcf5fc7360336194958e217))
* **welcome page:** hide site title on small screens ([#34](https://github.com/high-impact-js/highimpact.js/issues/34)) ([3aedf10](https://github.com/high-impact-js/highimpact.js/commit/3aedf1067d6a1fe3a1e78fb6533a2d7c0e72f70e))
* **welcomepage:** add back 0s transition handle ([3a0bdf2](https://github.com/high-impact-js/highimpact.js/commit/3a0bdf21d2fd9ca517ad9d7b5d109aee08a882b8))
* **welcomepage:** change from svh to dvh ([#44](https://github.com/high-impact-js/highimpact.js/issues/44)) ([626c6c5](https://github.com/high-impact-js/highimpact.js/commit/626c6c5391183724f7a6cf330fac8f33197af13f))


### Features

* add allowedFormats parameter to advantageWrapAdSlotElement helper ([429e3d0](https://github.com/high-impact-js/highimpact.js/commit/429e3d00690859dd22ffb5153b824d3d5db110ec))
* add double midscroll single creative format ([#65](https://github.com/high-impact-js/highimpact.js/issues/65)) ([d38c86d](https://github.com/high-impact-js/highimpact.js/commit/d38c86d13caea5b6334d4b573b8a5a3fbb0c3bce))
* allowed-formats ([#48](https://github.com/high-impact-js/highimpact.js/issues/48)) ([d2737d3](https://github.com/high-impact-js/highimpact.js/commit/d2737d393ffa848e58a90af2353791ae8d00a793))
* catch format setup and integration errors ([dd13414](https://github.com/high-impact-js/highimpact.js/commit/dd134143d269b756a99124038937696c93ac09d3))
* current-format attribute to AdvantageWrapper for easier debugging ([#53](https://github.com/high-impact-js/highimpact.js/issues/53)) ([07e30dc](https://github.com/high-impact-js/highimpact.js/commit/07e30dcefc06fba79075557410b794d41b0239e0))
* enhance DOM change detection for iframes in AdvantageWrapper ([8284346](https://github.com/high-impact-js/highimpact.js/commit/82843462ced645fcea88cdeba9f7f8dc9d294b85))
* extended AdvantageFormatOptions to also include an animation duration for the close button event ([#21](https://github.com/high-impact-js/highimpact.js/issues/21)) ([81976e2](https://github.com/high-impact-js/highimpact.js/commit/81976e2cb43e9d82ab1bbecd7c58c4ad5fed8740))
* format options to include closeButton and downArrow properties ([#13](https://github.com/high-impact-js/highimpact.js/issues/13)) ([7f919ab](https://github.com/high-impact-js/highimpact.js/commit/7f919ab6b09afbe590ba4a4ed8f58c7c575b85cf))
* introduce Double Midscroll Format ([#49](https://github.com/high-impact-js/highimpact.js/issues/49)) ([0155be3](https://github.com/high-impact-js/highimpact.js/commit/0155be32abe0b1110787134ad6334f063093d0c7))
* multiple improvements; exlude-formats and promises in format setup + more ([f0aae81](https://github.com/high-impact-js/highimpact.js/commit/f0aae8100b4e262dbe8b9040613081bc39c36228))
* nested iframes ([cf65317](https://github.com/high-impact-js/highimpact.js/commit/cf65317f7b0fa46e005e548503a6ebe691c22a8d))
* new logging class to make it less noizy ([74d9080](https://github.com/high-impact-js/highimpact.js/commit/74d90804d6c9e1a24b2af6343b572317455c64ee))
* separated messaging protocol from wrapper ([26b91c6](https://github.com/high-impact-js/highimpact.js/commit/26b91c6d4134399ae4bd1acedd811ccc72054a07))
* **topscroll:** add click handlers for downArrow scroll and close button in topscroll format ([#58](https://github.com/high-impact-js/highimpact.js/issues/58)) ([b0cfcaa](https://github.com/high-impact-js/highimpact.js/commit/b0cfcaa5b7b8505c6aed28a034e5bd81611f35a2))
* triple midscroll format support ([#55](https://github.com/high-impact-js/highimpact.js/issues/55)) ([e4c70fc](https://github.com/high-impact-js/highimpact.js/commit/e4c70fcb07fa46f67643d36236e986ba7f9c96f5))
* update brand ([6e5a55e](https://github.com/high-impact-js/highimpact.js/commit/6e5a55ead7b761f1c33c60d5d5d028c8a9819313))
* welcome page format ([#32](https://github.com/high-impact-js/highimpact.js/issues/32)) ([5814cf9](https://github.com/high-impact-js/highimpact.js/commit/5814cf9ab0fedb9156b4624c7cd789835435d699))
* wrapping helper + readme updates ([77f17c4](https://github.com/high-impact-js/highimpact.js/commit/77f17c4a314f3af9153ee01377a28799c7f56608))

## [0.11.2](https://github.com/get-advantage/advantage/compare/v0.11.1...v0.11.2) (2026-04-21)


### Bug Fixes

* remove advantage-ad-background on reset in multi-midscroll formats ([#71](https://github.com/get-advantage/advantage/issues/71)) ([c29bd83](https://github.com/get-advantage/advantage/commit/c29bd837a9c87bd5f1dbc1a081ecb3638dd51663))

## [0.11.1](https://github.com/get-advantage/advantage/compare/v0.11.0...v0.11.1) (2026-03-26)


### Bug Fixes

* **welcomepage:** add back 0s transition handle ([3a0bdf2](https://github.com/get-advantage/advantage/commit/3a0bdf21d2fd9ca517ad9d7b5d109aee08a882b8))

# [0.11.0](https://github.com/get-advantage/advantage/compare/v0.10.2...v0.11.0) (2026-01-18)


### Bug Fixes

* add utils entry point to build configuration ([0254be8](https://github.com/get-advantage/advantage/commit/0254be8c9ebebdd096725aae12ed940ffb5ce62f))


### Features

* add double midscroll single creative format ([#65](https://github.com/get-advantage/advantage/issues/65)) ([d38c86d](https://github.com/get-advantage/advantage/commit/d38c86d13caea5b6334d4b573b8a5a3fbb0c3bce))

## [0.10.2](https://github.com/get-advantage/advantage/compare/v0.10.1...v0.10.2) (2025-12-17)


### Bug Fixes

* reset topscroll styles on close ([#63](https://github.com/get-advantage/advantage/issues/63)) ([b1fe55c](https://github.com/get-advantage/advantage/commit/b1fe55c97e6b07fdd13ec5e1e8b10d8d06b0bdc3))

## [0.10.1](https://github.com/get-advantage/advantage/compare/v0.10.0...v0.10.1) (2025-12-11)


### Bug Fixes

* add disconnectedCallback to AdvantageWrapper to ensure cleanup ([#60](https://github.com/get-advantage/advantage/issues/60)) ([7a5e4f7](https://github.com/get-advantage/advantage/commit/7a5e4f7437f0eb53a157e12166dce15f14faef7d)), closes [#61](https://github.com/get-advantage/advantage/issues/61)
* **welcomepage:** change from svh to dvh ([#44](https://github.com/get-advantage/advantage/issues/44)) ([626c6c5](https://github.com/get-advantage/advantage/commit/626c6c5391183724f7a6cf330fac8f33197af13f))

# [0.10.0](https://github.com/get-advantage/advantage/compare/v0.9.1...v0.10.0) (2025-11-24)


### Features

* **topscroll:** add click handlers for downArrow scroll and close button in topscroll format ([#58](https://github.com/get-advantage/advantage/issues/58)) ([b0cfcaa](https://github.com/get-advantage/advantage/commit/b0cfcaa5b7b8505c6aed28a034e5bd81611f35a2))

## [0.9.1](https://github.com/get-advantage/advantage/compare/v0.9.0...v0.9.1) (2025-10-21)


### Bug Fixes

* detect reset ([#56](https://github.com/get-advantage/advantage/issues/56)) ([333fc5a](https://github.com/get-advantage/advantage/commit/333fc5ae99dbe70eb00d12f63cc7b1904592bec3))

# [0.9.0](https://github.com/get-advantage/advantage/compare/v0.8.0...v0.9.0) (2025-09-23)


### Features

* current-format attribute to AdvantageWrapper for easier debugging ([#53](https://github.com/get-advantage/advantage/issues/53)) ([07e30dc](https://github.com/get-advantage/advantage/commit/07e30dcefc06fba79075557410b794d41b0239e0))
* triple midscroll format support ([#55](https://github.com/get-advantage/advantage/issues/55)) ([e4c70fc](https://github.com/get-advantage/advantage/commit/e4c70fcb07fa46f67643d36236e986ba7f9c96f5))

# [0.8.0](https://github.com/get-advantage/advantage/compare/v0.7.0...v0.8.0) (2025-06-27)


### Features

* add allowedFormats parameter to advantageWrapAdSlotElement helper ([429e3d0](https://github.com/get-advantage/advantage/commit/429e3d00690859dd22ffb5153b824d3d5db110ec))

# [0.7.0](https://github.com/get-advantage/advantage/compare/v0.6.1...v0.7.0) (2025-06-10)


### Features

* allowed-formats ([#48](https://github.com/get-advantage/advantage/issues/48)) ([d2737d3](https://github.com/get-advantage/advantage/commit/d2737d393ffa848e58a90af2353791ae8d00a793))
* introduce Double Midscroll Format ([#49](https://github.com/get-advantage/advantage/issues/49)) ([0155be3](https://github.com/get-advantage/advantage/commit/0155be32abe0b1110787134ad6334f063093d0c7))

## [0.6.1](https://github.com/get-advantage/advantage/compare/v0.6.0...v0.6.1) (2025-05-12)

# [0.6.0](https://github.com/get-advantage/advantage/compare/v0.6.0-next.2...v0.6.0) (2025-03-24)

# [0.6.0-next.2](https://github.com/get-advantage/advantage/compare/v0.6.0-next.1...v0.6.0-next.2) (2025-03-24)

### Bug Fixes

-   export missing types ([d5d2a45](https://github.com/get-advantage/advantage/commit/d5d2a45b8364e837e7c74171aa2919d5c3339033))

# [0.6.0-next.1](https://github.com/get-advantage/advantage/compare/v0.6.0-next.0...v0.6.0-next.1) (2025-02-27)

### Features

-   enhance DOM change detection for iframes in AdvantageWrapper ([8284346](https://github.com/get-advantage/advantage/commit/82843462ced645fcea88cdeba9f7f8dc9d294b85))

-   feat: nested iframes (cf65317)

## [0.5.2](https://github.com/get-advantage/advantage/compare/v0.5.1...v0.5.2) (2024-10-24)

### Bug Fixes

-   fallback when "CSSStyleSheet" not supported ([#38](https://github.com/get-advantage/advantage/issues/38)) ([ccd5206](https://github.com/get-advantage/advantage/commit/ccd520620a62e80580d8dc2361ddeb934ff8dea0))

## [0.5.1](https://github.com/get-advantage/advantage/compare/v0.5.0...v0.5.1) (2024-10-15)

### Bug Fixes

-   **welcome page:** hide site title on small screens ([#34](https://github.com/get-advantage/advantage/issues/34)) ([3aedf10](https://github.com/get-advantage/advantage/commit/3aedf1067d6a1fe3a1e78fb6533a2d7c0e72f70e))

# [0.5.0](https://github.com/get-advantage/advantage/compare/v0.3.0...v0.5.0) (2024-10-02)

### Features

-   extended AdvantageFormatOptions to also include an animation duration for the close button event ([#21](https://github.com/get-advantage/advantage/issues/21)) ([81976e2](https://github.com/get-advantage/advantage/commit/81976e2cb43e9d82ab1bbecd7c58c4ad5fed8740))
-   welcome page format ([#32](https://github.com/get-advantage/advantage/issues/32)) ([5814cf9](https://github.com/get-advantage/advantage/commit/5814cf9ab0fedb9156b4624c7cd789835435d699))

# [0.4.0](https://github.com/get-advantage/advantage/compare/v0.3.0...v0.4.0) (2024-10-01)

### Features

-   extended AdvantageFormatOptions to also include an animation duration for the close button event ([#21](https://github.com/get-advantage/advantage/issues/21)) ([81976e2](https://github.com/get-advantage/advantage/commit/81976e2cb43e9d82ab1bbecd7c58c4ad5fed8740))

# [0.3.0](https://github.com/get-advantage/advantage/compare/v0.2.0...v0.3.0) (2024-09-10)

### Bug Fixes

-   removed unused close-button from midscroll ([#11](https://github.com/get-advantage/advantage/issues/11)) ([7d5f793](https://github.com/get-advantage/advantage/commit/7d5f793ebe50f7577d896b6c1f0ae223ec538e7e))

### Features

-   format options to include closeButton and downArrow properties ([#13](https://github.com/get-advantage/advantage/issues/13)) ([7f919ab](https://github.com/get-advantage/advantage/commit/7f919ab6b09afbe590ba4a4ed8f58c7c575b85cf))

# [0.2.0](https://github.com/get-advantage/advantage/compare/v0.1.1...v0.2.0) (2024-06-20)

### Bug Fixes

-   changed the execution order so that integration setup is run after default setup. ([#9](https://github.com/get-advantage/advantage/issues/9)) ([e5831cc](https://github.com/get-advantage/advantage/commit/e5831cc832a52f32bc58bf6d0291701303fe8a5d))
-   deprecate onReset, onClose ([cfd5f91](https://github.com/get-advantage/advantage/commit/cfd5f914552f341aabc1bd1aa23ea1fe36800c81))

### Features

-   new logging class to make it less noizy ([74d9080](https://github.com/get-advantage/advantage/commit/74d90804d6c9e1a24b2af6343b572317455c64ee))

## [0.1.1](https://github.com/get-advantage/advantage/compare/v0.1.0...v0.1.1) (2024-06-11)

### Bug Fixes

-   set default height dimensions on formats ([933e209](https://github.com/get-advantage/advantage/commit/933e2096005f90b6a6757b4b17837520392ac227))
-   throw if element not provided ([af79fb7](https://github.com/get-advantage/advantage/commit/af79fb740b856d46fbcf5fc7360336194958e217))
