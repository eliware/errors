# Troubleshooting

Use this page to diagnose common setup and runtime errors.

## The package rejects `events`

Pass an array with at least one supported event name.
Use `uncaughtException`, `unhandledRejection`, or `warning`.
Remove all other names from the array.

## The package rejects `processObj`

Provide an `on()` method. Also provide `off()` or `removeListener()`.
If you set `once` to `true`, the package uses `once()` when it exists.
The package can use `on()` when `once()` does not exist.

## The package rejects `log`

Provide `error()`, `warn()`, and `debug()` methods.
The `error()` and `warn()` methods accept a message and metadata.
The `debug()` method accepts a message.

## A logger or listener error reaches the caller

The package propagates errors from logger calls and event listeners.
Add error control in your application when it needs a recovery step.
Review the logger methods and the process object listeners for the first error.

## A handler remains after cleanup

Check the `removed` property after `removeHandlers()` returns.
The property is `true` only after cleanup succeeds.
If `removeHandlers()` throws, call it again to retry failed removals.
The package does not remove other listeners from the process object.

## A second registration does not use new options

Each process object can have one active registration.
The package returns the active registration when you call it again with the same object.
Call `removeHandlers()` before you register that object with new options.

## An AbortSignal does not remove a registration

Pass a valid `AbortSignal` in the `signal` option.
Call `abort()` on its `AbortController` to remove the handlers.
Check `removed` after the abort call.

## The process continues after an uncaught exception

The package logs the exception. It does not stop or restart the application.
Your application must control shutdown or recovery.
An uncaught exception can leave the process in an unsafe state.

## Run repository checks

Use these commands from the repository root:

```bash
npm ci
npm test
```

`npm test` runs the repository validation suite. It does not diagnose errors in your application.
