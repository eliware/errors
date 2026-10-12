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

- Register handlers for uncaught exceptions, unhandled rejections, and warnings.
- Select events and inject a logger or process-like object.
- Remove handlers with a registration method or an `AbortSignal`.
- Use one-shot listeners when the process-like object supports them.
- Use the package with native ECMAScript modules and TypeScript declarations.

## Requirements

Use Node.js 26 or newer. Use an ECMAScript module project.

## Setup

Install the package from npm:

```bash
npm install @eliware/errors
```

## Usage

Import and register the handlers:

```js
import { registerHandlers } from "@eliware/errors";

const registration = registerHandlers();
registration.removeHandlers();
```

Keep the registration for the application lifetime. Remove its handlers during shutdown.
See [Release Notes](RELEASE_NOTES.md) for package changes.

## Development

Use Node.js 26 or newer. Use `npm ci` to install development dependencies.
Run `npm test` to validate the repository.

Read the [documentation index](docs/README.md), [examples index](examples/README.md),
and [specifications index](specs/README.md) for more information.

## Testing

Use `npm test` for aggregate validation. Use `npm run lint` for lint checks.
Use `npm run typecheck` for TypeScript checks. Use `npm run pack` for package checks.

## Troubleshooting

The package registers handlers. It does not stop or restart the process.
After an uncaught exception, log the error and shut down when appropriate.
Logger and listener errors can reach the caller.

## Security

The default logger receives limited error metadata. Custom loggers control additional metadata and redaction.
Do not send secrets or raw event values through custom logger settings.

## API

### `registerHandlers(options)`

Register process event handlers. The function returns an object with `removeHandlers()` and `removed`.
The `removed` value is `true` after successful cleanup.

The optional `processObj` value must provide `on()` and either `off()` or `removeListener()`.
The optional `log` value must provide `error()`, `warn()`, and `debug()` methods.

Use `events` to select supported event names. Use `once` to request one-shot listeners.
Use `signal` to remove handlers when an `AbortSignal` aborts.

Registration is idempotent for each process-like object. Later options do not change an existing registration.
Remove the registration before you register again with different options.

Cleanup removes each handler once. A failed removal can be retried by calling `removeHandlers()` again.
If setup fails, the package removes handlers that it added when possible.

The package preserves existing listeners. It propagates logger and listener errors to the caller.
Handling an uncaught exception can leave the process in an unsafe state.

## Packaging

The npm package includes runtime files under `src/`, declarations, documentation, examples, specifications,
the license, and release notes. The package supports Node.js 26 and newer.

The package uses semantic versioning. A published version is available from npm after publication completes.
Repository validation does not approve or perform a release.

## Examples

Read the [basic example](examples/basic.mjs) and the [example index](examples/README.md).

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
