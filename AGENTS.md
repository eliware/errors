# AGENTS.md

## Project

Maintain the public `@eliware/errors` library described in `README.md`.

## Scope and boundaries

Maintain the public API, documentation, and tests. Do not stop or restart the application.

## Layout

Keep implementation and declarations under `src/`. Mirror each source module with one same-path test under `tests/`.
Keep user guides under `docs/` and runnable examples under `examples/`.
Keep `docs/README.md` and `examples/README.md`. Link both indexes from the root README.
Index every Markdown file under `docs/`, except its index. Index each `.mjs` example.

## Development

Use Node.js 26 and native ESM. Keep modules focused and entrypoints thin.
Inject external dependencies when tests need control.
Document public APIs, supported workflows, settings, defaults, and compatibility.

## Validation

Run `npm test` for aggregate validation. Keep package validation in the aggregate checks.
Run `npm run lint` for lint checks. Run `npm run audit` for dependency checks.
Run `npm run format` to format maintained files. Run `npm run format:check` to check formatting.
Run `npm run typecheck` for TypeScript checks. Run `npm run pack` for package checks.

## Security

Do not commit secrets, credentials, or private data. The default logger sends limited error metadata.
Review custom logger output for sensitive data.

## Changes

Keep documentation and release notes current. Describe user-visible changes in release notes.
Do not report an unpublished version as available to users.

## Library

Document public API changes and compatibility limits. Inject process objects and loggers in tests.

## npm publication

Keep package contents and publication metadata valid. Run aggregate validation before release review.
Passing validation does not grant release authority. Publish only with explicit authorization.
