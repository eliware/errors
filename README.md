# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/errors [![npm](https://img.shields.io/npm/v/@eliware/errors)](https://www.npmjs.com/package/@eliware/errors) [![License](https://img.shields.io/github/license/eliware/errors)](https://github.com/eliware/errors/blob/main/LICENSE) [![CI](https://github.com/eliware/errors/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/errors/actions/workflows/ci.yaml)

Process-level handlers for uncaught exceptions, unhandled rejections, and warnings.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [API](#api)
- [Packaging](#packaging)
- [Examples](#examples)
- [Support](#support)
- [Links](#links)
- [License](#license)

## Features

- Handle uncaught exceptions, unhandled rejections, and process warnings.
- Select events and provide a logger or process object.
- Remove handlers with the returned registration or an `AbortSignal`.
- Use one-shot listeners and TypeScript declarations.

## Requirements

Use Node.js 26 or newer. Use a project that supports ECMAScript modules.

## Setup

Install the public npm package:

```bash
npm install @eliware/errors
```

## Usage

Import `registerHandlers` and select the events that you need:

```js
import { registerHandlers } from "@eliware/errors";

const handlers = registerHandlers({ events: ["warning"] });
handlers.removeHandlers();
```

Keep the returned object while you need its handlers. Call `removeHandlers()` during shutdown.
Read the [usage guide](docs/usage.md) for options and behavior.
Read the [release notes](RELEASE_NOTES.md) for package changes.

## Development

Use Node.js 26 or newer. Run `npm ci` to install development dependencies.
Read the [documentation index](docs/README.md), [examples index](examples/README.md),
and [specifications index](specs/README.md).

## Testing

Run `npm test` from the repository root. It runs tests and aggregate repository checks.

## Troubleshooting

The package logs events. It does not stop or restart the application.
Read the [troubleshooting guide](docs/troubleshooting.md) for setup and cleanup errors.

## Security

The default logger receives limited event metadata. The default logger does not receive raw event values.
Review custom loggers for sensitive data. Do not log secrets or private data.

## API

Call `registerHandlers(options)` to register event handlers. It returns `removeHandlers()` and `removed`.
The default events are `uncaughtException`, `unhandledRejection`, and `warning`.
Set `events`, `log`, `processObj`, `once`, or `signal` to change supported options.
The package preserves other process listeners. It propagates logger and listener errors.
Read the [usage guide](docs/usage.md) for the full API and supported behavior.

## Packaging

The public package is `@eliware/errors`. Its runtime entry point is `src/index.mjs`.
Its TypeScript declarations are in `src/index.d.ts`. It supports Node.js 26 and newer.
The package contains `package.json`, `src/`, `docs/`, `examples/`, `specs/`, `README.md`,
`AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`.
Use the npm page to check published versions. Versions follow Semantic Versioning.
Validation does not publish the package. Publication requires explicit release authorization.

## Examples

Read the [examples index](examples/README.md) for prerequisites, commands, and expected results.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/errors)
- [Bug Reports](https://github.com/eliware/errors/issues)
- [npm](https://www.npmjs.com/package/@eliware/errors)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)
