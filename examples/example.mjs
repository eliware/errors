import { registerHandlers } from "@eliware/errors";

const listeners = new Map();
const processObj = {
  on(event, listener) {
    listeners.set(event, listener);
  },
  off(event) {
    listeners.delete(event);
  },
};
const log = {
  error(message) {
    console.error(message);
  },
  warn(message) {
    console.warn(message);
  },
  debug(message) {
    console.log(message);
  },
};
const registration = registerHandlers({ processObj, log, events: ["warning"] });
listeners.get("warning")("example warning");
registration.removeHandlers();
