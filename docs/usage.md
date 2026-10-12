# Usage

This guide explains package setup, event selection, logger use, and handler cleanup.

## Requirements

Use Node.js 26 or newer. Use a project that supports ECMAScript modules.
The package includes TypeScript declarations.

## Install the package

Run this command in your project:

```bash
npm install @eliware/errors
```

## Register the default handlers

Import `registerHandlers` from the package. Call it during application startup.

```js
import { registerHandlers } from "@eliware/errors";

const handlers = registerHandlers();
```

By default, the package handles `uncaughtException`, `unhandledRejection`, and `warning`.
Keep the returned object for the full time that you need these handlers.

## Select events

Set `events` to an array of supported event names. The array must contain at least one supported name.

```js
const handlers = registerHandlers({ events: ["warning"] });
```

Supported names are `uncaughtException`, `unhandledRejection`, and `warning`.
The package removes duplicate names from the array.
The package throws a `TypeError` if `events` is not an array.
The package throws a `RangeError` if the array is empty or has no supported name.
The package throws a `RangeError` if the array includes an unsupported name.

## Choose a logger

The default logger comes from `@eliware/log`. Set `log` to use another logger.
Your logger must provide `error(message, metadata)`, `warn(message, metadata)`, and `debug(message)` methods.

```js
const log = {
  error(message, metadata) {
    console.error(message, metadata);
  },
  warn(message, metadata) {
    console.warn(message, metadata);
  },
  debug(message) {
    console.debug(message);
  },
};

const handlers = registerHandlers({ log, events: ["warning"] });
```

The package sends a message and limited metadata to the logger.
For warnings, the message is `Warning` and the metadata key is `warning`.
For uncaught exceptions, the message is `Uncaught Exception` and the key is `error`.
For unhandled rejections, the message is `Unhandled Rejection` and the key is `reasonType`.
For an `Error` value, warning and exception metadata contain `name: "Error"` and `type: "Error"`.
For other values, that metadata contains the value type.
Rejection metadata contains the result of JavaScript `typeof` for the reason.
The default logger does not receive the raw event value.
Your custom logger controls its own data and redaction rules.

## Use a custom process object

Set `processObj` to provide a process-like object. The object must provide `on()`.
It must also provide `off()` or `removeListener()`.
It can provide `once()` for one-shot listeners.

```js
const listeners = new Map();
const processObj = {
  on(event, listener) {
    const eventListeners = listeners.get(event) ?? new Set();
    eventListeners.add(listener);
    listeners.set(event, eventListeners);
  },
  off(event, listener) {
    listeners.get(event)?.delete(listener);
  },
};
const handlers = registerHandlers({ processObj, events: ["warning"] });
```

The package uses the real Node.js `process` object when you omit `processObj`.
Use a custom process object for tests or controlled event sources.

## Use one-shot listeners

Set `once` to `true` to handle each selected event one time.
The package uses `processObj.once()` when that method exists.
Otherwise, it uses `processObj.on()` and ignores later calls for that event.
The package removes the full registration after every selected event has fired once.

```js
const handlers = registerHandlers({ events: ["warning"], once: true });
```

## Remove handlers

Call `removeHandlers()` when the application no longer needs the handlers.
The call removes each registered handler once.
Check `removed` to see whether cleanup completed.

```js
const handlers = registerHandlers();

// Remove handlers during application shutdown.
handlers.removeHandlers();
console.log(handlers.removed); // true
```

You can call `removeHandlers()` more than once. A second call does not repeat successful removals.
If removal fails, the method throws the removal error.
Call it again to retry any removal that failed.

## Remove handlers with an AbortSignal

Pass an `AbortSignal` in `signal`. The package removes handlers when the signal aborts.

```js
const controller = new AbortController();
const handlers = registerHandlers({ signal: controller.signal });

controller.abort();
console.log(handlers.removed); // true
```

You can also call `removeHandlers()` before the signal aborts.
The package removes its abort listener after successful cleanup.

## Understand registration rules

The package keeps one active registration for each `processObj` object.
A later call with the same object returns that registration.
Later options do not change its events, logger, or cleanup signal.
Remove the active registration before you register again with new options.

The package preserves other listeners on the process object.
It does not stop or restart the application.
After an uncaught exception, your application must decide how to stop or recover.
The process can be in an unsafe state after an uncaught exception.

## Handle errors from callbacks

Logger errors and listener errors can reach the caller.
Add error control around the event source when your application needs it.
The package does not hide these errors.

## TypeScript

The package exports TypeScript declarations for `registerHandlers`, options, loggers, and process objects.
Import the function from `@eliware/errors` in an ECMAScript module project.

```ts
import { registerHandlers } from "@eliware/errors";

const handlers = registerHandlers({ events: ["warning"] });
handlers.removeHandlers();
```
