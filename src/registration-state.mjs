export function createRegistrationState() {
  let setupComplete = false;
  let cleanupPending = false;
  return {
    registration: { removed: false, ready: false },
    fired: new Set(),
    detachedEvents: new Set(),
    addedEvents: new Set(),
    markSetupComplete() {
      setupComplete = true;
    },
    isSetupComplete() {
      return setupComplete;
    },
    setCleanupPending() {
      cleanupPending = true;
    },
    get cleanupPending() {
      return cleanupPending;
    },
  };
}
