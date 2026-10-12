import { jest } from "@jest/globals";
import { rollbackRegistration } from "../src/rollback.mjs";

test("removes attached listeners and clears successful registrations", () => {
  const processObj = { off: jest.fn() };
  const registration = { ready: false };
  const registrations = new WeakMap([[processObj, registration]]);
  const handler = () => {};
  const result = rollbackRegistration({
    error: Error("setup"),
    attachedEvents: new Set(["warning"]),
    processObj,
    remove: "off",
    handlers: { warning: handler },
    registration,
    registrations,
  });
  expect(result).toBeUndefined();
  expect(processObj.off).toHaveBeenCalledWith("warning", handler);
  expect(registrations.has(processObj)).toBe(false);
});

test("retains a registration when listener rollback fails", () => {
  const primary = Error("setup");
  const cleanup = Error("cleanup");
  const processObj = {
    off: jest.fn(() => {
      throw cleanup;
    }),
  };
  const registration = { ready: false };
  const registrations = new WeakMap([[processObj, registration]]);
  const result = rollbackRegistration({
    error: primary,
    attachedEvents: new Set(["warning"]),
    processObj,
    remove: "off",
    handlers: { warning: () => {} },
    registration,
    registrations,
  });
  expect(result).toBe(cleanup);
  expect(primary.rollbackError).toBe(cleanup);
  expect(primary.registration).toBe(registration);
  expect(registration.ready).toBe(true);
  expect(registrations.get(processObj)).toBe(registration);
});
