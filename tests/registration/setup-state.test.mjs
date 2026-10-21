import { createRegistrationSetupState } from "../../src/registration/setup-state.mjs";

test("tracks setup completion and pending cleanup", () => {
  const state = createRegistrationSetupState();

  expect(state.isSetupComplete()).toBe(false);
  expect(state.isCleanupPending()).toBe(false);

  state.markSetupComplete();
  state.setCleanupPending();

  expect(state.isSetupComplete()).toBe(true);
  expect(state.isCleanupPending()).toBe(true);
});
