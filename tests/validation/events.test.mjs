import { normalizeEvents } from "../../src/validation/events.mjs";

test("uses supported defaults and removes duplicate events", () => {
  expect(normalizeEvents()).toEqual(["uncaughtException", "unhandledRejection", "warning"]);
  expect(normalizeEvents(["warning", "warning"])).toEqual(["warning"]);
});

test("rejects invalid event selections", () => {
  expect(() => normalizeEvents("warning")).toThrow("events must be an array");
  expect(() => normalizeEvents([])).toThrow("at least one");
  expect(() => normalizeEvents(["invalid"])).toThrow("at least one");
  expect(() => normalizeEvents(["warning", "invalid"])).toThrow("Unsupported process event");
});
