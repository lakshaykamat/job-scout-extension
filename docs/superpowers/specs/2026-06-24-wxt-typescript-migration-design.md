# WXT TypeScript Migration Design

## Summary

Migrate the existing Manifest V3 Chrome extension from plain JavaScript and a hand-written manifest to WXT, TypeScript, Vitest, and Playwright. Preserve the current vanilla HTML UI and LinkedIn scanning behavior during this migration. React is intentionally out of scope for this phase.

## Goals

- Build the extension with WXT instead of loading source files directly from `manifest.json`.
- Move Manifest V3 configuration into `wxt.config.ts`.
- Convert runtime code to TypeScript without changing user-facing behavior.
- Keep the feature-first hybrid architecture under `src/features/job-post-extraction/`.
- Add practical automated checks: TypeScript type checking, Vitest unit tests, and Playwright extension smoke tests.
- Keep Tailwind CSS as the styling system.

## Non-Goals

- Do not rewrite popup, options, or results pages in React.
- Do not redesign the UI.
- Do not change scan matching behavior, storage schema, export formats, or LinkedIn scanning flow.
- Do not add Gmail, form-filling, or future job-search automation features.
- Do not broaden Chrome extension permissions.

## Current State

The project is a Manifest V3 Chrome extension with runtime code in `src/`. Background and page scripts use ES modules. The LinkedIn content script is currently declared as an ordered list of JavaScript files and shares behavior through `globalThis.LinkedInHiringScanner`.

The current manifest points directly at files such as:

- `src/features/job-post-extraction/background/index.js`
- `src/features/job-post-extraction/pages/popup/index.html`
- `src/features/job-post-extraction/pages/options/index.html`
- `src/features/job-post-extraction/pages/results/index.html`
- multiple ordered content scripts under `src/features/job-post-extraction/content/`

The current project has Tailwind CSS but no TypeScript, bundler, unit tests, end-to-end tests, or dev server.

## Architecture

Use WXT as the browser extension framework and preserve the existing product boundaries.

The WXT entrypoints should be thin adapters that point into the existing feature implementation:

- Background entrypoint: initialize scan orchestration for the extension service worker.
- Content entrypoint: initialize the LinkedIn scanner on supported LinkedIn content search pages.
- Popup page: load the existing popup HTML and TypeScript behavior.
- Options page: load the existing options HTML and TypeScript behavior.
- Results page: load the existing results HTML and TypeScript behavior.

Keep business logic inside `src/features/job-post-extraction/`. Keep shared utilities in `src/shared/`. Keep job-search concepts in `src/domain/job-search/`.

## TypeScript Strategy

Convert `.js` source files to `.ts` in the same locations where possible. Use explicit exported types from `src/domain/job-search/types.ts` for shared job-search data models.

Use a practical strictness profile:

- Enable TypeScript checking.
- Include DOM and WebExtension/Chrome types.
- Avoid `any` for domain objects and message payloads.
- Allow narrow local casts only where Chrome APIs or DOM queries require them.

The content script currently relies on ordered globals. During this migration, either preserve that behavior in a typed global namespace or wrap it behind a typed local content-script adapter. The migration must not combine this with a behavioral scanner rewrite.

## Testing Strategy

Add Vitest for unit tests around logic that can run outside Chrome:

- post filtering
- text and link normalization
- formatting and download helpers where practical
- storage normalization helpers if they are extracted behind testable functions

Add Playwright for extension smoke tests:

- build the WXT extension
- launch Chromium with the built extension
- verify popup/options/results pages can load
- verify the extension manifest loads with the expected permissions and pages

Manual verification remains required because LinkedIn scanning depends on a live LinkedIn page:

- reload the unpacked WXT build
- open `https://www.linkedin.com/search/results/content/*`
- start and stop a scan
- verify saved results
- verify JSON and CSV export

## Scripts

Replace the minimal CSS-only script setup with scripts for the new stack:

- `dev`: run WXT development mode
- `build`: build the extension
- `build:css`: preserve Tailwind CSS compilation if still needed explicitly
- `typecheck`: run TypeScript checking
- `test`: run Vitest
- `test:e2e`: run Playwright tests

If WXT handles CSS bundling directly for the pages, keep `build:css` only if it remains useful for manual CSS generation.

## Migration Order

1. Install WXT, TypeScript, Chrome/WebExtension types, Vitest, Playwright, and test utilities.
2. Add WXT and TypeScript configuration.
3. Move manifest configuration into `wxt.config.ts`.
4. Create WXT entrypoints that preserve current extension behavior.
5. Convert JavaScript files to TypeScript with minimal behavioral changes.
6. Add unit tests for pure logic.
7. Add Playwright smoke tests for the built extension.
8. Update README development instructions.
9. Run build, typecheck, unit tests, and available e2e tests.

## Risks And Mitigations

- Content script order may change during bundling. Mitigation: preserve the scanner initialization order explicitly in the WXT content entrypoint and avoid scanner behavior rewrites.
- Chrome extension paths may change after WXT build output. Mitigation: use WXT-supported entrypoints and `browser.runtime.getURL`/Chrome APIs instead of hard-coded source paths where needed.
- TypeScript conversion may expose ambiguous domain shapes. Mitigation: centralize shared data models in `src/domain/job-search/types.ts` and keep local page element types near page modules.
- End-to-end tests may not fully simulate LinkedIn. Mitigation: make Playwright smoke tests verify extension load and pages, while keeping LinkedIn scanning in the manual verification checklist.

## Success Criteria

- `npm run build` produces a loadable WXT Chrome extension.
- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run test:e2e` either passes or documents any environment limitation clearly.
- Existing popup, options, results, scan start/stop, saved results, JSON export, and CSV export behavior are preserved.
- Chrome permissions remain no broader than the current manifest.
