# Documentation

Use these pages to install, configure, and operate `@eliware/errors`.

## Start here

- [Usage guide](usage.md): install the package, register handlers, choose events, and remove handlers.
- [Troubleshooting](troubleshooting.md): diagnose setup, logging, and cleanup errors.

## Requirements

Use Node.js 26 or newer. Use a project that supports ECMAScript modules.

## Package purpose

The package logs uncaught exceptions, unhandled rejections, and process warnings.
It does not stop or restart the application.
Your application controls shutdown and recovery.
