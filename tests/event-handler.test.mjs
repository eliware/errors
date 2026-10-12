import { jest } from "@jest/globals";
import { createEventHandler } from "../src/event-handler.mjs";

function createOptions(overrides = {}) {
  return {
    event: "warning",
    log: { warn: jest.fn(() => "logged") },
    oneShot: false,
    fired: new Set(),
    detachedEvents: new Set(),
    addedEvents: new Set(),
    add: "on",
    selected: ["warning"],
    registration: { removed: false, removeHandlers: jest.fn() },
    isSetupComplete: () => false,
    setCleanupPending: jest.fn(),
    attachFailure: jest.fn(),
    ...overrides,
  };
}

test("logs events and ignores removed or fired handlers", () => {
  const options = createOptions();
  const handler = createEventHandler(options);
  expect(handler("warning")).toBe("logged");
  options.fired.add("warning");
  expect(handler("ignored")).toBeUndefined();
  options.fired.clear();
  options.registration.removed = true;
  expect(handler("ignored")).toBeUndefined();
});

test("defers one-shot cleanup until setup completes", () => {
  const options = createOptions({ oneShot: true });
  const handler = createEventHandler(options);
  expect(handler("warning")).toBe("logged");
  expect(options.setCleanupPending).toHaveBeenCalledTimes(1);
  expect(options.registration.removeHandlers).not.toHaveBeenCalled();
});

test("marks registered once listeners detached and removes after the last event", () => {
  const options = createOptions({
    oneShot: true,
    add: "once",
    addedEvents: new Set(["warning"]),
    isSetupComplete: () => true,
  });
  const handler = createEventHandler(options);
  handler("warning");
  expect(options.detachedEvents.has("warning")).toBe(true);
  expect(options.registration.removeHandlers).toHaveBeenCalledTimes(1);
});

test("propagates logger errors and records cleanup errors", () => {
  const loggerError = new Error("logger");
  const cleanupError = new Error("cleanup");
  const options = createOptions({
    oneShot: true,
    log: {
      warn: jest.fn(() => {
        throw loggerError;
      }),
    },
    isSetupComplete: () => true,
    registration: {
      removed: false,
      removeHandlers: jest.fn(() => {
        throw cleanupError;
      }),
    },
  });
  const handler = createEventHandler(options);
  expect(() => handler("warning")).toThrow(loggerError);
  expect(options.attachFailure).toHaveBeenCalledWith(loggerError, "cleanupError", cleanupError);
});
