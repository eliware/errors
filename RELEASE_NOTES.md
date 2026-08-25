# Release Notes

## 2.0.0 — 2026-08-25

- Modernized validation around the shared `@eliware/test` harness.
- Updated the runtime dependency to `@eliware/log` 2.0.0.
- Added cross-platform CI validation for Node.js 26 on Ubuntu and Windows,
  including production dependency auditing and package checks.
- Added explicit public publish configuration and included release notes in the
  package contents.
- Breaking: direct Jest/Oxlint scripts and the standalone coverage-gap command
  were replaced by the shared test and lint harness.

## 1.1.9 — 2026-08-10

- Improved process-like object validation and cleanup compatibility.
- Reject unsupported event selections and roll back registrations when logging fails.
- Added coverage for cleanup, validation, and rollback behavior.

## 1.1.7 — August 7, 2026

- Published a follow-up release after the 1.1.6 npm publication completed before CI retry.

## 1.1.6 — 2026-08-07

- Updated the runtime dependency `@eliware/log` to 1.1.10.
- Fixed coverage-gap filtering in the release validation workflow.

## 1.1.5 — 2026-08-06

- Added `AGENTS.md` with development conventions, validation commands, API compatibility guidance, security notes, and release workflow rules.

## 1.1.4 — 2026-08-06

- Modernized the package as an ESM-first process error-handler library.
- Added idempotent registration per process-like object and repeat-safe cleanup via `removeHandlers()`.
- Added selectable process events, one-shot listeners, and `AbortSignal`-based cleanup.
- Preserved existing process listeners while supporting custom process-like objects and loggers.
- Improved structured logging for uncaught exceptions, unhandled rejections, and warnings.
- Updated TypeScript declarations, README documentation, and usage example.
- Removed obsolete CommonJS entrypoints and tests.
- Standardized Node.js 26 CI, linting, coverage commands, and AgentX ignore rules.
- Updated dependencies and lockfile, including `@eliware/log` 1.1.9.

## 1.1.3 — 2026-07-01

- Refreshed package metadata and dependencies.
- Regenerated the lockfile.

## 1.1.2 — 2025-12-21

- Updated the CommonJS and ESM implementations in parallel.
- Refined package metadata and dependencies.
- Regenerated the lockfile.

## 1.1.1 — 2025-12-08

- Refreshed package metadata, dependencies, and lockfile.
