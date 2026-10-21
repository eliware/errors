import { jest } from "@jest/globals";
import { validateProcessObject } from "../../src/validation/process-object.mjs";
import registerHandlers from "../../src/registration.mjs";

test("selects off when the process object provides it", () => {
  expect(validateProcessObject({ on: jest.fn(), off: jest.fn() })).toBe("off");
});

test("selects removeListener when off is unavailable", () => {
  expect(validateProcessObject({ on: jest.fn(), removeListener: jest.fn() })).toBe(
    "removeListener",
  );
});

test("requires process object event methods", () => {
  expect(() => validateProcessObject({})).toThrow("on method");
  expect(() => validateProcessObject({ on: jest.fn() })).toThrow("off or removeListener");
});

test("supports removeListener for handler cleanup", () => {
  const processObj = { on: jest.fn(), removeListener: jest.fn() };
  const registration = registerHandlers({
    processObj,
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    events: ["warning"],
  });

  registration.removeHandlers();

  expect(processObj.removeListener).toHaveBeenCalledWith("warning", expect.any(Function));
});
