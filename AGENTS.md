# AGENTS.md

## Project

`@eliware/errors` is an ESM-only Node.js utility for registering process-level handlers for uncaught exceptions, unhandled rejections, and warnings.

## Development

- Use Node.js 26.
- Preserve both named and default `registerHandlers` exports.
- Keep registration idempotent per process-like object.
- Preserve existing process listeners.
- Keep cleanup safe and repeatable through `removeHandlers()`.
- Preserve support for custom loggers, process-like objects, selectable events, one-shot listeners, and `AbortSignal` cleanup.
- Never silently swallow handler or logger failures without documenting the behavior.
- Treat `uncaughtException` handling carefully; applications should log the error and shut down gracefully when appropriate.

## Validation

Run before committing:

```bash
npm test
npm run lint
npm run test:gaps
```

Maintain 100% test coverage without Istanbul ignore directives. Add or update tests for every behavior change.

## Documentation and API

- Update `index.d.ts` whenever the public API changes.
- Update `README.md` and `example.mjs` for user-facing behavior.
- Keep examples safe to run; do not intentionally terminate the developer's shell unless explicitly demonstrating that behavior.
- Do not bump versions, create release notes, tag, or publish unless explicitly requested.

## Git and Dependencies

- Keep `.agentx*`, coverage output, and temporary test artifacts ignored.
- Avoid unnecessary dependency changes.
- Do not push changes unless explicitly requested.
