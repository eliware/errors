import { jest } from "@jest/globals";
import { installWithRollback } from "../../src/setup/installation.mjs";

test("marks the registration ready after handler installation", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = { ready: false, removeHandlers: jest.fn() };
  const options = {
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
  };

  installWithRollback(options);

  expect(options.markSetupComplete).toHaveBeenCalledTimes(1);
  expect(options.addedEvents.has("warning")).toBe(true);
  expect(registration.ready).toBe(true);
});
