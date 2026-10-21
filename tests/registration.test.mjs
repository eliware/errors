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

test("falls back to removable on listeners when once is unavailable", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: log(),
    once: true,
    events: ["warning"],
  });
  processObj.on.mock.calls[0][1]();
  expect(processObj.off).toHaveBeenCalledWith("warning", expect.any(Function));
  registration.removeHandlers();
});

test("removes every fallback one-shot listener after all events fire", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: log(),
    once: true,
    events: ["warning", "uncaughtException"],
  });
  for (const [, handler] of processObj.on.mock.calls) handler();
  expect(processObj.off).toHaveBeenCalledTimes(2);
  expect(registration.removed).toBe(true);
});

test("removes listeners added after a synchronous abort during setup", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const signal = {
    aborted: false,
    addEventListener: jest.fn((event, listener) => listener()),
    removeEventListener: jest.fn(),
  };
  const registration = registerHandlers({ processObj, log: log(), events: ["warning"], signal });
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledWith("warning", expect.any(Function));
});

test("preserves automatic cleanup failure state after the final one-shot event", () => {
  const processObj = {
    on: jest.fn(),
    off: jest.fn(() => {
      throw Error("cleanup");
    }),
  };
  const registration = registerHandlers({
    processObj,
    log: log(),
    once: true,
    events: ["warning"],
  });
  expect(() => processObj.on.mock.calls[0][1]("warning")).toThrow("cleanup");
  expect(registration.removed).toBe(false);
});
