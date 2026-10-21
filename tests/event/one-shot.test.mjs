import { jest } from "@jest/globals";
import { handleOneShotEvent } from "../../src/event/one-shot.mjs";

function createOptions(overrides = {}) {
  return {
    event: "warning",
    invoke: jest.fn(() => "logged"),
    fired: new Set(),
    detachedEvents: new Set(),
    addedEvents: new Set(),
    add: "on",
    selected: ["warning"],
    registration: { removeHandlers: jest.fn() },
    isSetupComplete: () => false,
    setCleanupPending: jest.fn(),
    attachFailure: jest.fn(),
    ...overrides,
  };
}

test("records a fired event and defers cleanup until setup completes", () => {
  const options = createOptions();
  expect(handleOneShotEvent(options)).toBe("logged");
  expect(options.fired.has("warning")).toBe(true);
  expect(options.setCleanupPending).toHaveBeenCalledTimes(1);
  expect(options.registration.removeHandlers).not.toHaveBeenCalled();
});

test("detaches a once listener and removes handlers after all events fire", () => {
  const options = createOptions({
    add: "once",
    addedEvents: new Set(["warning"]),
    isSetupComplete: () => true,
  });
  handleOneShotEvent(options);
  expect(options.detachedEvents.has("warning")).toBe(true);
  expect(options.registration.removeHandlers).toHaveBeenCalledTimes(1);
});

test("records callback and cleanup failures", () => {
  const callbackError = new Error("callback");
  const cleanupError = new Error("cleanup");
  const options = createOptions({
    invoke: jest.fn(() => {
      throw callbackError;
    }),
    isSetupComplete: () => true,
    registration: {
      removeHandlers: jest.fn(() => {
        throw cleanupError;
      }),
    },
  });
  expect(() => handleOneShotEvent(options)).toThrow(callbackError);
  expect(options.fired.has("warning")).toBe(true);
  expect(options.attachFailure).toHaveBeenCalledWith(callbackError, "cleanupError", cleanupError);
});

test("propagates cleanup failures after a successful callback", () => {
  const cleanupError = new Error("cleanup");
  const options = createOptions({
    isSetupComplete: () => true,
    registration: {
      removeHandlers: jest.fn(() => {
        throw cleanupError;
      }),
    },
  });
  expect(() => handleOneShotEvent(options)).toThrow(cleanupError);
  expect(options.registration.removeHandlers).toHaveBeenCalledTimes(1);
  expect(options.attachFailure).not.toHaveBeenCalled();
});

test("defers cleanup after a callback error during setup", () => {
  const options = createOptions({
    invoke: jest.fn(() => {
      throw new Error("callback");
    }),
  });
  expect(() => handleOneShotEvent(options)).toThrow("callback");
  expect(options.fired.has("warning")).toBe(true);
  expect(options.setCleanupPending).toHaveBeenCalledTimes(1);
});
