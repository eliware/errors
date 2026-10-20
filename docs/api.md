# API Reference

Use this page to examine the public API for `@eliware/errors`.
The package uses native ECMAScript modules and requires Node.js 26 or newer.

## Import the function

Import the named or default `registerHandlers` function and the `defaultEvents` array.

```js
import registerHandlers, { defaultEvents } from "@eliware/errors";
```

The named and default exports refer to the same function.
The TypeScript declarations define types for the options, logger, process object, and return value.
The package does not export internal helper modules.
The `defaultEvents` array lists the supported event names. The array is read-only.

## Call the function

```js
const registration = registerHandlers(options);
```

Pass an options object or omit it to use the defaults.
The function adds event handlers to `options.processObj`.
The function returns one registration object for that process object.

## Options

| Option       | Default                   | Description                                                       |
| ------------ | ------------------------- | ----------------------------------------------------------------- |
| `processObj` | Node.js `process`         | An object that provides `on()` and `off()` or `removeListener()`. |
| `log`        | The `@eliware/log` logger | An object that provides `error()`, `warn()`, and `debug()`.       |
| `events`     | All supported events      | An array with one or more supported event names.                  |
| `once`       | `false`                   | Set to `true` to process each selected event one time.            |
| `signal`     | No signal                 | An `AbortSignal` that removes handlers when it aborts.            |

The package removes duplicate event names.
The package throws a `TypeError` if `events` is not an array.
The package throws a `RangeError` if the array is empty or has no supported name.
The package throws a `RangeError` if the array contains an unsupported name.

## Supported events

| Event                | Logger method | Message                   | Metadata                                      |
| -------------------- | ------------- | ------------------------- | --------------------------------------------- |
| `uncaughtException`  | `error()`     | `Uncaught process error`  | `error` contains the event value type.        |
| `unhandledRejection` | `error()`     | `Unhandled promise error` | `reasonType` contains the promise cause type. |
| `warning`            | `warn()`      | `Warning`                 | `warning` contains the event value type.      |

When an event value has type `Error`, `error` or `warning` contains `name: "Error"` and `type: "Error"`.
For all other event values, the package records only the value type.
The package does not send raw event values to the logger.
The logger `debug()` method receives `Handler setup is complete` after setup.

## Process object requirements

Set `processObj` to an object with an `on()` method.
Also provide an `off()` or `removeListener()` method.
The package uses `off()` when both removal methods exist.
The object can provide `once()` for one-shot listeners.
If `once()` does not exist, the package uses `on()` and tracks fired events.
If `on()` or `once()` returns `false`, the package treats that event as rejected.

## Registration behavior

The package keeps one active registration for each process object.
Each call validates its options before it checks for an active registration.
A second call with that object returns the active registration.
Later options do not change the active events, logger, or signal.
Pass all required options in the first call.
If a call occurs while setup is incomplete, the package throws an error.

If `once` is `true`, the package removes the registration after all selected events fire once.
If a logger method throws during a one-shot event, the package marks that event as fired and removes the registration.
Logger and listener errors propagate to the caller.

## Registration object

| Member             | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| `removed`          | A boolean that reports cleanup status. TypeScript declarations mark it read-only. |
| `removeHandlers()` | Removes this package's handlers and its abort listener.                           |

Call `removeHandlers()` more than once when required.
The method does not repeat completed removals.
If a removal fails, the method throws the first error and sets `removed` to `false`.
Call the method again to retry the remaining cleanup.
The method does not remove other process listeners.

## Abort signal behavior

Pass an `AbortSignal` in the first call.
The package adds a one-time abort listener.
The package removes the handlers when the signal aborts.
If the signal aborted before setup, the package removes the handlers during setup.
The package removes its abort listener after cleanup succeeds.

## Setup errors

The package throws a `TypeError` when the process object, logger, or signal lacks a required method.
During setup, the package throws errors from event methods or logger methods.
The package tries to remove earlier handlers when setup fails.
If an event method throws, the package also tries to remove that event's handler.

If rollback fails, the thrown error can include `rollbackError` and `registration` properties.
Call `error.registration.removeHandlers()` to retry handler removal.
If setup cleanup also fails, the thrown error can include a `cleanupError` property.

## Process safety

The default event list includes `uncaughtException`.
This listener changes Node.js default exit behavior for that event.
The package does not stop the process.
Do not continue usual work after an uncaught process error.
Do synchronous cleanup, then stop the process.
Read the [Node.js process guide](https://nodejs.org/api/process.html#event-uncaughtexception) for details.
