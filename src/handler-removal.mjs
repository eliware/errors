export function createHandlerRemoval({ processObj, remove, selected, handlers, detachedEvents }) {
  const removedEvents = new Set();
  return () => {
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
    if (removalError) throw removalError;
  };
}
