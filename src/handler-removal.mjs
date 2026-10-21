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
        if (typeof processObj.listeners === "function") {
          const listeners = processObj.listeners(event);
          if (!Array.isArray(listeners))
            throw new TypeError("processObj.listeners must return an array");
          if (listeners.includes(handlers[event]))
            throw new Error(`processObj did not remove listener for ${event}`);
        }
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
