import { attachFailure } from "./failure.mjs";
import { createEventHandler } from "./event/handler.mjs";

export function createEventHandlers({ selected, log, oneShot, add, state, setupState }) {
  const handlers = {};
  for (const event of selected) {
    handlers[event] = createEventHandler({
      event,
      log,
      oneShot,
      fired: state.fired,
      detachedEvents: state.detachedEvents,
      addedEvents: state.addedEvents,
      add,
      selected,
      registration: state.registration,
      isSetupComplete: setupState.isSetupComplete,
      setCleanupPending: setupState.setCleanupPending,
      attachFailure,
    });
  }
  return handlers;
}
