# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/errors [![npm version](https://img.shields.io/npm/v/@eliware/errors.svg)](https://www.npmjs.com/package/@eliware/errors)[![license](https://img.shields.io/github/license/eliware/errors.svg)](LICENSE)[![build status](https://github.com/eliware/errors/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/errors/actions)

> Minimal Node.js process-level error handler utility for uncaught exceptions, unhandled rejections, and warnings. Works in both CommonJS and ESM environments.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [ESM Example](#esm-example)
  - [CommonJS Example](#commonjs-example)
- [API](#api)
- [TypeScript](#typescript)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Features

- Handles uncaught exceptions, unhandled rejections, and warnings
- Pluggable logger (defaults to [@eliware/log](https://www.npmjs.com/package/@eliware/log))
- Easy to add/remove handlers for testability
- Works in both CommonJS and ESM modules

## Installation

```bash
npm install @eliware/errors
```

## Usage

### ESM Example

```js
import { registerHandlers } from '@eliware/errors';
registerHandlers();

// Or with options:
// registerHandlers({ processObj: process, log: customLogger });

// Simulate an uncaught exception
setTimeout(() => { throw new Error('Demo uncaught exception'); }, 1000);
```

### CommonJS Example

```js
const { registerHandlers } = require('@eliware/errors');
registerHandlers();

// Or with options:
// registerHandlers({ processObj: process, log: customLogger });

// Simulate an uncaught exception
setTimeout(() => { throw new Error('Demo uncaught exception'); }, 1000);
```

## API

### registerHandlers(options)

Registers process-level exception handlers. Returns an object with a `removeHandlers` function to detach all handlers (useful for testing).

- `options` (optional): An object with the following properties:
  - `processObj` (optional): The process object to attach handlers to (default: `process`)
  - `log` (optional): Logger for output (default: [@eliware/log](https://www.npmjs.com/package/@eliware/log))
- **Returns:** `{ removeHandlers: () => void }`

## TypeScript

Type definitions are included:

```ts
export declare function registerHandlers(
  options?: {
    processObj?: NodeJS.Process,
    log?: typeof import('@eliware/log')
  }
): { removeHandlers: () => void };
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
