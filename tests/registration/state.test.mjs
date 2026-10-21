import { createRegistrationState } from "../../src/registration/state.mjs";

test("creates empty registration data", () => {
  const state = createRegistrationState();
  expect(state.registration).toEqual({ removed: false, ready: false });
  expect(state.fired.size).toBe(0);
  expect(state.detachedEvents.size).toBe(0);
  expect(state.addedEvents.size).toBe(0);
});
