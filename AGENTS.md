# AGENTS.md

## Project Overview

Poddata is a single-page podcast analytics dashboard built with React, Vite, and D3. It reads podcast episode metrics from `data/data.csv`, derives higher-level performance signals, and renders a dashboard focused on growth, retention, loyalty, sharing, and subscriber conversion.

The app is intentionally lightweight:

- No backend application server is checked into the repo.
- No database layer is present.
- No authentication layer is present.
- The only server-like behavior comes from Vite middleware that exposes `/api/podcast-data` during local development and preview.

This repository currently includes:

- A React frontend in `src/`
- A local CSV dataset in `data/`
- Vite middleware for CSV sync
- Playwright end-to-end tests in `tests/`
- Coverage instrumentation and merge logic
- A Python script that generates a one-page PDF summary of the app

## Installed Tools And Dependencies

### Runtime dependencies

Defined in `package.json`:

- `react` `^19.2.0`
- `react-dom` `^19.2.0`
- `d3` `^7.9.0`

### Dev dependencies

Defined in `package.json`:

- `vite` `^8.0.2`
- `@vitejs/plugin-react` `^6.0.1`
- `@playwright/test` `^1.58.2`
- `vite-plugin-istanbul` `^8.0.0`

### Tooling and scripts present in the repo

- `playwright.config.js`
  Runs browser-based end-to-end tests against a locally built preview server.
- `vite.config.js`
  Configures React, Istanbul instrumentation, and the local CSV sync middleware.
- `scripts/podcastCsvSync.js`
  Refreshes `data/data.csv` from a remote CSV when the local file is stale.
- `scripts/mergeCoverage.js`
  Merges raw coverage artifacts from `.nyc_output/`, writes `coverage/summary.json`, and enforces an 80% threshold across statements, branches, functions, and lines.
- `scripts/generateAppSummaryPdf.py`
  Generates `output/pdf/app-summary-one-page.pdf` using Python PDF libraries.

### Python libraries referenced by the repo

These are imported by `scripts/generateAppSummaryPdf.py` and are therefore required if that script is used:

- `pypdf`
- `reportlab`

They are not managed by `package.json`, so treat them as external Python prerequisites for the PDF workflow.

## Repository Structure

- `src/main.jsx`
  React entry point. Mounts the app and exposes test utilities on `window.__poddataTestUtils__`.
- `src/App.jsx`
  Top-level application component. Owns data loading, language state, dashboard layout, summary cards, recommendation cards, and chart sections.
- `src/charts.jsx`
  D3 chart rendering layer. Includes reusable chart frame helpers and interactive zoom/pan/reset controls.
- `src/podcastData.js`
  CSV parsing, topic inference, derived metric calculation, cache handling, remote fetch logic, and dashboard data assembly.
- `src/i18n.js`
  Locale copy, supported locales, storage keys, and number/percent formatters.
- `src/styles.css`
  Application styling.
- `data/data.csv`
  Bundled local dataset.
- `tests/app.spec.js`
  Playwright end-to-end coverage for language switching, remote/local data flows, cache behavior, helper branches, and chart interaction.
- `scripts/`
  Operational scripts for CSV sync, coverage merging, and PDF output.

## Execution Flow

### 1. App boot

1. `index.html` provides the mount point.
2. `src/main.jsx` creates the React root and renders `<App />` inside `React.StrictMode`.
3. The same entry file also exposes helper utilities for Playwright-driven branch coverage.

### 2. Initial UI state

When `App` starts:

- It loads `fallbackDashboardData`, which is built from the bundled `data/data.csv`.
- It reads the preferred locale from `localStorage` using `poddata:locale`.
- It sets loading state to `true`.

### 3. Data loading flow

`src/podcastData.js` drives the runtime data strategy:

1. Check `localStorage` for `poddata:remote-csv-cache`.
2. If cached remote CSV exists and is younger than 30 minutes, build the dashboard from the cached CSV and mark the source as `remote-cache`.
3. Otherwise fetch `/api/podcast-data`.
4. If the fetch succeeds, cache the CSV in `localStorage`, build dashboard data from that response, and use the `X-Poddata-Source` response header as the source label when available.
5. If the fetch fails or returns invalid content, fall back to the bundled raw CSV imported from `data/data.csv`.

### 4. Vite middleware flow for `/api/podcast-data`

`vite.config.js` registers a custom plugin that attaches the same handler to both:

- `configureServer()` for `npm run dev`
- `configurePreviewServer()` for `npm run preview`

That handler calls `syncPodcastCsv()` from `scripts/podcastCsvSync.js`.

`syncPodcastCsv()` works like this:

1. Read the current local CSV file from `data/data.csv`.
2. Check its modified time.
3. If the file is newer than 30 minutes, return it immediately with source `local-file-fresh`.
4. If the file is stale, request the remote CSV from `https://pixelprowess.com/mockdata/podcastData.csv`.
5. If the remote request succeeds, overwrite `data/data.csv` with the new contents and return source `remote-url`.
6. If the remote request fails, return the existing local CSV with source `local-file-fallback`.

This means the app always has a local CSV fallback and can still run when the remote source is unavailable.

### 5. Data transformation flow

`src/podcastData.js` converts raw CSV rows into dashboard-ready structures:

- Parses numeric metrics such as downloads, completions, listeners, subscribers, and shares
- Converts `HH:MM:SS` duration strings into minutes
- Buckets episodes into duration bands
- Infers topics from title and description keyword rules
- Classifies guest format as single guest vs panel/multi-guest
- Computes derived fields such as:
  - completion rate
  - audience totals
  - new and returning listener share
  - subscriber conversion
  - share rate
  - efficiency score
- Aggregates summary metrics
- Aggregates topic, duration, and guest-format performance
- Builds recommendation insights used by the editorial recommendation cards

### 6. Rendering flow

`src/App.jsx` assembles the final view:

- Toolbar with language selector
- Hero section with summary highlights and source status label
- Recommendation cards
- Metric cards
- Six D3 chart cards

The six chart areas are:

1. Growth trend
2. Length vs retention
3. Audience mix
4. Topic leaderboard
5. Shares to subscribers
6. Best conversion episodes

Each chart is rendered in `src/charts.jsx` with D3 and wrapped in interactive controls for:

- Zoom in
- Zoom out
- Reset view
- Mouse-wheel zoom
- Drag-to-pan

### 7. Localization flow

`src/i18n.js` defines two supported locales:

- `en`
- `pt-BR`

Language behavior:

- Default locale is English
- Preferred locale is persisted in `localStorage`
- `document.documentElement.lang` is updated when the locale changes
- Labels, chart copy, taxonomy labels, and formatted numbers all come from locale-aware helpers

## Commands

### Core development commands

- `npm run dev`
  Starts the Vite development server.
- `npm run build`
  Creates a production build in `dist/`.
- `npm run watch`
  Rebuilds continuously with Vite build watch mode.
- `npm run preview`
  Serves the production build locally.

### Test and coverage commands

- `npm run test:e2e`
  Runs Playwright tests from `tests/`.
- `npm run coverage:e2e`
  Runs Playwright tests, writes raw coverage JSON files to `.nyc_output/`, merges them, writes `coverage/summary.json`, and fails if coverage drops below 80%.

## Testing And Coverage Flow

Playwright is configured in `playwright.config.js` to:

- Build the app with `VITE_COVERAGE=true`
- Launch a local preview server at `http://127.0.0.1:4173`
- Run tests from `tests/`

Coverage flow:

1. `vite-plugin-istanbul` instruments `src/**/*.js` and `src/**/*.jsx`.
2. Tests read `window.__coverage__`.
3. `tests/app.spec.js` persists per-test coverage JSON files into `.nyc_output/`.
4. `scripts/mergeCoverage.js` merges those artifacts.
5. The script writes `coverage/summary.json`.
6. The script enforces a minimum threshold of 80% for statements, branches, functions, and lines.

## PDF Summary Flow

The repo also includes a documentation artifact generator:

- Script: `scripts/generateAppSummaryPdf.py`
- Output: `output/pdf/app-summary-one-page.pdf`

What it does:

- Generates a one-page PDF summary of the project
- Uses `reportlab` for drawing
- Uses `pypdf` to verify the output has exactly one page
- Creates output directories as needed

This workflow is separate from the main frontend application and is not wired into any npm script right now.

## Expectations For New Work

### General development expectations

For any code change:

- Preserve the current React + Vite + D3 architecture unless the task explicitly calls for structural changes.
- Keep the CSV-first data model intact unless a migration is intentionally planned.
- Maintain graceful fallback behavior when remote CSV sync fails.
- Preserve localization behavior in both English and Brazilian Portuguese when editing visible UI copy.
- Update Playwright coverage when behavior changes in a way that affects user-visible flows or branch logic.

### Git Flow policy for all new features

All new features should follow Git Flow using `develop` as the integration branch.

#### Branching rules

- Never start a new feature directly on `main`.
- Always branch from the latest `develop`.
- Use a feature branch named like:
  - `feature/short-description`
  - Example: `feature/add-topic-filters`

#### Required feature flow

1. Update local branches.
2. Check out `develop`.
3. Pull the latest `develop`.
4. Create a new `feature/...` branch.
5. Implement the feature.
6. Run validation before merge.
7. Merge the feature branch back into `develop`.
8. Delete the feature branch after merge if your team workflow allows it.

Example:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-topic-filters
```

Before merging a feature branch back into `develop`, run at minimum:

```bash
npm run build
npm run test:e2e
```

When coverage-sensitive logic changes, also run:

```bash
npm run coverage:e2e
```

#### Merge expectations

- Merge features into `develop`, not directly into `main`.
- Keep feature branches focused on one unit of work.
- If a feature changes runtime behavior, update docs and tests in the same branch.
- If a feature changes data flow, review `src/podcastData.js`, `vite.config.js`, and `scripts/podcastCsvSync.js` together because they form one execution chain.

## Files That Matter Most For Agents

If you are an agent or contributor trying to understand the codebase quickly, start here in order:

1. `package.json`
2. `vite.config.js`
3. `src/App.jsx`
4. `src/podcastData.js`
5. `src/charts.jsx`
6. `tests/app.spec.js`
7. `scripts/podcastCsvSync.js`
8. `scripts/mergeCoverage.js`

## References

- [README.md](./README.md)
- [README.pt-BR.md](./README.pt-BR.md)
