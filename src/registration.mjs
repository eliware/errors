import logger from "@eliware/log";
import { defaultEvents } from "./constants.mjs";
import { normalizeEvents, validateLogger, validateProcessObject } from "./validation.mjs";
import { createCleanup } from "./cleanup.mjs";
import { createEventHandlers } from "./event-handlers.mjs";
import { createRegistrationLifecycle } from "./registration-lifecycle.mjs";
import { createRegistrationState } from "./registration-state.mjs";
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
  const existing = registrations.get(processObj);
  if (existing) {
    if (!existing.ready) throw new Error("registration is still being set up");
    return existing;
  }
  const selected = normalizeEvents(events);
  const remove = validateProcessObject(processObj);
  validateLogger(log);
  const add = once && typeof processObj.once === "function" ? "once" : "on";
  const oneShot = once;
  const state = createRegistrationState();
  const { registration, fired, detachedEvents, addedEvents } = state;
  const handlers = createEventHandlers({ selected, log, oneShot, add, state });
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
    isCleanupPending: () => state.cleanupPending,
    markSetupComplete: state.markSetupComplete,
  });
  return finalizeRegistration({ signal, log, registration, registrations, processObj });
}

export { defaultEvents };
export default registerHandlers;
