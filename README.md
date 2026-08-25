# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

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
- [TypeScript](#typescript)
- [Errors / Troubleshooting](#errors--troubleshooting)
- [Development](#development)
- [Security](#security)
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

// Or with options:
const registration = registerHandlers({ processObj: process, log: customLogger });
console.log('Handlers registered.');
registration.removeHandlers();
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
- **Returns:** `{ removeHandlers: () => void, removed: boolean }`; call it to detach the selected handlers. `processObj` must provide `on` plus `off` or `removeListener`.

Registration is idempotent per process-like object; repeated calls return the existing registration. Cleanup is safe to call repeatedly and removes the registration from the internal registry. Existing listeners are preserved. For production use, remember that handling `uncaughtException` can leave the process in an unsafe state; log it and shut down gracefully when appropriate.

Logger failures and listener-registration/removal failures are propagated to the caller. If registration fails partway through, listeners already added by this package are rolled back.

## TypeScript

Type definitions are included:

```ts
export declare function registerHandlers(
  options?: {
    processObj?: ProcessLike;
    log?: typeof import('@eliware/log');
    events?: ProcessEvent[];
    once?: boolean;
    signal?: AbortSignal;
  }
): { removeHandlers: () => void; readonly removed: boolean };

interface ProcessLike {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  once?(event: string, listener: (...args: unknown[]) => void): unknown;
  off?(event: string, listener: (...args: unknown[]) => void): unknown;
  removeListener?(event: string, listener: (...args: unknown[]) => void): unknown;
}

type ProcessEvent = 'uncaughtException' | 'unhandledRejection' | 'warning';

export default registerHandlers;
```

## Errors / Troubleshooting

The package only registers handlers; it does not terminate or restart the process. After an uncaught exception, log the failure and shut down gracefully when appropriate. Use a process-like object and custom logger in tests.

## Development

```bash
npm test
npm run test:gaps
npm run lint
npm run typecheck
npm run pack
```

## Security

Do not expose sensitive exception or rejection data through custom loggers. Review logger configuration and redact secrets before logging process errors.

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
