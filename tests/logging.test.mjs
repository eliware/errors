import { jest } from "@jest/globals";
import registerHandlers from "../src/registration.mjs";
import { eventLog } from "../src/logging.mjs";

test("logs each supported event through its matching method", () => {
  const log = { error: jest.fn(), warn: jest.fn() };
  eventLog(log, "warning", "warning");
  eventLog(log, "unhandledRejection", "reason");
  eventLog(log, "uncaughtException", "failure");
  expect(log.warn).toHaveBeenCalledWith("Warning", { warning: { type: "string" } });
  expect(log.error).toHaveBeenNthCalledWith(1, "Unhandled Rejection", { reasonType: "string" });
  expect(log.error).toHaveBeenNthCalledWith(2, "Uncaught Exception", { error: { type: "string" } });
});

test("routes warning and rejection events to the logger", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  registerHandlers({ processObj, log, events: ["warning", "unhandledRejection"] });
  const handlers = Object.fromEntries(
    processObj.on.mock.calls.map(([event, handler]) => [event, handler]),
  );
  handlers.warning("warning");
  handlers.unhandledRejection("reason", "promise");
  expect(log.warn).toHaveBeenCalledWith("Warning", { warning: { type: "string" } });
  expect(log.error).toHaveBeenCalledWith("Unhandled Rejection", { reasonType: "string" });
});

test("logs uncaught exceptions", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  registerHandlers({ processObj, log, events: ["uncaughtException"] });
  const error = Error("boom");
  processObj.on.mock.calls[0][1](error);
  expect(log.error).toHaveBeenCalledWith("Uncaught Exception", {
    error: { name: "Error", type: "Error" },
  });
});

test("uses a stable fallback for unusual Error constructors", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  registerHandlers({ processObj, log, events: ["uncaughtException"] });
  const error = Object.create(Error.prototype);
  error.constructor = { name: 42 };
  processObj.on.mock.calls[0][1](error);
  expect(log.error).toHaveBeenCalledWith("Uncaught Exception", {
    error: { name: "Error", type: "Error" },
  });
});
