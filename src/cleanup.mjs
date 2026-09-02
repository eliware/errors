export function createCleanup({ processObj, remove, selected, handlers, signal, registrations, registration }) {
  let abortListener;
  const removeHandlers = () => {
    if (registration.removed) return;
    registration.removed = true;
    let removalError;
    for (const event of selected) {
      try {
        processObj[remove](event, handlers[event]);
      } catch (error) {
        removalError ??= error;
      }
    }
    if (removalError) {
      registration.removed = false;
      throw removalError;
    }
    let abortError;
    if (abortListener && typeof signal?.removeEventListener === 'function') {
      try {
        signal.removeEventListener('abort', abortListener);
      } catch (error) {
        abortError = error;
      }
    }
    registrations.delete(processObj);
    if (abortError) throw abortError;
  };
  abortListener = removeHandlers;
  return { removeHandlers, setAbortListener: listener => { abortListener = listener; } };
}
