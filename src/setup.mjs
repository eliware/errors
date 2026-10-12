import { rollbackRegistration } from "./rollback.mjs";

export function installHandlers({
  processObj,
  add,
  remove,
  selected,
  handlers,
  addedEvents,
  registration,
  registrations,
  fired,
  oneShot,
  cleanupPending,
  markSetupComplete,
}) {
  const attachedEvents = new Set();
  try {
    for (const event of selected) {
      attachedEvents.add(event);
      processObj[add](event, handlers[event]);
      addedEvents.add(event);
    }
    markSetupComplete();
    if (cleanupPending || (oneShot && fired.size === selected.length))
      registration.removeHandlers();
    registration.ready = true;
  } catch (error) {
    rollbackRegistration({
      error,
      attachedEvents,
      processObj,
      remove,
      handlers,
      registration,
      registrations,
    });
    throw error;
  }
  if (oneShot && fired.size === selected.length) registration.removeHandlers();
}
