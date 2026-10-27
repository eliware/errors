# Troubleshooting

Use this page to find setup and run-time errors.
Read the [API reference](api.md) for full option and cleanup details.

## The package rejects `events`

Pass an array with at least one supported event name.
Use `uncaughtException`, `unhandledRejection`, or `warning`.
Remove all other names from the array.

## The package rejects `processObj`

Provide an `on()` method. Also provide `off()` or `removeListener()`.
If you set `once` to `true`, the package uses `once()` when it exists.
If `once()` does not exist, the package uses `on()`.

## The package rejects `log`

Provide `error()`, `warn()`, and `debug()` methods.
The `error()` and `warn()` methods accept a message and metadata.
The `debug()` method accepts a message.

## Registration fails during setup

Give `processObj` the required `on()` method and one removal method.
Give the logger the `error()`, `warn()`, and `debug()` methods.
Set `events` to an array of supported event names.
If an event method returns `false`, the package treats that event as rejected.
If setup fails, the package removes attached handlers. It also tries to remove a handler from an event method that throws.

Read `rollbackError` and `registration` on the thrown error if cleanup also fails.
Call `error.registration.removeHandlers()` to retry that cleanup.

## A logger or listener error reaches the caller

The package propagates errors from logger calls and event listeners.
Add error control in your application when it needs a recovery step.
Examine the logger methods and process object listeners for the first error.

## A handler remains after cleanup

Check the `removed` property after `removeHandlers()` returns.
The property is `true` only after cleanup succeeds.
If `removeHandlers()` throws, call it again to retry failed removals.
The package does not remove other listeners from the process object.
If one removal fails, the package keeps the completed removals and retries only the remaining work.

If the process object omits `listeners()`, its removal method must throw or return `false` when it cannot remove a handler.
The package cannot find a failure when a removal method returns without removing a handler.

## A second registration does not use new options

Each process object can have one active registration.
The package returns the active registration when you call it again with the same object.
Call `removeHandlers()` before you add handlers to that object with new options.

## An AbortSignal does not remove a registration

Pass a valid `AbortSignal` in the `signal` option.
Call `abort()` on its `AbortController` to remove the handlers.
Check `removed` after the abort call.

## The process continues after an uncaught process error

The default event list includes `uncaughtException`.
This listener changes Node.js default exit behavior for that event.
The package does not stop the process.

Do not continue usual work after an uncaught process error.
Do synchronous cleanup, then stop the process.
Use a separate process manager to start a replacement process.
Read the [Node.js process guide](https://nodejs.org/api/process.html#event-uncaughtexception) for details.
An uncaught process error can put the process in an unsafe state.

## Run repository checks

Run these commands from the repository root:

```bash
npm ci
npm test
```

`npm test` runs the repository checks. It does not find errors in your application.
