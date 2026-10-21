import { createHandlerRemoval } from "./handler-removal.mjs";
import { finalizeCleanup } from "./cleanup/finalize.mjs";

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
  const removeHandlersFromProcess = createHandlerRemoval({
    processObj,
    remove,
    selected,
    handlers,
    detachedEvents,
  });
  const removeHandlers = () => {
    if (registration.removed) return;
    registration.removed = true;
    try {
      removeHandlersFromProcess();
      finalizeCleanup({ signal, abortListener: removeHandlers, registrations, processObj });
    } catch (error) {
      registration.removed = false;
      throw error;
    }
  };
  return { removeHandlers };
}
