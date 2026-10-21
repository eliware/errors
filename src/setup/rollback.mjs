import { attachFailure } from "../failure.mjs";
import { removeProcessListener } from "../handler-removal.mjs";

export function rollbackRegistration({
  error,
  attachedEvents,
  processObj,
  remove,
  handlers,
  registration,
  registrations,
}) {
  let rollbackError;
  let rollbackFailed = false;
  for (const event of attachedEvents) {
    try {
      removeProcessListener({ processObj, remove, event, handler: handlers[event] });
    } catch (removalError) {
      if (!rollbackFailed) {
        rollbackError = removalError;
        rollbackFailed = true;
      }
    }
  }
  if (rollbackFailed) {
    registration.ready = true;
    registrations.set(processObj, registration);
    attachFailure(error, "rollbackError", rollbackError);
    attachFailure(error, "registration", registration);
  } else registrations.delete(processObj);
  return rollbackError;
}
