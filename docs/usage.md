# Usage

This guide explains package setup, event selection, logger use, and handler cleanup.
Read the [API reference](api.md) for option defaults and error details.

## Requirements

Use Node.js 26 or newer. Use a project that supports ECMAScript modules.
The package includes TypeScript declarations.

## Install the package

Run this command in your project:

```bash
npm install @eliware/errors
```

## Add the default handlers

Import `registerHandlers` from the package. Call it during application startup.

```js
import { registerHandlers } from "@eliware/errors";

const handlers = registerHandlers();
```

By default, the package handles `uncaughtException`, `unhandledRejection`, and `warning`.
Keep the returned object while the handlers stay active.

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

## Use a custom logger

The default logger comes from `@eliware/log`. Set `log` to use a custom logger.
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

The package sends a message and a small set of metadata to the logger.
For warnings, the message is `Warning` and the metadata key is `warning`.
For uncaught process errors, the message is `Uncaught process error` and the key is `error`.
For `unhandledRejection`, the message is `Unhandled promise error` and the key is `reasonType`.

When a value has type `Error`, warning and process error metadata include `name: "Error"` and `type: "Error"`.
For other values, that metadata contains the value type.
The package sets `reasonType` to JavaScript `typeof` for the promise cause.
The default logger does not receive the raw event value.
The package does not send raw event values to a custom logger.
Your logger can change the output destination and format.

## Use a custom process object

Set `processObj` to provide a process-like object. The object must provide `on()`.
It must also provide `off()` or `removeListener()`.
It can provide `once()` for one-shot listeners.
If `on()` or `once()` returns `false`, registration fails.

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

The package uses Node.js `process` when you omit `processObj`.
Use a custom process object for tests or controlled event sources.

## Use one-shot listeners

Set `once` to `true` to process each selected event one time.
The package uses `processObj.once()` when that method exists.
If `processObj.once()` does not exist, the package uses `processObj.on()` and ignores later calls for that event.
The package removes the full registration after every selected event has fired once.

```js
const handlers = registerHandlers({ events: ["warning"], once: true });
```

## Remove handlers

Call `removeHandlers()` when the application no longer uses the handlers.
The call removes each registered handler once.
Check `removed` after the cleanup call.

```js
const handlers = registerHandlers();

// Remove handlers during application shutdown.
handlers.removeHandlers();
console.log(handlers.removed); // true
```

You can call `removeHandlers()` more than once. A second call does not repeat removals that finished.
If one removal fails, the method throws that error.
Call it again to retry the failed removal.

## Remove handlers with an AbortSignal

Pass an `AbortSignal` in `signal`. The package removes handlers when the signal aborts.

```js
const controller = new AbortController();
const handlers = registerHandlers({ signal: controller.signal });

controller.abort();
console.log(handlers.removed); // true
```

You can also call `removeHandlers()` before the signal aborts.
The package removes its abort listener when cleanup is complete.

## Understand registration rules

The package keeps one active registration for each `processObj` object.
A later call with the same object returns that registration.
Later options do not change its events, logger, or cleanup signal.
Pass an `AbortSignal` in the first call when abort cleanup is required.
Remove the active handlers before you call the function again with new options.

The package preserves other listeners on the process object.
It does not stop the application or start it again.
After an uncaught process error, your application must control shutdown or recovery.
The process can be in an unsafe state after an uncaught process error.

## Errors from callbacks

The caller receives logger errors and listener errors.
Add error control around the event source when the application requires it.
The package does not hide these errors.

## TypeScript

The package exports TypeScript declarations for `registerHandlers`, options, loggers, and process objects.
Import the function from `@eliware/errors` in an ECMAScript module project.

```ts
import { registerHandlers } from "@eliware/errors";

const handlers = registerHandlers({ events: ["warning"] });
handlers.removeHandlers();
```
