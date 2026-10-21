# AGENTS.md

## Project

See README.md for the purpose, owner, and scope of this repository.

## Scope and boundaries

Keep requirements in their authoritative specifications.

## Layout

Use README.md and specs/README.md to find maintained files.

## Development

Use Node.js 26 and native ESM for maintained JavaScript modules.

## Validation

Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for dependency checks.
Run `npm run format` to format maintained files.
Run `npm run format:check` to check file format.

Run `npm run typecheck` for TypeScript checks.
Run `npm run pack` for package checks.

## Security

Keep secrets, credentials, private data, and runtime data out of Git.

## Changes

Keep user-visible changes in RELEASE_NOTES.md.

## Library

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## npm publication

Read the Operations procedures for release authorization.
