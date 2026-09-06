# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

Documentation: [docs](docs/README.md) · [specifications](specs/README.md) · [examples](examples/README.md)

## @eliware/errors [![npm version](https://img.shields.io/npm/v/@eliware/errors.svg)](https://www.npmjs.com/package/@eliware/errors)[![license](https://img.shields.io/github/license/eliware/errors.svg)](LICENSE)[![build status](https://github.com/eliware/errors/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/errors/actions)

> Minimal ESM-only Node.js process-level handler for uncaught exceptions, unhandled rejections, and warnings.

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [ESM Example](#esm-example)
  - [API](#api)
- [Configuration](#configuration)
- [TypeScript](#typescript)
- [Errors / Troubleshooting](#errors--troubleshooting)
- [Development](#development)
- [Security](#security)
- [Operations](#operations)
- [Validation](#validation)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Features

- Handles uncaught exceptions, unhandled rejections, and warnings
- Pluggable logger (defaults to [@eliware/log](https://www.npmjs.com/package/@eliware/log))
- Idempotent registration with safe, repeatable cleanup
- Selectable events, one-shot handlers, and AbortSignal cleanup
- Easy to add/remove handlers for testability
- ESM-only package with TypeScript declarations

## Requirements

- Node.js 26 or newer

## Installation

```bash
npm install @eliware/errors
```

## Usage

### ESM Example

```js
import { registerHandlers } from '@eliware/errors';

const registration = registerHandlers();
console.log('Handlers registered.');
registration.removeHandlers();
```

For a long-running application, keep the returned registration and remove it
during shutdown. Options can select events, use one-shot listeners, inject a
logger or process-like object for testing, and connect cleanup to an
`AbortSignal`.

```js
const shutdownController = new AbortController();
const registration = registerHandlers({
  events: ['uncaughtException', 'unhandledRejection'],
  signal: shutdownController.signal
});
```

## API

### registerHandlers(options)

Registers process-level exception handlers. Returns an object with a `removeHandlers` function to detach all handlers (useful for testing).

- `options` (optional):
  - `processObj`: Process-like event target (default: `process`)
  - `log`: Logger with `error`, `warn`, and `debug` methods (default: [@eliware/log](https://www.npmjs.com/package/@eliware/log))
  - `events`: Supported event names to register (default: all three)
  - `once`: Use one-shot listeners when supported
  - `signal`: AbortSignal that automatically removes handlers
  - **Returns:** `{ removeHandlers: () => void, removed: boolean }`; call it to detach the selected handlers. `removed` is runtime-mutated from `false` to `true` after successful cleanup and should be treated as read-only by consumers.
    - Each event is removed once.
    - If an event or abort-listener removal throws, successful removals are not retried; a later call retries only failed removals.
    - A failed event cleanup leaves `removed` set to `false`; inspect the thrown error and retry `removeHandlers()` after correcting the target.
    - `processObj` methods are called with `processObj` as their receiver. The target must provide callable `on` plus `off` or `removeListener`; `once` is optional and is used only when `once: true`. Synchronous callbacks from custom `once()` or `addEventListener()` implementations are supported; cleanup is reconciled after setup completes.
    - `log` must provide callable `error`, `warn`, and `debug` methods; malformed loggers are rejected during registration.

Registration is idempotent per process-like object; repeated calls return the existing registration. Cleanup is safe to call repeatedly and removes the registration from the internal registry. The returned `removed` property becomes `true` after successful cleanup, including one-shot and AbortSignal cleanup. Existing listeners are preserved. For production use, remember that handling `uncaughtException` can leave the process in an unsafe state; log it and shut down gracefully when appropriate.

Idempotence uses first-registration-wins semantics: options supplied by a later
call are not applied to an existing registration. Call `removeHandlers()`
before registering again with different options.
This applies to later `events`, `log`, `once`, and `signal` options; they are
ignored until the existing registration is removed.

The `signal` option removes handlers when the signal aborts; retain the
registration or controller when explicit lifecycle control is needed:

```js
const controller = new AbortController();
const registration = registerHandlers({ signal: controller.signal });
controller.abort();
console.log(registration.removed); // true
```

For graceful shutdown, keep the registration and remove it from the shutdown
hook:

```js
const registration = registerHandlers();
process.once('SIGTERM', () => registration.removeHandlers());
```

Logger failures and listener-registration/removal failures are propagated to the caller. If registration fails partway through, listeners already added by this package are rolled back. Event-handler logger failures also propagate; custom loggers should handle their own transport failures so they do not obscure the original process event.
If rollback itself fails during setup, the original error remains the thrown error
and the cleanup failure is available as `error.rollbackError`; if one-shot handler
cleanup fails after a logger error, it is available as `error.cleanupError`.
These secondary properties are best-effort and are unavailable when the primary
thrown value is primitive or non-extensible.
When rollback fails, the registration remains in the internal registry so the
returned handle can be retried; later registration calls reuse that handle.
Because setup throws before returning its normal handle, the recovery handle is
also available as `error.registration` when the thrown error is extensible.
If abort-listener removal fails, the same retry rule applies: `removed` remains
`false` and a later `removeHandlers()` retries the failed signal cleanup.

## Configuration

No environment variables or configuration files are required. Configure the
library through the `registerHandlers(options)` argument. A custom logger must
provide `error(message, metadata)`, `warn(message, metadata)`, and
`debug(message)` methods. A process-like object must provide `on()` and either
`off()` or `removeListener()`.

## TypeScript

Type definitions are included:

```ts
import registerHandlers, { type RegisteredHandlers } from '@eliware/errors';

const registration: RegisteredHandlers = registerHandlers({ events: ['warning'] });
```

`removeHandlers()` returns `void` when cleanup succeeds and throws if the process-like object rejects a removal; call it again to retry failed removals.

## Errors / Troubleshooting

The package only registers handlers; it does not terminate or restart the process. After an uncaught exception, log the failure and shut down gracefully when appropriate. Because logger failures propagate from event handlers, production loggers should be reliable and applications should have a shutdown path that does not depend on logging succeeding. Use a process-like object and custom logger in tests.

## Development

```bash
npm test
npm run lint
npm run typecheck
npm audit --omit=dev --audit-level=moderate
npm run pack
```

## Security

The default logger receives sanitized error metadata (`{ name: 'Error', type:
'Error' }`), warning type metadata, and only the rejection reason type. Custom
loggers control any additional metadata and redaction and can bypass the
library's sanitized defaults. Do not pass raw event values or secrets through
custom logger configuration.

## Operations

This package does not terminate or restart the process. An `uncaughtException`
handler should log the failure and shut down gracefully when appropriate;
continuing after an uncaught exception may leave application state unsafe.

## Validation

Run all of these checks locally before committing; they are the package's
recommended validation suite. Release automation should provide audit and
package-artifact evidence separately:

```bash
npm test
npm run lint
npm run typecheck
npm audit --omit=dev --audit-level=moderate
npm run pack
```

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

[MIT © 2025 Eli Sterling, eliware.org](LICENSE)

## Links

- [Home Page](https://eliware.org)
- [GitHub](https://github.com/eliware/errors)
- [npm](https://www.npmjs.com/package/@eliware/errors)
- [Discord](https://discord.gg/M6aTR9eTwN)
