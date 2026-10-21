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

test("propagates logger failures from warning and rejection callbacks", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const log = {
    error: jest.fn(() => {
      throw Error("rejection log");
    }),
    warn: jest.fn(() => {
      throw Error("warning log");
    }),
    debug: jest.fn(),
  };
  registerHandlers({ processObj, log, events: ["warning", "unhandledRejection"] });
  const handlers = Object.fromEntries(
    processObj.on.mock.calls.map(([event, handler]) => [event, handler]),
  );
  expect(() => handlers.warning("warning")).toThrow("warning log");
  expect(() => handlers.unhandledRejection("reason")).toThrow("rejection log");
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
