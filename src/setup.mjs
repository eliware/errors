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
  isCleanupPending,
  markSetupComplete,
}) {
  const attachedEvents = new Set();
  try {
    for (const event of selected) {
      let added;
      try {
        added = processObj[add](event, handlers[event]);
      } catch (error) {
        attachedEvents.add(event);
        throw error;
      }
      if (added === false) throw new Error(`processObj rejected listener for ${event}`);
      addedEvents.add(event);
      attachedEvents.add(event);
    }
    markSetupComplete();
    if (isCleanupPending() || (oneShot && fired.size === selected.length))
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
