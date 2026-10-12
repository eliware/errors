# AGENTS.md

## Project

Maintain `@eliware/errors`, an ESM library for Node.js process error handlers.
Use Node.js 26 or newer and native ESM.

## Scope and boundaries

Maintain process handlers, their public API, documentation, and tests.
Do not terminate or restart applications from this library.

## Layout

Keep implementation and declarations under `src/`.
Keep one matching test under `tests/` for each source module.
Keep end-user documentation under `docs/` and runnable examples under `examples/`.

## Development

Use Node.js 26 or newer. Use native ESM for maintained JavaScript.
Keep modules focused. Keep public behavior documented and tested.

## Validation

Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for dependency audit checks.
Run `npm run format` to format maintained files.
Run `npm run format:check` to check file format.
Run `npm run typecheck` to check TypeScript declarations.
Run `npm run pack` to check package contents.

## Security

Do not commit credentials, tokens, secrets, or private data.
Use sanitized metadata with the default logger.
Review custom logger output for sensitive data.

## Changes

Keep documentation and release notes current.
Follow shared conventions and the Eliware Operations approval process.

## Library

Document public API changes and compatibility requirements.
Inject process-like objects and loggers when tests need to control them.

## npm publication

The public package is `@eliware/errors`.
Run package validation before publication review.
Follow the Eliware Operations publication checklist and approval process.
