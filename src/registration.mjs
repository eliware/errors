import logger from '@eliware/log';
import { defaultEvents } from './constants.mjs';
import { normalizeEvents, validateProcessObject } from './validation.mjs';
import { eventLog } from './logging.mjs';
import { createCleanup } from './cleanup.mjs';

const registrations = new WeakMap();

export function registerHandlers({ processObj = process, log = logger, events, once = false, signal } = {}) {
  const selected = normalizeEvents(events);
  const existing = registrations.get(processObj);
  if (existing) return existing;
  const remove = validateProcessObject(processObj);
  const add = once && typeof processObj.once === 'function' ? 'once' : 'on';
  const oneShot = add === 'once';
  const fired = new Set();
  const registration = { removed: false };
  const handlers = Object.fromEntries(selected.map(event => [event, (...args) => {
    const result = eventLog(log, event, ...args);
    if (oneShot) {
      fired.add(event);
      if (fired.size === selected.length && registration.removeHandlers) {
        registration.removeHandlers();
      }
    }
    return result;
  }]));
  const added = [];
  try {
    for (const event of selected) {
      processObj[add](event, handlers[event]);
      added.push(event);
    }
  } catch (error) {
    for (const event of added) {
      try {
        processObj[remove](event, handlers[event]);
      } catch {
        // Preserve the original registration failure while attempting all rollback removals.
      }
    }
    throw error;
  }
  const cleanup = createCleanup({ processObj, remove, selected, handlers, signal, registrations, registration });
  registration.removeHandlers = cleanup.removeHandlers;
  cleanup.setAbortListener(registration.removeHandlers);
  registrations.set(processObj, registration);
  if (oneShot && fired.size === selected.length) registration.removeHandlers();
  try {
    if (signal) {
      if (typeof signal.addEventListener !== 'function') throw new TypeError('signal must provide addEventListener');
      if (signal.aborted) registration.removeHandlers();
      else signal.addEventListener('abort', registration.removeHandlers, { once: true });
    }
    log.debug('Exception handlers registered');
  } catch (error) {
    let cleanupFailed = false;
    try {
      registration.removeHandlers();
    } catch {
      // Preserve the original setup or logger failure.
      cleanupFailed = true;
    }
    if (cleanupFailed) registrations.set(processObj, registration);
    else registrations.delete(processObj);
    throw error;
  }
  return registration;
}

export { defaultEvents };
