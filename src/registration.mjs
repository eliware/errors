import logger from "@eliware/log";
import { defaultEvents } from "./constants.mjs";
import { normalizeEvents, validateLogger, validateProcessObject } from "./validation.mjs";
import { createCleanup } from "./cleanup.mjs";
import { createEventHandler } from "./event-handler.mjs";
import { attachFailure } from "./failure.mjs";
import { createRegistrationLifecycle } from "./registration-lifecycle.mjs";
import { installHandlers } from "./setup.mjs";
import { finalizeRegistration } from "./finalize.mjs";

const registrations = createRegistrationLifecycle();

export function registerHandlers({
  processObj = process,
  log = logger,
  events,
  once = false,
  signal,
} = {}) {
  const selected = normalizeEvents(events);
  const remove = validateProcessObject(processObj);
  validateLogger(log);
  const existing = registrations.get(processObj);
  if (existing) {
    if (signal && typeof signal.addEventListener !== "function")
      throw new TypeError("signal must provide addEventListener");
    if (!existing.ready) throw new Error("registration is still being set up");
    return existing;
  }
  const add = once && typeof processObj.once === "function" ? "once" : "on";
  const oneShot = once;
  const fired = new Set();
  const detachedEvents = new Set();
  const addedEvents = new Set();
  let setupComplete = false;
  let cleanupPending = false;
  const registration = { removed: false, ready: false };
  const handlers = {};
  for (const event of selected) {
    handlers[event] = createEventHandler({
      event,
      log,
      oneShot,
      fired,
      detachedEvents,
      addedEvents,
      add,
      selected,
      registration,
      isSetupComplete: () => setupComplete,
      setCleanupPending: () => {
        cleanupPending = true;
      },
      attachFailure,
    });
  }
  registrations.set(processObj, registration);
  const cleanup = createCleanup({
    processObj,
    remove,
    selected,
    handlers,
    signal,
    registrations,
    registration,
    detachedEvents,
  });
  registration.removeHandlers = cleanup.removeHandlers;
  cleanup.setAbortListener(registration.removeHandlers);
  installHandlers({
    processObj,
    add,
    remove,
    selected,
    handlers,
    addedEvents,
    registration,
    registrations,
    fired,
    oneShot,
    cleanupPending,
    markSetupComplete: () => {
      setupComplete = true;
    },
  });
  return finalizeRegistration({ signal, log, registration, registrations, processObj });
}

export { defaultEvents };
export default registerHandlers;
