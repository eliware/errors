export function createRegistrationLifecycle() {
  const registrations = new WeakMap();
  return {
    get(processObj) {
      return registrations.get(processObj);
    },
    set(processObj, registration) {
      registrations.set(processObj, registration);
    },
    delete(processObj) {
      return registrations.delete(processObj);
    },
  };
}
