export function validateLogger(log) {
  for (const method of ["error", "warn", "debug"]) {
    if (!log || typeof log[method] !== "function")
      throw new TypeError(`logger must provide the ${method} method`);
  }
}

export function validateSignal(signal) {
  if (signal && typeof signal.addEventListener !== "function")
    throw new TypeError("signal must provide addEventListener");
}
