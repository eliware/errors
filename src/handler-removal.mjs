import { removeProcessListener } from "./cleanup/listener.mjs";

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
        removeProcessListener({ processObj, remove, event, handler: handlers[event] });
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
