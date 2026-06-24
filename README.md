# Job Finding Assistant

Find better job opportunities with less manual searching.

Job Finding Assistant is a Chrome extension for job seekers who want to discover, save, and act on hiring signals faster. Today it scans LinkedIn content search results, extracts hiring-related posts, filters them by your search profile, and lets you export matching leads.

The product is designed to grow beyond post extraction into a practical job-search workspace: lead discovery, application form assistance, Gmail outreach drafts, follow-up support, and reusable candidate/job-search data.

## What It Does Today

- Scans LinkedIn content search results for hiring posts.
- Filters posts using configurable job-search profiles.
- Saves matching leads for review.
- Exports saved leads as JSON or CSV.

## Product Direction

This is not just a scraper. The goal is a browser-based assistant that helps move from finding opportunities to applying and following up. Future workflows should fit beside the current extraction feature without mixing LinkedIn, Gmail, and form-filling logic together.

## Development

```bash
npm install
npm run build:css
```

Load the repository as an unpacked extension from `chrome://extensions`, then test on a LinkedIn content search URL:

```text
https://www.linkedin.com/search/results/content/*
```

The code follows a feature-first hybrid architecture:

```text
src/features/job-post-extraction/   Current LinkedIn lead extraction workflow
src/domain/job-search/              Shared job-search concepts and types
src/shared/                         Generic utilities only
src/styles/                         Tailwind source and generated CSS
```

Add future workflows as new features, for example `src/features/form-filling/` or `src/features/email-outreach/`.
