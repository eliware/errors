import { removeProcessListener } from "./listener.mjs";

export function removeAttachedHandlers({
  processObj,
  remove,
  events,
  handlers,
  shouldSkip,
  markRemoved,
}) {
  let removalError;
  let hasRemovalError = false;
  for (const event of events) {
    if (shouldSkip(event)) {
      markRemoved(event);
      continue;
    }
    try {
      removeProcessListener({ processObj, remove, event, handler: handlers[event] });
      markRemoved(event);
    } catch (error) {
      if (!hasRemovalError) {
        removalError = error;
        hasRemovalError = true;
      }
    }
  }
  return { removalError, hasRemovalError };
}
