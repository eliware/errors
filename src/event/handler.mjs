import { eventLog } from "../logging.mjs";
import { handleOneShotEvent } from "./one-shot.mjs";

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
    const invoke = () => eventLog(log, event, ...args);
    if (!oneShot) return invoke();
    return handleOneShotEvent({
      event,
      invoke,
      fired,
      detachedEvents,
      addedEvents,
      add,
      selected,
      registration,
      isSetupComplete,
      setCleanupPending,
      attachFailure,
    });
  };
}
