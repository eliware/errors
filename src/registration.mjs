import logger from '@eliware/log';
import { defaultEvents } from './constants.mjs';
import { normalizeEvents, validateLogger, validateProcessObject } from './validation.mjs';
import { eventLog } from './logging.mjs';
import { createCleanup } from './cleanup.mjs';

const registrations = new WeakMap();

function attachFailure(error, key, secondary) {
  if ((typeof error !== 'object' && typeof error !== 'function') || error === null) return;
  try {
    if (Object.isExtensible(error)) error[key] = secondary;
  } catch {
    // Preserve the primary failure when secondary-error reporting is unavailable.
  }
}

export function registerHandlers({ processObj = process, log = logger, events, once = false, signal } = {}) {
  const selected = normalizeEvents(events);
  const remove = validateProcessObject(processObj);
  validateLogger(log);
  const existing = registrations.get(processObj);
  if (existing) {
    if (signal && typeof signal.addEventListener !== 'function') throw new TypeError('signal must provide addEventListener');
    if (!existing.ready) throw new Error('registration is still being set up');
    return existing;
  }
  const add = once && typeof processObj.once === 'function' ? 'once' : 'on';
  const oneShot = once;
  const fired = new Set();
  const detachedEvents = new Set();
  const addedEvents = new Set();
  const attachedEvents = new Set();
  let setupComplete = false;
  let cleanupPending = false;
  const registration = { removed: false, ready: false };
  const handlers = {};
  for (const event of selected) {
    handlers[event] = (...args) => {
      if (registration.removed || fired.has(event)) return undefined;
      try {
        const result = eventLog(log, event, ...args);
        if (oneShot) {
          fired.add(event);
          if (add === 'once' && addedEvents.has(event)) detachedEvents.add(event);
        }
        if (oneShot && fired.size === selected.length) {
          if (setupComplete) registration.removeHandlers();
          else cleanupPending = true;
        }
        return result;
      } catch (error) {
        if (oneShot) {
          fired.add(event);
          if (setupComplete) {
            try { registration.removeHandlers(); } catch (cleanupError) { attachFailure(error, 'cleanupError', cleanupError); }
          } else cleanupPending = true;
        }
        throw error;
      }
    };
  }
  registrations.set(processObj, registration);
  const cleanup = createCleanup({ processObj, remove, selected, handlers, signal, registrations, registration, detachedEvents });
  registration.removeHandlers = cleanup.removeHandlers;
  cleanup.setAbortListener(registration.removeHandlers);
  try {
    for (const event of selected) {
      attachedEvents.add(event);
      processObj[add](event, handlers[event]);
      addedEvents.add(event);
    }
    setupComplete = true;
    if (cleanupPending || (oneShot && fired.size === selected.length)) registration.removeHandlers();
    registration.ready = true;
  } catch (error) {
    let rollbackError;
    for (const event of attachedEvents) {
      try {
        processObj[remove](event, handlers[event]);
      } catch (removalError) {
        rollbackError ??= removalError;
      }
    }
    if (rollbackError) {
      registration.ready = true;
      registrations.set(processObj, registration);
      attachFailure(error, 'rollbackError', rollbackError);
      attachFailure(error, 'registration', registration);
    } else registrations.delete(processObj);
    throw error;
  }
  if (oneShot && fired.size === selected.length) registration.removeHandlers();
  try {
    if (signal && !registration.removed) {
      if (typeof signal.addEventListener !== 'function') throw new TypeError('signal must provide addEventListener');
      signal.addEventListener('abort', registration.removeHandlers, { once: true });
      if (signal.aborted) registration.removeHandlers();
    }
    log.debug('Exception handlers registered');
  } catch (error) {
    let cleanupFailed = false;
    try {
      registration.removeHandlers();
    } catch (cleanupError) {
      // Preserve the original setup or logger failure.
      cleanupFailed = true;
      attachFailure(error, 'cleanupError', cleanupError);
    }
    if (cleanupFailed) {
      registration.ready = true;
      registrations.set(processObj, registration);
    }
    else registrations.delete(processObj);
    throw error;
  }
  return registration;
}

export { defaultEvents };
