export function createCleanup({
  processObj,
  remove,
  selected,
  handlers,
  signal,
  registrations,
  registration,
  detachedEvents,
}) {
  let abortListener;
  const removedEvents = new Set();
  const removeHandlers = () => {
    if (registration.removed) return;
    registration.removed = true;
    let removalError;
    for (const event of selected) {
      if (removedEvents.has(event)) continue;
      if (detachedEvents.has(event)) {
        removedEvents.add(event);
        continue;
      }
      try {
        processObj[remove](event, handlers[event]);
        removedEvents.add(event);
      } catch (error) {
        removalError ??= error;
      }
    }
    if (removalError) {
      registration.removed = false;
      throw removalError;
    }
    let abortError;
    if (abortListener && typeof signal?.removeEventListener === "function") {
      try {
        signal.removeEventListener("abort", abortListener);
      } catch (error) {
        abortError = error;
      }
    }
    if (abortError) {
      registration.removed = false;
      registrations.set(processObj, registration);
      throw abortError;
    }
    registrations.delete(processObj);
  };
  abortListener = removeHandlers;
  return {
    removeHandlers,
    setAbortListener: (listener) => {
      abortListener = listener;
    },
  };
}
