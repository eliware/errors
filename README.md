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

The package adds listeners for uncaught exceptions, unhandled rejections, and warnings.

## Requirements

Use Node.js 26 or newer with ECMAScript module support.

## Setup

Run `npm install @eliware/errors` to install the public npm package.

## Usage

Import `registerHandlers` and select the events to receive:

```js
import { registerHandlers } from "@eliware/errors";

const handlers = registerHandlers({ events: ["warning"] });
handlers.removeHandlers();
```

Read the [usage guide](docs/usage.md) for options and behavior. Read the [release notes](RELEASE_NOTES.md) for package changes.

## Development

Run `npm ci` to install development dependencies. Read the [documentation index](docs/README.md), [examples index](examples/README.md), and [specifications index](specs/README.md).

## Testing

Run `npm test` from the repository root for tests and aggregate checks.

## Troubleshooting

Read the [troubleshooting guide](docs/troubleshooting.md) for setup and cleanup errors.

## Security

The default logger receives selected error details. Check custom logger output for sensitive data.

## API

Read the [usage guide](docs/usage.md) for the exported API, options, defaults, and behavior.

## Packaging

The package name is `@eliware/errors`. Its runtime entry point is `src/index.mjs`, and its TypeScript declarations are in `src/index.d.ts`. It supports Node.js 26 and newer.

The `files` field in `package.json` defines package contents. Use Semantic Versioning for release numbers. Check the npm page for published versions.

Validation does not publish the package. Follow Operations procedures for release authorization.

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
