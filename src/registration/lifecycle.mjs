import { createRegistrationRegistry } from "./registry.mjs";

export function createRegistrationLifecycle() {
  const registrations = createRegistrationRegistry();
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
