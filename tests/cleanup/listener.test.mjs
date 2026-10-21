import { jest } from "@jest/globals";
import { removeProcessListener } from "../../src/cleanup/listener.mjs";

test("removes the selected process listener", () => {
  const handler = jest.fn();
  const processObj = { off: jest.fn() };

  removeProcessListener({ processObj, remove: "off", event: "warning", handler });

  expect(processObj.off).toHaveBeenCalledWith("warning", handler);
});

test("rejects removals that return false", () => {
  const processObj = { off: jest.fn(() => false) };

  expect(() =>
    removeProcessListener({ processObj, remove: "off", event: "warning", handler: jest.fn() }),
  ).toThrow("processObj rejected removal for warning");
});

test("rejects removals that leave the listener attached", () => {
  const handler = jest.fn();
  const processObj = { off: jest.fn(), listeners: jest.fn(() => [handler]) };

  expect(() =>
    removeProcessListener({ processObj, remove: "off", event: "warning", handler }),
  ).toThrow("processObj did not remove listener for warning");
});

test("accepts removals after listener inspection confirms detachment", () => {
  const processObj = { off: jest.fn(), listeners: jest.fn(() => []) };

  expect(
    removeProcessListener({ processObj, remove: "off", event: "warning", handler: jest.fn() }),
  ).toBeUndefined();
});

test("rejects invalid listener inspection results", () => {
  const processObj = { off: jest.fn(), listeners: jest.fn(() => undefined) };

  expect(() =>
    removeProcessListener({ processObj, remove: "off", event: "warning", handler: jest.fn() }),
  ).toThrow("processObj.listeners must return an array");
});
