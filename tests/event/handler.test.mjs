import { jest } from "@jest/globals";
import { createEventHandler } from "../../src/event/handler.mjs";
import registerHandlers from "../../src/registration.mjs";

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

test("propagates synchronous one-shot logger failures during setup", () => {
  const processObj = {
    on: jest.fn(),
    once: jest.fn((event, handler) => handler()),
    off: jest.fn(),
  };
  const log = {
    error: jest.fn(() => {
      throw Error("log");
    }),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  expect(() =>
    registerHandlers({ processObj, log, once: true, events: ["uncaughtException"] }),
  ).toThrow("log");
});

test("cleans up every listener after synchronous multi-event one-shot setup", () => {
  const listeners = new Map();
  const processObj = {
    on: jest.fn(),
    once: jest.fn((event, handler) => {
      listeners.set(event, handler);
      handler();
    }),
    off: jest.fn((event) => listeners.delete(event)),
  };
  const registration = registerHandlers({
    processObj,
    log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    once: true,
    events: ["warning", "uncaughtException"],
  });
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledTimes(2);
  expect(processObj.off).toHaveBeenCalledWith("warning", expect.any(Function));
  expect(processObj.off).toHaveBeenCalledWith("uncaughtException", expect.any(Function));
});

test("skips signal setup after synchronous one-shot cleanup", () => {
  const processObj = {
    on: jest.fn(),
    once: jest.fn((event, handler) => handler()),
    off: jest.fn(),
  };
  const signal = { aborted: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  registerHandlers({
    processObj,
    log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    once: true,
    events: ["warning"],
    signal,
  });
  expect(signal.addEventListener).not.toHaveBeenCalled();
});

test("logs setup after synchronous one-shot cleanup", () => {
  const processObj = {
    on: jest.fn(),
    once: jest.fn((event, handler) => handler()),
    off: jest.fn(),
  };
  const log = { error: jest.fn(), warn: jest.fn(), debug: jest.fn() };
  registerHandlers({ processObj, log, once: true, events: ["warning"] });
  expect(log.debug).toHaveBeenCalledWith("Handler setup is complete");
});

test("ignores stale callbacks after explicit cleanup", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const log = { error: jest.fn(), warn: jest.fn(), debug: jest.fn() };
  const registration = registerHandlers({ processObj, log, events: ["warning"] });
  const handler = processObj.on.mock.calls[0][1];
  registration.removeHandlers();
  handler("stale");
  expect(log.warn).not.toHaveBeenCalled();
});
