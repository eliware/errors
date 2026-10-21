export function createRegistrationSetupState() {
  let setupComplete = false;
  let cleanupPending = false;
  return {
    markSetupComplete() {
      setupComplete = true;
    },
    isSetupComplete() {
      return setupComplete;
    },
    setCleanupPending() {
      cleanupPending = true;
    },
    isCleanupPending() {
      return cleanupPending;
    },
  };
}
