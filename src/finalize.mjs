import { attachFailure } from "./failure.mjs";

export function finalizeRegistration({ signal, log, registration, registrations, processObj }) {
  try {
    if (signal && !registration.removed) {
      if (typeof signal.addEventListener !== "function")
        throw new TypeError("signal must provide addEventListener");
      signal.addEventListener("abort", registration.removeHandlers, { once: true });
      if (signal.aborted) registration.removeHandlers();
    }
    log.debug("Handler setup is complete");
  } catch (error) {
    let cleanupFailed = false;
    try {
      registration.removeHandlers();
    } catch (cleanupError) {
      cleanupFailed = true;
      attachFailure(error, "cleanupError", cleanupError);
    }
    if (cleanupFailed) {
      registration.ready = true;
      registrations.set(processObj, registration);
    } else registrations.delete(processObj);
    throw error;
  }
  return registration;
}
