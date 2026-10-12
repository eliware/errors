import { createRegistrationState } from "../src/registration-state.mjs";

test("creates empty state and records setup completion", () => {
  const state = createRegistrationState();
  expect(state.registration).toEqual({ removed: false, ready: false });
  expect(state.fired.size).toBe(0);
  expect(state.detachedEvents.size).toBe(0);
  expect(state.addedEvents.size).toBe(0);
  expect(state.cleanupPending).toBe(false);
  expect(state.isSetupComplete()).toBe(false);
  state.markSetupComplete();
  state.setCleanupPending();
  expect(state.isSetupComplete()).toBe(true);
  expect(state.cleanupPending).toBe(true);
});
