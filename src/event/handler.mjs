import { eventLog } from "../logging.mjs";

export function createEventHandler({
  event,
  log,
  oneShot,
  fired,
  detachedEvents,
  addedEvents,
  add,
  selected,
  registration,
  isSetupComplete,
  setCleanupPending,
  attachFailure,
}) {
  return (...args) => {
    if (registration.removed || fired.has(event)) return undefined;
    try {
      const result = eventLog(log, event, ...args);
      if (oneShot) {
        fired.add(event);
        if (add === "once" && addedEvents.has(event)) detachedEvents.add(event);
      }
      if (oneShot && fired.size === selected.length) {
        if (isSetupComplete()) registration.removeHandlers();
        else setCleanupPending();
      }
      return result;
    } catch (error) {
      if (oneShot) {
        fired.add(event);
        if (isSetupComplete()) {
          try {
            registration.removeHandlers();
          } catch (cleanupError) {
            attachFailure(error, "cleanupError", cleanupError);
          }
        } else setCleanupPending();
      }
      throw error;
    }
  };
}
