import logger from '@eliware/log';

const registrations = new WeakMap();
const defaultEvents = ['uncaughtException', 'unhandledRejection', 'warning'];

function normalizeEvents(events) {
  if (events === undefined) return defaultEvents;
  if (!Array.isArray(events)) throw new TypeError('events must be an array');
  const allowed = new Set(defaultEvents);
  const requested = [...new Set(events)];
  if (!requested.length) throw new RangeError('events must include at least one supported process event');
  const unsupported = requested.filter(event => !allowed.has(event));
  if (unsupported.length === requested.length) throw new RangeError('events must include at least one supported process event');
  if (unsupported.length) throw new RangeError(`Unsupported process event(s): ${unsupported.join(', ')}`);
  return requested;
}
function eventLog(log, event, ...args) {
  if (event === 'warning') return log.warn('Warning', { warning: args[0] });
  if (event === 'unhandledRejection') return log.error('Unhandled Rejection', { reason: args[0], promise: args[1] });
  return log.error('Uncaught Exception', { error: args[0] });
}

/** Register selected process-level error handlers with idempotent cleanup. */
export const registerHandlers = ({ processObj = process, log = logger, events, once = false, signal } = {}) => {
  const selected = normalizeEvents(events);
  const existing = registrations.get(processObj);
  if (existing) return existing;
  if (typeof processObj.on !== 'function') throw new TypeError('processObj must provide an on method');
  const remove = typeof processObj.off === 'function' ? 'off' : 'removeListener';
  if (typeof processObj[remove] !== 'function') throw new TypeError('processObj must provide an off or removeListener method');
  const handlers = Object.fromEntries(selected.map(event => [event, (...args) => eventLog(log, event, ...args)]));
  const add = once && typeof processObj.once === 'function' ? 'once' : 'on';
  for (const event of selected) processObj[add](event, handlers[event]);
  const registration = { removeHandlers() {
    if (registration.removed) return;
    registration.removed = true;
    for (const event of selected) processObj[remove](event, handlers[event]);
    registrations.delete(processObj);
  }, removed: false };
  registrations.set(processObj, registration);
  if (signal) {
    if (signal.aborted) registration.removeHandlers();
    else signal.addEventListener('abort', registration.removeHandlers, { once: true });
  }
  try {
    log.debug('Exception handlers registered');
  } catch (error) {
    registration.removeHandlers();
    throw error;
  }
  return registration;
};

export default registerHandlers;
