import { jest } from "@jest/globals";
import {
  validateLogger,
  validateProcessObject,
  validateSignal,
} from "../../src/validation/options.mjs";

test("validates process object methods and selects its removal method", () => {
  expect(validateProcessObject({ on: jest.fn(), off: jest.fn() })).toBe("off");
  expect(validateProcessObject({ on: jest.fn(), removeListener: jest.fn() })).toBe(
    "removeListener",
  );
  expect(() => validateProcessObject({})).toThrow("on method");
  expect(() => validateProcessObject({ on: jest.fn() })).toThrow("off or removeListener");
});

test("validates logger and signal methods", () => {
  const logger = { error: jest.fn(), warn: jest.fn(), debug: jest.fn() };
  expect(validateLogger(logger)).toBeUndefined();
  expect(() => validateLogger({})).toThrow("logger must provide the error method");
  expect(() => validateLogger({ error: jest.fn() })).toThrow("logger must provide the warn method");
  expect(() => validateLogger({ error: jest.fn(), warn: jest.fn() })).toThrow(
    "logger must provide the debug method",
  );
  expect(validateSignal(undefined)).toBeUndefined();
  expect(validateSignal({ addEventListener: jest.fn() })).toBeUndefined();
  expect(() => validateSignal({})).toThrow("signal must provide addEventListener");
});
