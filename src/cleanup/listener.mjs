export function removeProcessListener({ processObj, remove, event, handler }) {
  const result = processObj[remove](event, handler);
  if (result === false) throw new Error(`processObj rejected removal for ${event}`);
  if (typeof processObj.listeners === "function") {
    const listeners = processObj.listeners(event);
    if (!Array.isArray(listeners)) throw new TypeError("processObj.listeners must return an array");
    if (listeners.includes(handler))
      throw new Error(`processObj did not remove listener for ${event}`);
  }
}
