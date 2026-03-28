# Changelog

All notable changes to this project are documented in this file.

The format is inspired by Keep a Changelog and reflects the Git history of this repository from the first commit onward.

## [1.0.2] - 2026-03-27

### Fixed

- Stabilized the Dev Container startup flow by simplifying the container configuration.
- Added an explicit workspace folder and a dedicated Docker volume for `node_modules` inside the Dev Container.
- Fixed Playwright `webServer` startup on Windows by moving `VITE_COVERAGE` to the process environment instead of shell-specific inline syntax.
- Hotfix: charts now apply dynamic tick recalculation for zoom and keep axis visuals stable (TradeView-like behavior).

### Changed

- Bumped the project version to `1.0.2`.
- Completed the Git Flow release cycle for `1.0.2` across `develop`, `main`, and tag `v1.0.2`.

## [1.0.1] - 2026-03-27

### Added

- Initial documentation set for the project release flow and local development.
- Initial Dev Container setup for VS Code / Dev Containers.

### Changed

- Stabilized the project for its first tagged release branch flow.
- Bumped the project version to `1.0.1`.

## [1.0.0] - 2026-03-25 to 2026-03-27

### Added

- Initial React + Vite + D3 podcast analytics dashboard foundation.
- CSV-backed data loading using bundled local podcast data.
- Remote CSV synchronization with graceful fallback to local data.
- English and Brazilian Portuguese language support.
- D3 chart interaction controls including zoom, pan, and reset behavior.
- Playwright end-to-end coverage for dashboard behavior and i18n flows.
- App documentation and contributor guidance.

### Changed

- Prepared the codebase for its first release with test stabilization and environment setup work.

## Initial History

### 2026-03-25

- `Initial commit`

### 2026-03-26

- Added remote CSV sync and app docs.
- Added Brazilian Portuguese language switcher.
- Added Playwright coverage checks for i18n dashboard.
- Added zoom and pan controls for dashboard charts.

### 2026-03-27

- Prepared the first release with docs, Dev Container, and test stabilization.
- Released `v1.0.1`.
- Fixed Dev Container startup and Playwright Windows configuration.
- Released `v1.0.2`.
