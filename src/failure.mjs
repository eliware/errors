export function attachFailure(error, key, secondary) {
  if ((typeof error !== "object" && typeof error !== "function") || error === null) return;
  try {
    if (Object.isExtensible(error)) error[key] = secondary;
  } catch {
    // Preserve the primary failure when secondary-error reporting is unavailable.
  }
}
