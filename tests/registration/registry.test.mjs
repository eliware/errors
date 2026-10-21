import { createRegistrationRegistry } from "../../src/registration/registry.mjs";

test("stores registrations by process object in weak storage", () => {
  const registry = createRegistrationRegistry();
  const processObj = {};
  const registration = {};

  expect(registry.get(processObj)).toBeUndefined();
  registry.set(processObj, registration);
  expect(registry.get(processObj)).toBe(registration);
  expect(registry.delete(processObj)).toBe(true);
  expect(registry.get(processObj)).toBeUndefined();
});
