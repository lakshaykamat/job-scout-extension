# WXT TypeScript Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Migrate the existing MV3 Chrome extension to WXT, TypeScript, Vitest, and Playwright while preserving the current vanilla UI and LinkedIn scanning behavior.

**Architecture:** WXT owns the manifest and extension entrypoints. Thin WXT files under `entrypoints/` import feature-first TypeScript modules from `src/features/job-post-extraction/`. The current scanner logic remains in the feature folder and is made type-safe without changing scan behavior.

**Tech Stack:** WXT, TypeScript, Tailwind CSS, Vitest, Playwright, Chrome extension MV3 APIs.

---

## File Structure

- Create `wxt.config.ts` for manifest metadata, permissions, and WXT configuration.
- Create `tsconfig.json` for TypeScript checking.
- Create `vitest.config.ts` and `tests/setup.ts` for unit tests.
- Create `playwright.config.ts` and `e2e/extension-smoke.spec.ts` for extension smoke tests.
- Create WXT entrypoints under `entrypoints/background.ts`, `entrypoints/linkedin-content.content.ts`, `entrypoints/popup/`, `entrypoints/options/`, and `entrypoints/results/`.
- Convert existing `.js` files under `src/` to `.ts`.
- Update page HTML files to reference local TypeScript entry modules.
- Update `README.md`, `tailwind.config.js`, and `package.json`.

### Task 1: Install Tooling And Config

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `wxt.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tests/setup.ts`

- [x] Install WXT, TypeScript, Chrome types, Vitest, jsdom, Playwright, and Tailwind support.
- [x] Add scripts: `dev`, `build`, `build:css`, `typecheck`, `test`, and `test:e2e`.
- [x] Configure WXT manifest fields to match the existing extension name, description, version, permissions, and LinkedIn host permission.
- [x] Configure TypeScript for strict extension code with DOM and Chrome APIs.
- [x] Configure Vitest for jsdom unit tests.
- [x] Configure Playwright to test the built WXT Chrome output.

### Task 2: Add WXT Entrypoints

**Files:**
- Create: `entrypoints/background.ts`
- Create: `entrypoints/linkedin-content.content.ts`
- Create: `entrypoints/popup/index.html`
- Create: `entrypoints/popup/main.ts`
- Create: `entrypoints/options/index.html`
- Create: `entrypoints/options/main.ts`
- Create: `entrypoints/results/index.html`
- Create: `entrypoints/results/main.ts`

- [x] Create a background entrypoint that imports the feature background initializer.
- [x] Create a manifest-registered content script entrypoint matching `https://www.linkedin.com/search/results/content/*`.
- [x] Move page HTML into WXT page entrypoint folders.
- [x] Make popup/options/results main files import the existing page feature modules.
- [x] Update internal page navigation to use WXT output paths.

### Task 3: Convert Runtime Code To TypeScript

**Files:**
- Modify/rename: `src/domain/job-search/types.js` to `src/domain/job-search/types.ts`
- Modify/rename: `src/shared/*.js` to `src/shared/*.ts`
- Modify/rename: `src/features/job-post-extraction/**/*.js` to `src/features/job-post-extraction/**/*.ts`

- [x] Rename runtime files from `.js` to `.ts`.
- [x] Update import extensions from `.js` to `.ts`-compatible extensionless imports.
- [x] Add explicit domain types for scan profiles, extracted posts, scans, settings, and scan data.
- [x] Add typed Chrome message payloads where messages cross runtime boundaries.
- [x] Keep scanner behavior unchanged.

### Task 4: Add Unit Tests

**Files:**
- Create: `src/features/job-post-extraction/background/post-filter.test.ts`
- Create: `src/features/job-post-extraction/content/text.test.ts`
- Create: `src/features/job-post-extraction/pages/results/filters.test.ts`

- [x] Test matching posts against profile keywords and exclusions.
- [x] Test text normalization helpers.
- [x] Test results page filtering by query and date range.
- [x] Run Vitest and fix failures.

### Task 5: Add Extension Smoke Test

**Files:**
- Create: `e2e/extension-smoke.spec.ts`

- [x] Build the extension before Playwright runs.
- [x] Launch Chromium with the built extension loaded.
- [x] Verify `manifest.json` exists in WXT output and preserves expected permissions.
- [x] Verify popup, options, and results pages can open without page errors.

### Task 6: Documentation And Verification

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md` only if command guidance needs to stay aligned.

- [x] Update development commands and unpacked extension path.
- [x] Run `npm run build`.
- [x] Run `npm run typecheck`.
- [x] Run `npm run test`.
- [x] Run `npm run test:e2e`.
- [x] Report any remaining manual LinkedIn verification steps.

