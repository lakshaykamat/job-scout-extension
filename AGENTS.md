# Repository Guidelines

## Project Structure & Module Organization

This is a Manifest V3 Chrome extension for a job-finding assistant. The current feature scans LinkedIn content search results and extracts job opportunities; future areas may include form filling, Gmail outreach drafting, follow-ups, and other job-search automation. Entry points are declared under `entrypoints/` and the generated manifest is configured by `wxt.config.ts`.

Current runtime code lives under `src/`:

- `src/features/job-post-extraction/background/` contains scan orchestration.
- `src/features/job-post-extraction/content/` contains LinkedIn scanning and extraction.
- `src/features/job-post-extraction/pages/` contains popup, options, and results pages for this feature.
- `src/features/job-post-extraction/config/` and `storage/` contain extraction-specific settings, runtime constants, and scan persistence.
- `src/domain/job-search/` contains shared job-search concepts and centralized types.
- `src/shared/` contains generic utilities such as DOM escaping, downloads, and formatting.
- `src/styles/tailwind.css` is the Tailwind input; `src/styles/styles.css` is the generated stylesheet.

Use feature-first hybrid architecture. Runtime-layer folders alone would tangle future LinkedIn, Gmail, and form-filling code; full Clean Architecture is too heavy for this extension today. For new product areas, add sibling features:

- `src/features/job-post-extraction/` for opportunity discovery and extraction.
- `src/features/form-filling/` for application form assistance.
- `src/features/email-outreach/` for Gmail drafts and follow-ups.
- Move reused job-search concepts into `src/domain/job-search/` only after more than one feature needs them.
- Add `src/platform/chrome/` only if Chrome adapters become shared across features.

Keep business logic inside feature folders. Put only stable generic utilities in `src/shared/`; do not place feature-specific storage, constants, or settings there.

## Build, Test, and Development Commands

- `pnpm install` installs locked dependencies from `pnpm-lock.yaml`.
- `pnpm run dev` starts WXT development mode.
- `pnpm run build` compiles Tailwind and builds Chrome, Firefox, and Edge MV3 extensions into `.output/*-mv3`.
- `pnpm run build:css` compiles and minifies Tailwind into `src/styles/styles.css`.
- `pnpm run typecheck` runs TypeScript checking.
- `pnpm run test` runs Vitest unit tests.
- `pnpm run test:e2e` builds the extension and runs Playwright smoke tests.
- `pnpm run zip:all` creates release zips for Chrome, Firefox, and Edge.

To run manually, build the extension, load `.output/chrome-mv3` as an unpacked Chrome extension, and test on `https://www.linkedin.com/search/results/content/*`.

## Coding Style & Naming Conventions

Use TypeScript ES modules, two-space indentation, semicolons, and descriptive camelCase names. Keep filenames lowercase and hyphenated, for example `post-filter.ts`.

Write simple, readable code prioritizing clarity over cleverness. Use self-explanatory names and single-responsibility functions. Do not over-engineer or build for future requirements. Keep business logic lean, extract utilities only for reused operations, and centralize job-search types in `src/domain/job-search/types.ts`; never scatter type definitions. Use language-native conventions, avoid circular dependencies, handle errors idiomatically, and log meaningful context. If code needs a comment explaining what it does, rewrite it.

Feature modules should expose small public functions and hide DOM, Chrome API, or storage details behind local adapters. Future features must not import LinkedIn extraction internals.

## Testing Guidelines

Use Vitest for unit tests and Playwright for extension smoke tests. For behavior changes, also reload the unpacked extension, open the popup on a supported LinkedIn page, start and stop a scan, verify results, and test JSON/CSV export. Colocate feature unit tests with the feature.

## Commit & Pull Request Guidelines

Use concise, imperative commits such as `Add scan export controls`. PRs should describe the user-facing change, list manual test steps, link issues, and include screenshots for UI changes.

## Security & Configuration Tips

Keep extension permissions in `wxt.config.ts` narrow. Gmail, form-filling, or other integrations must request only the minimum host permissions needed. Route Chrome storage access through the owning feature's storage module instead of calling Chrome storage directly from multiple modules.
