# Poddata

Podcast analytics dashboard built with React, Vite, and D3.

English documentation. Portuguese version: [README.pt-BR.md](./README.pt-BR.md)

## Overview

Poddata is a single-page analytics dashboard that reads podcast episode data from `data/data.csv`, computes derived performance metrics, and turns them into recommendations plus six visual reports focused on:

- Growth
- Retention
- Audience mix
- Topic performance
- Share-to-subscriber conversion
- Best converting episodes

The app is designed to stay usable even when remote data sync fails:

- It ships with a bundled local CSV
- It attempts a remote refresh through `/api/podcast-data`
- It caches successful remote responses in `localStorage` for 30 minutes
- It falls back gracefully to local data when needed

## Stack

- React 19.2.0
- React DOM 19.2.0
- D3 7.9.0
- Vite 8
- Playwright
- Istanbul via `vite-plugin-istanbul`

## Project Structure

- `src/main.jsx`
  Application entry point and test utility exposure.
- `src/App.jsx`
  Main dashboard layout, locale switching, cards, recommendations, and chart composition.
- `src/charts.jsx`
  D3 chart rendering and chart interaction controls.
- `src/podcastData.js`
  CSV parsing, derived metrics, recommendation inputs, remote fetch logic, and cache behavior.
- `src/i18n.js`
  English and Brazilian Portuguese copy plus locale-aware formatters.
- `src/styles.css`
  Dashboard styling.
- `data/data.csv`
  Bundled local dataset.
- `tests/app.spec.js`
  End-to-end test suite covering UI, data fallbacks, locale persistence, and chart interactions.
- `scripts/podcastCsvSync.js`
  Local middleware helper for serving or refreshing CSV data.
- `scripts/mergeCoverage.js`
  Coverage merge and threshold enforcement script.
- `scripts/generateAppSummaryPdf.py`
  Python script that generates a one-page app summary PDF.
- `.devcontainer/`
  Reproducible containerized development environment for VS Code / Dev Containers.

## Requirements

### Local development

- Node.js 20+
- npm

### Optional PDF generation

If you want to run `scripts/generateAppSummaryPdf.py`, install Python dependencies separately:

- `pypdf`
- `reportlab`

## Running The App

### Standard local setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

### Production build preview

```bash
npm run build
npm run preview
```

## Available Scripts

- `npm run dev`
  Starts the local Vite development server.
- `npm run build`
  Creates a production build in `dist/`.
- `npm run watch`
  Rebuilds the production bundle in watch mode.
- `npm run preview`
  Serves the built app locally.
- `npm run test:e2e`
  Runs the Playwright test suite.
- `npm run coverage:e2e`
  Runs Playwright with coverage collection, merges `.nyc_output/*.json`, writes `coverage/summary.json`, and enforces an 80% minimum threshold for statements, branches, functions, and lines.

## How It Works

### Application flow

1. `src/main.jsx` mounts the app into `index.html`.
2. `src/App.jsx` starts with bundled fallback data from `data/data.csv`.
3. The app attempts to load fresher CSV data from `/api/podcast-data`.
4. If fresh remote data exists, it is cached in `localStorage` for 30 minutes.
5. If the remote request fails, the app keeps working with local bundled data.

### Data flow

`src/podcastData.js` is the core data pipeline. It:

- Parses the raw CSV
- Converts durations to minutes
- Infers topic categories from title/description rules
- Computes summary and recommendation metrics
- Builds datasets used by the six D3 chart components

### Middleware flow

`vite.config.js` adds a local middleware route at `/api/podcast-data`.

That route delegates to `scripts/podcastCsvSync.js`, which:

1. Checks the age of `data/data.csv`
2. Serves the local file immediately if it is fresh
3. Fetches a remote CSV if the local file is stale
4. Updates `data/data.csv` when the remote request succeeds
5. Falls back to the current local CSV if the remote request fails

## Charts In The Dashboard

The dashboard currently renders six charts:

1. Growth trend
2. Length vs retention
3. Audience mix
4. Topic leaderboard
5. Shares to subscribers
6. Best conversion episodes

These charts are built in D3 and support:

- Zoom in
- Zoom out
- Reset view
- Mouse-wheel zoom
- Drag-to-pan

## Localization

Supported locales:

- `en`
- `pt-BR`

Behavior:

- English is the default locale
- Users can switch languages in the UI
- Selected locale is saved to `localStorage`
- The document `lang` attribute updates with the selected locale

## Testing

Playwright tests cover:

- Initial dashboard rendering
- Locale switching and locale persistence
- Remote cache usage
- Local fallback behavior when remote loading fails
- Loading labels
- Helper branch coverage
- Chart zoom, pan, and reset interactions

Run:

```bash
npm run test:e2e
```

## Coverage

Coverage uses `vite-plugin-istanbul` plus a custom merge script:

1. The app is instrumented during the Playwright run
2. Each test writes raw coverage JSON to `.nyc_output/`
3. `scripts/mergeCoverage.js` merges artifacts and writes `coverage/summary.json`
4. The script fails if any core metric drops below 80%

Run:

```bash
npm run coverage:e2e
```

## Dev Container

This repository includes a Dev Container so contributors can open the project in a consistent environment.

What it provides:

- Node.js 20
- npm
- Git
- Python 3 and `pip`
- Recommended VS Code extensions for React, ESLint, Prettier, and Playwright

Typical usage:

1. Open the repository in VS Code.
2. Use `Dev Containers: Reopen in Container`.
3. Wait for the post-create setup to finish.
4. Start the app with `npm run dev`.

## Git Flow

All new feature work should follow Git Flow using `develop` as the integration branch.

### Branching

- Start from `develop`
- Create a feature branch named `feature/<short-description>`
- Merge feature branches back into `develop`
- Do not start new feature work directly on `main`

Example:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-dev-container
```

### Validation before merge

For normal feature work, run at minimum:

```bash
npm run build
npm run test:e2e
```

If the feature changes branching logic or behavior that affects instrumentation and reporting, also run:

```bash
npm run coverage:e2e
```

## Documentation And Supporting Outputs

- [AGENTS.md](./AGENTS.md)
  Maintainer-focused project guide with architecture, execution flow, tooling, and Git Flow policy.
- [README.pt-BR.md](./README.pt-BR.md)
  Portuguese documentation.

## References

- [React documentation](https://react.dev/)
- [Vite documentation](https://vite.dev/)
- [D3 documentation](https://d3js.org/)
- [Playwright documentation](https://playwright.dev/)
