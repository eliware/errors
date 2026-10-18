# AGENTS.md

## Project

Maintain the public `@eliware/errors` library described in `README.md`.

## Scope and boundaries

Maintain the public API, documentation, and tests. Keep the application running.

## Layout

Keep implementation and declarations under `src/`. Mirror each source module with one same-path test under `tests/`.
Keep user guides under `docs/` and runnable examples under `examples/`.

Keep `docs/README.md` and `examples/README.md`. Link both indexes from the root README.
Skip `docs/README.md` when you index Markdown files under `docs/`. Index each `.mjs` example.

## Development

Use Node.js 26 and native ESM. Keep modules focused and entry points small.
Give tests control of external dependencies.
Document public APIs, supported workflows, settings, defaults, and compatibility.

## Validation

Run `npm test` for aggregate validation. Keep package checks in the aggregate checks.
Run `npm run lint` for lint checks. Run `npm run audit` for dependency checks.

Run `npm run format` to format maintained files. Run `npm run format:check` to check file format.
Run `npm run typecheck` for TypeScript checks. Run `npm run pack` for package checks.

## Security

Do not commit secrets, credentials, or private data. The default logger sends a small set of error details.
Examine custom logger output for sensitive data.

## Changes

Keep documentation and release notes current. Describe user-visible changes in release notes.
Do not report an unpublished version as available to users.

## Library

Document public API changes and compatibility limits. Give tests control of process objects and loggers.

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## npm publication

Keep package contents and publication metadata valid.
Run aggregate validation before release approval.
Validation does not grant release authority. Publish only with explicit authorization.
