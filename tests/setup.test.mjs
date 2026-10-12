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

test("rolls back listeners after setup fails", () => {
  const setupError = Error("setup");
  const options = makeOptions({
    processObj: {
      on: jest.fn(() => {
        throw setupError;
      }),
      off: jest.fn(),
    },
  });
  options.registrations = new WeakMap([[options.processObj, options.registration]]);
  expect(() => installHandlers(options)).toThrow(setupError);
  expect(options.processObj.off).toHaveBeenCalledWith("warning", options.handlers.warning);
  expect(options.registrations.has(options.processObj)).toBe(false);
});
