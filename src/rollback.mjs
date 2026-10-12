import { attachFailure } from "./failure.mjs";

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
  for (const event of attachedEvents) {
    try {
      processObj[remove](event, handlers[event]);
    } catch (removalError) {
      rollbackError ??= removalError;
    }
  }
  if (rollbackError) {
    registration.ready = true;
    registrations.set(processObj, registration);
    attachFailure(error, "rollbackError", rollbackError);
    attachFailure(error, "registration", registration);
  } else registrations.delete(processObj);
  return rollbackError;
}
