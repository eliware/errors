import { jest } from "@jest/globals";
import { finalizeCleanup, finalizeRegistration } from "../src/finalize.mjs";

function makeOptions(overrides = {}) {
  const processObj = {};
  const registration = { removed: false, ready: false, removeHandlers: jest.fn() };
  const registrations = { delete: jest.fn(), set: jest.fn() };
  return {
    signal: undefined,
    log: { debug: jest.fn() },
    registration,
    registrations,
    processObj,
    ...overrides,
  };
}

test("logs successful registration", () => {
  const options = makeOptions();
  expect(finalizeRegistration(options)).toBe(options.registration);
  expect(options.log.debug).toHaveBeenCalledWith("Exception handlers registered");
});

test("attaches a signal and removes handlers when it is aborted", () => {
  const options = makeOptions({ signal: { addEventListener: jest.fn(), aborted: true } });
  finalizeRegistration(options);
  expect(options.signal.addEventListener).toHaveBeenCalledWith(
    "abort",
    options.registration.removeHandlers,
    { once: true },
  );
  expect(options.registration.removeHandlers).toHaveBeenCalledTimes(1);
});

test("cleans up and clears the registry after setup errors", () => {
  const error = Error("debug");
  const options = makeOptions({
    log: {
      debug: jest.fn(() => {
        throw error;
      }),
    },
  });
  expect(() => finalizeRegistration(options)).toThrow(error);
  expect(options.registration.removeHandlers).toHaveBeenCalledTimes(1);
  expect(options.registrations.delete).toHaveBeenCalledWith(options.processObj);
});

test("rejects invalid signals and removes registered handlers", () => {
  const options = makeOptions({ signal: {} });
  expect(() => finalizeRegistration(options)).toThrow("signal must provide addEventListener");
  expect(options.registration.removeHandlers).toHaveBeenCalledTimes(1);
  expect(options.registrations.delete).toHaveBeenCalledWith(options.processObj);
});

test("retains registrations when cleanup fails", () => {
  const error = Error("debug");
  const cleanupError = Error("cleanup");
  const options = makeOptions({
    log: {
      debug: jest.fn(() => {
        throw error;
      }),
    },
    registration: {
      removed: false,
      ready: false,
      removeHandlers: jest.fn(() => {
        throw cleanupError;
      }),
    },
  });
  expect(() => finalizeRegistration(options)).toThrow(error);
  expect(error.cleanupError).toBe(cleanupError);
  expect(options.registration.ready).toBe(true);
  expect(options.registrations.set).toHaveBeenCalledWith(options.processObj, options.registration);
});

test("detaches the abort listener and removes the registration", () => {
  const options = makeOptions({ signal: { removeEventListener: jest.fn() } });
  const abortListener = jest.fn();
  finalizeCleanup({ ...options, abortListener });
  expect(options.signal.removeEventListener).toHaveBeenCalledWith("abort", abortListener);
  expect(options.registrations.delete).toHaveBeenCalledWith(options.processObj);
});

test("removes the registration when no signal exists", () => {
  const options = makeOptions();
  finalizeCleanup({ ...options, abortListener: jest.fn() });
  expect(options.registrations.delete).toHaveBeenCalledWith(options.processObj);
});

test("removes the registration when no abort listener exists", () => {
  const options = makeOptions({ signal: { removeEventListener: jest.fn() } });
  finalizeCleanup({ ...options, abortListener: undefined });
  expect(options.signal.removeEventListener).not.toHaveBeenCalled();
  expect(options.registrations.delete).toHaveBeenCalledWith(options.processObj);
});

test("keeps the registration when abort-listener removal fails", () => {
  const error = Error("abort remove");
  const options = makeOptions({
    signal: {
      removeEventListener: jest.fn(() => {
        throw error;
      }),
    },
  });
  expect(() => finalizeCleanup({ ...options, abortListener: jest.fn() })).toThrow(error);
  expect(options.registrations.delete).not.toHaveBeenCalled();
});
