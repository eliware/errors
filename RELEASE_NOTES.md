# Release Notes

## 13.0.0 — 2026-10-17

### Changed

- Updated the package version to 13.0.0.
- Updated the repository configuration for Convention 13.0.
- Updated logger messages to name process errors and promise errors.

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

- Direct imports from the previous root entry point do not work. Use `@eliware/errors`.

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
