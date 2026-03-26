# Poddata

English documentation. Portuguese version: [README.pt-BR.md](./README.pt-BR.md)

Podcast analytics dashboard built with React 19.2.0, Vite, and D3.

## Stack

- React 19.2.0
- React DOM 19.2.0
- Vite 8
- D3 7

## Requirements

- Node.js 20+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite in your terminal.

## Scripts

- `npm run dev`: start the local Vite dev server
- `npm run build`: create a production build
- `npm run watch`: rebuild in watch mode
- `npm run preview`: preview the production build locally

## Application languages

- English remains the default application language.
- The UI now includes a switcher for `pt-BR`.
- The selected language is persisted in `localStorage`.

## How the app works

### Frontend

- `src/main.jsx` mounts the React application.
- `src/App.jsx` renders the dashboard layout, metric cards, recommendation cards, chart sections, and the language switcher.
- `src/charts.jsx` draws the SVG charts with D3 and receives localized labels from the app layer.
- `src/i18n.js` stores the UI copy for English and Brazilian Portuguese.

### Data

- `data/data.csv` is the bundled local dataset used by the interface.
- `src/podcastData.js` parses the CSV, computes derived metrics, and prepares the dashboard insight payload.
- The app attempts to fetch fresher data from `/api/podcast-data` and caches successful remote responses in `localStorage` for 30 minutes.

### CSV sync

- `vite.config.js` registers a local middleware route at `/api/podcast-data`.
- `scripts/podcastCsvSync.js` checks the age of `data/data.csv`.
- If the local file is fresh, the middleware serves the local CSV.
- If the local file is stale, it attempts to download the remote CSV and update `data/data.csv`.
- If the remote request fails, the app keeps working with the local file.

## Git Flow

Recommended flow for new work:

1. Start from `develop`.
2. Create a feature branch for the task.
3. Implement and validate with `npm run build`.
4. Merge the feature branch back into `develop`.

Example:

```bash
git checkout develop
git checkout -b feature/i18n-pt-br
```

## References

- [React documentation](https://react.dev/)
- [Vite documentation](https://vite.dev/)
