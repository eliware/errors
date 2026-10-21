import { removeAttachedHandlers } from "./cleanup/attached-handlers.mjs";

export function createHandlerRemoval({ processObj, remove, selected, handlers, detachedEvents }) {
  const removedEvents = new Set();
  return () => {
    const { removalError, hasRemovalError } = removeAttachedHandlers({
      processObj,
      remove,
      events: selected,
      handlers,
      shouldSkip: (event) => removedEvents.has(event) || detachedEvents.has(event),
      markRemoved: (event) => removedEvents.add(event),
    });
    if (hasRemovalError) throw removalError;
  };
}
