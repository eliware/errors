import { jest } from "@jest/globals";
import { installHandlers } from "../src/setup.mjs";

function makeOptions(overrides = {}) {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = { ready: false, removeHandlers: jest.fn() };
  return {
    processObj,
    add: "on",
    remove: "off",
    selected: ["warning"],
    handlers: { warning: jest.fn() },
    addedEvents: new Set(),
    registration,
    registrations: new WeakMap([[processObj, registration]]),
    fired: new Set(),
    oneShot: false,
    isCleanupPending: () => false,
    markSetupComplete: jest.fn(),
    ...overrides,
  };
}

test("adds handlers and marks setup complete", () => {
  const options = makeOptions();
  installHandlers(options);
  expect(options.processObj.on).toHaveBeenCalledWith("warning", options.handlers.warning);
  expect(options.addedEvents.has("warning")).toBe(true);
  expect(options.markSetupComplete).toHaveBeenCalledTimes(1);
  expect(options.registration.ready).toBe(true);
});

test("rejects an event when the process object returns false", () => {
  const options = makeOptions({
    processObj: { on: jest.fn(() => false), off: jest.fn() },
    registrations: new WeakMap(),
  });
  expect(() => installHandlers(options)).toThrow("processObj rejected listener for warning");
  expect(options.processObj.off).not.toHaveBeenCalled();
  expect(options.registrations.has(options.processObj)).toBe(false);
});

test("reads pending cleanup state after synchronous setup", () => {
  let cleanupPending = false;
  const processObj = {
    on: jest.fn(() => {
      cleanupPending = true;
    }),
    off: jest.fn(),
  };
  const options = makeOptions({
    processObj,
    registrations: new WeakMap(),
    isCleanupPending: () => cleanupPending,
  });
  installHandlers(options);
  expect(options.registration.removeHandlers).toHaveBeenCalledTimes(1);
});

test("removes handlers after all one-shot events fire", () => {
  const options = makeOptions({ oneShot: true, fired: new Set(["warning"]) });
  installHandlers(options);
  expect(options.registration.removeHandlers).toHaveBeenCalledTimes(2);
});

test("preserves existing listeners when event setup fails", () => {
  const setupError = Error("setup");
  const existing = jest.fn();
  const listeners = new Set([existing]);
  const options = makeOptions({
    processObj: {
      on: jest.fn((event, handler) => {
        listeners.add(handler);
        handler();
        throw setupError;
      }),
      off: jest.fn((event, handler) => listeners.delete(handler)),
    },
  });
  options.registrations = new WeakMap([[options.processObj, options.registration]]);
  expect(() => installHandlers(options)).toThrow(setupError);
  expect(options.processObj.off).toHaveBeenCalledWith("warning", expect.any(Function));
  expect(listeners.has(existing)).toBe(true);
  expect(options.registrations.has(options.processObj)).toBe(false);
});

test("removes a listener when the process method attaches it and then throws", () => {
  const listeners = new Set();
  const setupError = Error("setup");
  const processObj = {
    on: jest.fn((event, handler) => {
      listeners.add(handler);
      throw setupError;
    }),
    off: jest.fn((event, handler) => listeners.delete(handler)),
  };
  const options = makeOptions({ processObj, registrations: new WeakMap() });
  expect(() => installHandlers(options)).toThrow(setupError);
  expect(processObj.off).toHaveBeenCalledWith("warning", options.handlers.warning);
  expect(listeners.size).toBe(0);
});
