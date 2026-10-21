import { jest } from "@jest/globals";
import registerHandlers from "../src/registration.mjs";

const log = () => ({ debug: jest.fn(), error: jest.fn(), warn: jest.fn() });

test("registers default handlers", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const logger = log();
  const registration = registerHandlers({ processObj, log: logger });
  expect(processObj.on.mock.calls.map(([event]) => event)).toEqual([
    "uncaughtException",
    "unhandledRejection",
    "warning",
  ]);
  for (const [, handler] of processObj.on.mock.calls) handler(new Error("test"));
  expect(logger.error).toHaveBeenCalledTimes(2);
  expect(logger.warn).toHaveBeenCalledTimes(1);
  registration.removeHandlers();
});

test("uses process and logger defaults when options omit them", () => {
  const registration = registerHandlers();
  expect(registration.removeHandlers).toEqual(expect.any(Function));
  registration.removeHandlers();
});

test("validates later options before returning an active registration", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({ processObj, log: log(), events: ["warning"] });
  expect(() => registerHandlers({ processObj, log: log(), events: ["invalid"] })).toThrow(
    RangeError,
  );
  expect(() => registerHandlers({ processObj, log: {}, events: ["warning"] })).toThrow(
    "logger must provide the error method",
  );
  expect(() => registerHandlers({ processObj, log: log(), signal: {} })).toThrow(
    "signal must provide addEventListener",
  );
  processObj.on = undefined;
  expect(() => registerHandlers({ processObj, log: log() })).toThrow(
    "processObj must provide an on method",
  );
  expect(registration.removed).toBe(false);
  registration.removeHandlers();
});

test("rejects invalid registration events and process objects", () => {
  const logInstance = log();
  expect(() => registerHandlers({ processObj: {}, log: logInstance })).toThrow("on method");
  expect(() => registerHandlers({ processObj: { on: jest.fn() }, log: logInstance })).toThrow(
    "off or removeListener",
  );
  const processObj = { on: jest.fn(), off: jest.fn() };
  expect(() => registerHandlers({ processObj, log: logInstance, events: [] })).toThrow(
    "at least one",
  );
  expect(() => registerHandlers({ processObj, log: logInstance, events: "warning" })).toThrow(
    "events must be an array",
  );
  expect(() => registerHandlers({ processObj, log: logInstance, events: ["invalid"] })).toThrow(
    "at least one",
  );
  expect(() =>
    registerHandlers({ processObj, log: logInstance, events: ["warning", "invalid"] }),
  ).toThrow("Unsupported process event");
});

test("rejects malformed loggers during registration", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  expect(() => registerHandlers({ processObj, log: {} })).toThrow(
    "logger must provide the error method",
  );
  expect(() => registerHandlers({ processObj, log: { error: jest.fn() } })).toThrow(
    "logger must provide the warn method",
  );
  expect(() =>
    registerHandlers({ processObj, log: { error: jest.fn(), warn: jest.fn() } }),
  ).toThrow("logger must provide the debug method");
});

test("falls back to removable on listeners and removes all after every event fires", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: log(),
    once: true,
    events: ["warning", "uncaughtException"],
  });
  const [[, warningHandler], [, exceptionHandler]] = processObj.on.mock.calls;
  warningHandler();
  expect(processObj.off).not.toHaveBeenCalled();
  expect(registration.removed).toBe(false);
  exceptionHandler();
  expect(processObj.off).toHaveBeenCalledTimes(2);
  expect(processObj.off).toHaveBeenNthCalledWith(1, "warning", warningHandler);
  expect(processObj.off).toHaveBeenNthCalledWith(2, "uncaughtException", exceptionHandler);
  expect(registration.removed).toBe(true);
});

test("removes listeners when abort fires as the signal listener is added", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const signal = {
    aborted: false,
    addEventListener: jest.fn((event, listener) => listener()),
    removeEventListener: jest.fn(),
  };
  const registration = registerHandlers({ processObj, log: log(), events: ["warning"], signal });
  expect(registration.ready).toBe(true);
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledWith("warning", expect.any(Function));
});

test("keeps failed one-shot cleanup retryable through its registration", () => {
  const cleanupError = Error("cleanup");
  const processObj = {
    on: jest.fn(),
    off: jest.fn().mockImplementationOnce(() => {
      throw cleanupError;
    }),
  };
  const registration = registerHandlers({
    processObj,
    log: log(),
    once: true,
    events: ["warning"],
  });
  expect(() => processObj.on.mock.calls[0][1]("warning")).toThrow(cleanupError);
  expect(registration.removed).toBe(false);
  expect(processObj.off).toHaveBeenCalledTimes(1);
  registration.removeHandlers();
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledTimes(2);
});
