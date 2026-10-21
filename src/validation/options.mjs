export function validateProcessObject(processObj) {
  if (typeof processObj.on !== "function")
    throw new TypeError("processObj must provide an on method");
  const remove = typeof processObj.off === "function" ? "off" : "removeListener";
  if (typeof processObj[remove] !== "function")
    throw new TypeError("processObj must provide an off or removeListener method");
  return remove;
}

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
