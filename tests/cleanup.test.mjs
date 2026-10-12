import { jest } from "@jest/globals";
import { createCleanup } from "../src/cleanup.mjs";
import registerHandlers from "../src/registration.mjs";

test("removes handlers, detaches the abort listener, and clears the registry", () => {
  const handler = jest.fn();
  const processObj = { off: jest.fn() };
  const registration = { removed: false };
  const registrations = new WeakMap([[processObj, registration]]);
  const signal = { removeEventListener: jest.fn() };
  const cleanup = createCleanup({
    processObj,
    remove: "off",
    selected: ["warning"],
    handlers: { warning: handler },
    signal,
    registrations,
    registration,
    detachedEvents: new Set(),
  });
  registration.removeHandlers = cleanup.removeHandlers;
  cleanup.removeHandlers();
  expect(processObj.off).toHaveBeenCalledWith("warning", handler);
  expect(signal.removeEventListener).toHaveBeenCalledWith("abort", cleanup.removeHandlers);
  expect(registrations.has(processObj)).toBe(false);
});

test("cleans up selected handlers through AbortSignal", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const controller = new AbortController();
  const registration = registerHandlers({
    processObj,
    log,
    events: ["warning"],
    signal: controller.signal,
  });
  controller.abort();
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledWith("warning", expect.any(Function));
});

test("supports removeListener cleanup", () => {
  const processObj = { on: jest.fn(), removeListener: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    events: ["warning"],
  });
  registration.removeHandlers();
  expect(processObj.removeListener).toHaveBeenCalledWith("warning", expect.any(Function));
});

test("removes abort listeners and attempts every removal", () => {
  const controller = new AbortController();
  const processObj = { on: jest.fn(), off: jest.fn() };
  const remove = jest.spyOn(controller.signal, "removeEventListener");
  const registration = registerHandlers({
    processObj,
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    signal: controller.signal,
  });
  registration.removeHandlers();
  expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
  const failing = {
    on: jest.fn(),
    off: jest.fn().mockImplementationOnce(() => {
      throw Error("remove");
    }),
  };
  const failed = registerHandlers({
    processObj: failing,
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
  });
  expect(() => failed.removeHandlers()).toThrow("remove");
  expect(failing.off).toHaveBeenCalledTimes(3);
  failed.removeHandlers();
  expect(failing.off).toHaveBeenCalledTimes(4);
});

test("reports abort-listener removal failures after handler cleanup", () => {
  const signal = {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(() => {
      throw Error("abort remove");
    }),
  };
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    signal,
    events: ["warning"],
  });
  expect(() => registration.removeHandlers()).toThrow("abort remove");
  expect(registration.removed).toBe(false);
});

test("retries abort-listener removal after handler cleanup succeeds", () => {
  const signal = {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error("abort remove");
      })
      .mockImplementation(() => {}),
  };
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    signal,
    events: ["warning"],
  });
  expect(() => registration.removeHandlers()).toThrow("abort remove");
  expect(registration.removed).toBe(false);
  expect(processObj.off).toHaveBeenCalledTimes(1);

  registration.removeHandlers();
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledTimes(1);
  expect(signal.removeEventListener).toHaveBeenCalledTimes(2);
});

test("cleans up immediately when the signal is already aborted", () => {
  const controller = new AbortController();
  controller.abort();
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    signal: controller.signal,
  });
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledWith("uncaughtException", expect.any(Function));
});

test("ignores repeated cleanup calls", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    events: ["warning"],
  });
  registration.removeHandlers();
  registration.removeHandlers();
  expect(processObj.off).toHaveBeenCalledTimes(1);
});
