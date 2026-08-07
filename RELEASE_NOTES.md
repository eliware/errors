# Release Notes

## 1.1.7 — August 7, 2026

- Published a follow-up release after the 1.1.6 npm publication completed before CI retry.

## 1.1.6 — 2026-08-07

- Updated the runtime dependency `@eliware/log` to 1.1.10.
- Fixed coverage-gap filtering in the release validation workflow.

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

## 1.1.5 — 2026-08-06

- Added `AGENTS.md` with development conventions, validation commands, API compatibility guidance, security notes, and release workflow rules.
