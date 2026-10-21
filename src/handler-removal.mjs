export function createHandlerRemoval({ processObj, remove, selected, handlers, detachedEvents }) {
  const removedEvents = new Set();
  return () => {
    let removalError;
    let hasRemovalError = false;
    for (const event of selected) {
      if (removedEvents.has(event)) continue;
      if (detachedEvents.has(event)) {
        removedEvents.add(event);
        continue;
      }
      try {
        const result = processObj[remove](event, handlers[event]);
        if (result === false) throw new Error(`processObj rejected removal for ${event}`);
        removedEvents.add(event);
      } catch (error) {
        if (!hasRemovalError) {
          removalError = error;
          hasRemovalError = true;
        }
      }
    }
    if (hasRemovalError) throw removalError;
  };
}
