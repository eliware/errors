import { registerHandlers } from "@eliware/errors";

const listeners = new Map();
const processObj = {
  on(event, listener) {
    const eventListeners = listeners.get(event) ?? new Set();
    eventListeners.add(listener);
    listeners.set(event, eventListeners);
  },
  off(event, listener) {
    listeners.get(event)?.delete(listener);
  },
  listeners(event) {
    return [...(listeners.get(event) ?? [])];
  },
};
const log = {
  error(message, metadata) {
    console.error(message, metadata);
  },
  warn(message, metadata) {
    console.warn(message, metadata);
  },
  debug(message) {
    console.log(message);
  },
};
const registration = registerHandlers({ processObj, log, events: ["warning"] });
for (const listener of listeners.get("warning") ?? []) listener("example warning");
registration.removeHandlers();
