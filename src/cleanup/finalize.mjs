export function finalizeCleanup({ signal, abortListener, registrations, processObj }) {
  if (abortListener && typeof signal?.removeEventListener === "function")
    signal.removeEventListener("abort", abortListener);
  registrations.delete(processObj);
}
