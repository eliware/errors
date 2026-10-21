export function handleOneShotEvent({
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
}) {
  try {
    const result = invoke();
    fired.add(event);
    if (add === "once" && addedEvents.has(event)) detachedEvents.add(event);
    if (fired.size === selected.length) {
      if (isSetupComplete()) registration.removeHandlers();
      else setCleanupPending();
    }
    return result;
  } catch (error) {
    fired.add(event);
    if (isSetupComplete()) {
      try {
        registration.removeHandlers();
      } catch (cleanupError) {
        attachFailure(error, "cleanupError", cleanupError);
      }
    } else setCleanupPending();
    throw error;
  }
}
