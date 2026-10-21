export function validateProcessObject(processObj) {
  if (typeof processObj.on !== "function")
    throw new TypeError("processObj must provide an on method");
  const remove = typeof processObj.off === "function" ? "off" : "removeListener";
  if (typeof processObj[remove] !== "function")
    throw new TypeError("processObj must provide an off or removeListener method");
  return remove;
}
