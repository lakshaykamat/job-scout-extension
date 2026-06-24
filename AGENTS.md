# Repository Guidelines

## Project Structure & Module Organization

This is a Manifest V3 Chrome extension for a job-finding assistant. The current feature scans LinkedIn content search results and extracts hiring leads; future areas may include form filling, Gmail outreach drafting, follow-ups, and other job-search automation. Entry points are declared in `manifest.json`.

Current runtime code lives under `src/`:

- `src/features/job-post-extraction/background/` contains scan orchestration.
- `src/features/job-post-extraction/content/` contains LinkedIn scanning and extraction.
- `src/features/job-post-extraction/pages/` contains popup, options, and results pages for this feature.
- `src/features/job-post-extraction/config/` and `storage/` contain extraction-specific settings, runtime constants, and scan persistence.
- `src/domain/job-search/` contains shared job-search concepts and centralized types.
- `src/shared/` contains generic utilities such as DOM escaping, downloads, and formatting.
- `src/styles/tailwind.css` is the Tailwind input; `src/styles/styles.css` is the generated stylesheet.

Use feature-first hybrid architecture. Runtime-layer folders alone would tangle future LinkedIn, Gmail, and form-filling code; full Clean Architecture is too heavy for this extension today. For new product areas, add sibling features:

- `src/features/job-post-extraction/` for lead discovery and extraction.
- `src/features/form-filling/` for application form assistance.
- `src/features/email-outreach/` for Gmail drafts and follow-ups.
- Move reused job-search concepts into `src/domain/job-search/` only after more than one feature needs them.
- Add `src/platform/chrome/` only if Chrome adapters become shared across features.

Keep business logic inside feature folders. Put only stable generic utilities in `src/shared/`; do not place feature-specific storage, constants, or settings there.

## Build, Test, and Development Commands

- `npm install` installs locked dependencies from `package-lock.json`.
- `npm run build:css` compiles and minifies Tailwind into `src/styles/styles.css`.

There is no local dev server or test script. To run manually, load this directory as an unpacked Chrome extension and test on `https://www.linkedin.com/search/results/content/*`.

## Coding Style & Naming Conventions

Use JavaScript ES modules, two-space indentation, semicolons, and descriptive camelCase names. Keep filenames lowercase and hyphenated, for example `post-filter.js`.

Write simple, readable code prioritizing clarity over cleverness. Use self-explanatory names and single-responsibility functions. Do not over-engineer or build for future requirements. Keep business logic lean, extract utilities only for reused operations, and centralize job-search types in `src/domain/job-search/types.js`; never scatter type definitions. Use language-native conventions, avoid circular dependencies, handle errors idiomatically, and log meaningful context. If code needs a comment explaining what it does, rewrite it.

Feature modules should expose small public functions and hide DOM, Chrome API, or storage details behind local adapters. Future features must not import LinkedIn extraction internals.

## Testing Guidelines

No automated test framework is configured. For changes, reload the unpacked extension, open the popup on a supported LinkedIn page, start and stop a scan, verify results, and test JSON/CSV export. If adding tests later, colocate feature tests with the feature or use `tests/`.

## Commit & Pull Request Guidelines

This repository has no existing commits, so no historical convention is available. Use concise, imperative commits such as `Add scan export controls`. PRs should describe the user-facing change, list manual test steps, link issues, and include screenshots for UI changes.

## Security & Configuration Tips

Keep extension permissions in `manifest.json` narrow. Gmail, form-filling, or other integrations must request only the minimum host permissions needed. Route Chrome storage access through the owning feature's storage module instead of calling Chrome storage directly from multiple modules.
