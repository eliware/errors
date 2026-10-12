# Release Notes

## 12.0.0 — 2026-10-12

### Added

- Added user guides, troubleshooting steps, examples, and standard error indexes.
- Added continuous integration and publish workflows.
- Added focused source modules and matching tests for handler setup, cleanup, and lifecycle.

### Changed

- Updated package metadata, dependencies, and repository conventions.
- Moved the package entry point and TypeScript declarations into `src/`.
- Kept one active registration for each process object. Later calls do not change its options.
- Made setup reject listeners when the process object returns `false`.
- Preserved cleanup state after a failure and allowed cleanup to retry.
- Kept the test harness and full coverage checks.

### Breaking changes

- Direct imports from the old root entry point no longer work. Import from `@eliware/errors`.

### Migration

- Update direct imports to use `@eliware/errors`.
- Pass an `AbortSignal` on the first registration call when abort cleanup is required.

## 2.1.0 — 2026-09-02

### Changed

Split handler registration into focused modules and improved cleanup recovery.

### Added

Added focused tests for cleanup, validation, logging, and registration.

## 2.0.0 — 2026-08-25

### Changed

Updated the test harness and runtime logger dependency.

### Added

Added cross-platform validation and package checks.

### Breaking changes

Replaced direct Jest and Oxlint scripts with the shared test harness.

### Migration

Run `npm test` and `npm run lint` for repository validation.

## 1.1.9 — 2026-08-10

### Fixed

Improved process-like object validation and cleanup compatibility.

## 1.1.7 — 2026-08-07

### Fixed

Published a follow-up release after the 1.1.6 npm publication completed before CI retry.

## 1.1.6 — 2026-08-07

### Fixed

Updated dependency and coverage validation behavior.

## 1.1.5 — 2026-08-06

### Added

Added repository development instructions and security notes.

## 1.1.4 — 2026-08-06

### Added

Added the ESM process error-handler API, cleanup, selected events, and logger support.

## 1.1.3 — 2026-07-01

### Changed

Updated package metadata and dependencies.

## 1.1.2 — 2025-12-21

### Changed

Updated CommonJS and ESM implementations and package metadata.

## 1.1.1 — 2025-12-08

### Changed

Updated package metadata and dependencies.
