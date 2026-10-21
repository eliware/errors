import { attachFailure } from "../failure.mjs";
import { removeAttachedHandlers } from "../cleanup/attached-handlers.mjs";

export function rollbackRegistration({
  error,
  attachedEvents,
  processObj,
  remove,
  handlers,
  registration,
  registrations,
}) {
  const { removalError: rollbackError, hasRemovalError: rollbackFailed } = removeAttachedHandlers({
    processObj,
    remove,
    events: attachedEvents,
    handlers,
    shouldSkip: () => false,
    markRemoved: () => {},
  });
  if (rollbackFailed) {
    registration.ready = true;
    registrations.set(processObj, registration);
    attachFailure(error, "rollbackError", rollbackError);
    attachFailure(error, "registration", registration);
  } else registrations.delete(processObj);
  return rollbackError;
}
