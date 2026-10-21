import { jest } from "@jest/globals";
import { removeAttachedHandlers } from "../../src/cleanup/attached-handlers.mjs";

test("skips selected handlers and records removed events", () => {
  const handler = jest.fn();
  const processObj = { off: jest.fn() };
  const removedEvents = new Set();
  const result = removeAttachedHandlers({
    processObj,
    remove: "off",
    events: ["warning", "uncaughtException"],
    handlers: { warning: handler, uncaughtException: jest.fn() },
    shouldSkip: (event) => event === "uncaughtException",
    markRemoved: (event) => removedEvents.add(event),
  });

  expect(result).toEqual({ removalError: undefined, hasRemovalError: false });
  expect(processObj.off).toHaveBeenCalledTimes(1);
  expect(processObj.off).toHaveBeenCalledWith("warning", handler);
  expect(removedEvents).toEqual(new Set(["warning", "uncaughtException"]));
});

test("attempts all events and returns the first failure", () => {
  const first = Error("first removal");
  const processObj = {
    off: jest
      .fn()
      .mockImplementationOnce(() => {
        throw first;
      })
      .mockImplementationOnce(() => {
        throw Error("second removal");
      }),
  };
  const result = removeAttachedHandlers({
    processObj,
    remove: "off",
    events: ["warning", "uncaughtException"],
    handlers: { warning: jest.fn(), uncaughtException: jest.fn() },
    shouldSkip: () => false,
    markRemoved: jest.fn(),
  });

  expect(result).toEqual({ removalError: first, hasRemovalError: true });
  expect(processObj.off).toHaveBeenCalledTimes(2);
});
