# Documentation

Use these pages to install, configure, and operate `@eliware/errors`.

## Start here

- [API reference](api.md): examine options, events, log messages, cleanup, and error behavior.
- [Usage guide](usage.md): install the package, set up handlers, select events, and remove handlers.
- [Troubleshooting](troubleshooting.md): find setup, logger, and cleanup errors.

## Requirements

Use Node.js 26 or newer. Use a project that supports ECMAScript modules.

## Package purpose

The package handles `uncaughtException`, `unhandledRejection`, and `warning` events.
It does not stop the application or start it again.
Your application controls shutdown and recovery.
