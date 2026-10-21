export function createRegistrationState() {
  return {
    registration: { removed: false, ready: false },
    fired: new Set(),
    detachedEvents: new Set(),
    addedEvents: new Set(),
  };
}
