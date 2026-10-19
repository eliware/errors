import { jest } from "@jest/globals";
import { createHandlerRemoval } from "../src/handler-removal.mjs";

test("removes selected handlers and skips handlers that already detached", () => {
  const handler = jest.fn();
  const processObj = { off: jest.fn() };
  const removeHandlers = createHandlerRemoval({
    processObj,
    remove: "off",
    selected: ["warning", "uncaughtException"],
    handlers: { warning: handler, uncaughtException: jest.fn() },
    detachedEvents: new Set(["uncaughtException"]),
  });
  removeHandlers();
  expect(processObj.off).toHaveBeenCalledTimes(1);
  expect(processObj.off).toHaveBeenCalledWith("warning", handler);
});

test("retries failed removals and skips successful removals", () => {
  const processObj = {
    off: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw Error("remove");
      }),
  };
  const removeHandlers = createHandlerRemoval({
    processObj,
    remove: "off",
    selected: ["warning", "uncaughtException"],
    handlers: { warning: jest.fn(), uncaughtException: jest.fn() },
    detachedEvents: new Set(),
  });
  expect(removeHandlers).toThrow("remove");
  removeHandlers();
  expect(processObj.off).toHaveBeenCalledTimes(3);
});

test("retries removals that throw undefined", () => {
  const processObj = {
    off: jest.fn().mockImplementationOnce(() => {
      throw undefined;
    }),
  };
  const removeHandlers = createHandlerRemoval({
    processObj,
    remove: "off",
    selected: ["warning"],
    handlers: { warning: jest.fn() },
    detachedEvents: new Set(),
  });
  let didThrow = false;
  try {
    removeHandlers();
  } catch (error) {
    didThrow = true;
    expect(error).toBeUndefined();
  }
  expect(didThrow).toBe(true);
  removeHandlers();
  expect(processObj.off).toHaveBeenCalledTimes(2);
});

test("throws the first error after it attempts every removal", () => {
  const processObj = {
    off: jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error("first");
      })
      .mockImplementationOnce(() => {
        throw Error("second");
      }),
  };
  const removeHandlers = createHandlerRemoval({
    processObj,
    remove: "off",
    selected: ["warning", "uncaughtException"],
    handlers: { warning: jest.fn(), uncaughtException: jest.fn() },
    detachedEvents: new Set(),
  });
  expect(removeHandlers).toThrow("first");
  expect(processObj.off).toHaveBeenCalledTimes(2);
});
