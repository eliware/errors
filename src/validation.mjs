import { defaultEvents } from './constants.mjs';

export function normalizeEvents(events) {
  if (events === undefined) return defaultEvents;
  if (!Array.isArray(events)) throw new TypeError('events must be an array');
  const requested = [...new Set(events)];
  if (!requested.length) throw new RangeError('events must include at least one supported process event');
  const unsupported = requested.filter(event => !defaultEvents.includes(event));
  if (unsupported.length === requested.length) throw new RangeError('events must include at least one supported process event');
  if (unsupported.length) throw new RangeError(`Unsupported process event(s): ${unsupported.join(', ')}`);
  return requested;
}

export function validateProcessObject(processObj) {
  if (typeof processObj.on !== 'function') throw new TypeError('processObj must provide an on method');
  const remove = typeof processObj.off === 'function' ? 'off' : 'removeListener';
  if (typeof processObj[remove] !== 'function') throw new TypeError('processObj must provide an off or removeListener method');
  return remove;
}
