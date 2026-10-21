# Release Notes

## 15.0.0 — 2026-10-21

### Changed

- Updated package metadata and the Eliware logger and test dependencies to version 15.0.0.
- Updated repository specifications to Convention 15.0.
- Updated the dependency lock file to current compatible releases.
- Split handler setup, rollback, listener cleanup, registration state, registry, validation, and logging diagnostics into focused modules.
- Moved tests to match their modules and added focused coverage for the new boundaries.
- Merged overlapping tests for fallback one-shot listeners.
- Preserved the public API and runtime behavior.

## 14.0.0 — 2026-10-21

### Added

- Added optional listener inspection to verify handler removal from process-like objects.

### Changed

- Updated package metadata and the Eliware logger and test dependencies to version 14.0.0.
- Aligned repository requirements with Convention 14.0.
- Expanded API, usage, and troubleshooting guidance for exported types, listener removal, rollback, and cleanup retries.
- Updated the custom process example to preserve unrelated listeners and support removal checks.
- Simplified README packaging guidance and split cleanup, one-shot lifecycle, and validation modules.

### Fixed

- Keep one-shot registrations available when handler cleanup fails so callers can retry cleanup.
- Mark rejected removals and listeners that remain attached as cleanup failures.
- Keep a recovery registration when setup rollback cannot remove an attached handler.

## 13.0.0 — 2026-10-19

### Added

- Added an API reference for options, events, logger output, registration, cleanup, and errors.
- Expanded usage and troubleshooting guides for setup, event selection, logger use, and recovery.
- Added tests for cleanup retries and listeners that attach before setup fails.

### Changed

- Updated the package and Eliware dependencies to version 13.0.0.
- Changed logger messages to `Uncaught process error` and `Unhandled promise error`.
- Updated GitHub workflows to use checkout v7 and full history for validation.
- Renamed the npm publication workflow to `npm.yaml` and updated its release checks.
- Updated Knit deployment to pull the configured branch before package installation and tests.
- Aligned repository specifications with Convention 13.0 and moved focused modules into subdirectories.
- Updated documentation indexes and shortened the root README and contributor guidance.
- Exported the typed `defaultEvents` array and documented the supported event names.
- Updated `specs/directives.yaml` to Convention 13.0.

### Fixed

- Validate each call before the package reuses an active registration.
- Retry handler removal when a process method throws a falsy value, such as `undefined`.
- Remove a listener if an event method adds it and then throws.
- Keep a recovery registration if cleanup cannot remove every attempted listener.

### Migration

- Update logger checks from `Uncaught Exception` and `Unhandled Rejection` to the new messages.

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
