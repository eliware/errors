import { jest } from '@jest/globals';
import registerHandlers from '../index.mjs';

const log = () => ({ debug: jest.fn(), error: jest.fn(), warn: jest.fn() });

test('registers default handlers', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const logger = log();
  const registration = registerHandlers({ processObj, log: logger });
  expect(processObj.on.mock.calls.map(([event]) => event)).toEqual([
    'uncaughtException', 'unhandledRejection', 'warning'
  ]);
  for (const [, handler] of processObj.on.mock.calls) handler(new Error('test'));
  expect(logger.error).toHaveBeenCalledTimes(2);
  expect(logger.warn).toHaveBeenCalledTimes(1);
  registration.removeHandlers();
});

test('uses process and logger defaults when options omit them', () => {
  const registration = registerHandlers();
  expect(registration.removeHandlers).toEqual(expect.any(Function));
  registration.removeHandlers();
});

test('falls back to removable on listeners when once is unavailable', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({ processObj, log: log(), once: true, events: ['warning'] });
  processObj.on.mock.calls[0][1]();
  expect(processObj.off).toHaveBeenCalledWith('warning', expect.any(Function));
  registration.removeHandlers();
});

test('removes every fallback one-shot listener after all events fire', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({ processObj, log: log(), once: true, events: ['warning', 'uncaughtException'] });
  for (const [, handler] of processObj.on.mock.calls) handler();
  expect(processObj.off).toHaveBeenCalledTimes(2);
  expect(registration.removed).toBe(true);
});

test('does not repeat one-shot bookkeeping when logging throws', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const logInstance = { ...log(), error: jest.fn(() => { throw Error('log'); }) };
  const registration = registerHandlers({ processObj, log: logInstance, once: true, events: ['uncaughtException'] });
  const handler = processObj.on.mock.calls[0][1];
  expect(() => handler(Error('first'))).toThrow('log');
  handler(Error('second'));
  expect(logInstance.error).toHaveBeenCalledTimes(1);
  expect(processObj.off).toHaveBeenCalledWith('uncaughtException', handler);
  expect(registration.removed).toBe(true);
});

test('preserves logger error when one-shot cleanup also fails', () => {
  const processObj = { on: jest.fn(), off: jest.fn(() => { throw Error('cleanup'); }) };
  const logInstance = { ...log(), error: jest.fn(() => { throw Error('logger'); }) };
  const registration = registerHandlers({ processObj, log: logInstance, once: true, events: ['uncaughtException'] });
  const handler = processObj.on.mock.calls[0][1];
  let error;
  try { handler(Error('event')); } catch (caught) { error = caught; }
  expect(error).toHaveProperty('message', 'logger');
  expect(error).toHaveProperty('cleanupError.message', 'cleanup');
  expect(registration.removed).toBe(false);
});

test('does not mask primitive or frozen logger failures', () => {
  const processObj = { on: jest.fn(), off: jest.fn(() => { throw Error('cleanup'); }) };
  const frozen = Object.freeze(Error('frozen'));
  const logInstance = { ...log(), warn: jest.fn(() => { throw frozen; }) };
  const registration = registerHandlers({ processObj, log: logInstance, once: true, events: ['warning'] });
  expect(() => processObj.on.mock.calls[0][1]('warning')).toThrow('frozen');
  expect(registration.removed).toBe(false);
});

test('propagates synchronous one-shot logger failures before cleanup exists', () => {
  const processObj = { on: jest.fn(), once: jest.fn((event, handler) => handler()), off: jest.fn() };
  const logInstance = { ...log(), error: jest.fn(() => { throw Error('log'); }) };
  expect(() => registerHandlers({ processObj, log: logInstance, once: true, events: ['uncaughtException'] })).toThrow('log');
});

test('propagates warning and rejection logger failures', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const logInstance = { ...log(), warn: jest.fn(() => { throw Error('warning log'); }), error: jest.fn(() => { throw Error('rejection log'); }) };
  registerHandlers({ processObj, log: logInstance, events: ['warning', 'unhandledRejection'] });
  const handlers = Object.fromEntries(processObj.on.mock.calls.map(([event, handler]) => [event, handler]));
  expect(() => handlers.warning('warning')).toThrow('warning log');
  expect(() => handlers.unhandledRejection('reason')).toThrow('rejection log');
});

test('handles synchronous one-shot callbacks during registration', () => {
  const processObj = { on: jest.fn(), once: jest.fn((event, handler) => handler()), off: jest.fn() };
  const registration = registerHandlers({ processObj, log: log(), once: true, events: ['warning'] });
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledWith('warning', expect.any(Function));
});

test('does not attach a signal listener after synchronous one-shot cleanup', () => {
  const processObj = { on: jest.fn(), once: jest.fn((event, handler) => handler()), off: jest.fn() };
  const signal = { aborted: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  registerHandlers({ processObj, log: log(), once: true, events: ['warning'], signal });
  expect(signal.addEventListener).not.toHaveBeenCalled();
});

test('cleans up all listeners after synchronous multi-event once setup', () => {
  const listeners = new Map();
  const processObj = {
    on: jest.fn(),
    once: jest.fn((event, handler) => { listeners.set(event, handler); handler(); }),
    off: jest.fn((event) => listeners.delete(event))
  };
  const registration = registerHandlers({ processObj, log: log(), once: true, events: ['warning', 'uncaughtException'] });
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledTimes(2);
});

test('logs successful registration after synchronous one-shot cleanup', () => {
  const processObj = { on: jest.fn(), once: jest.fn((event, handler) => handler()), off: jest.fn() };
  const logger = log();
  registerHandlers({ processObj, log: logger, once: true, events: ['warning'] });
  expect(logger.debug).toHaveBeenCalledWith('Exception handlers registered');
});

test('removes listeners added after a synchronous abort during setup', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const signal = { aborted: false, addEventListener: jest.fn((event, listener) => listener()), removeEventListener: jest.fn() };
  const registration = registerHandlers({ processObj, log: log(), events: ['warning'], signal });
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledWith('warning', expect.any(Function));
});

test('preserves automatic cleanup failure state after the final one-shot event', () => {
  const processObj = { on: jest.fn(), off: jest.fn(() => { throw Error('cleanup'); }) };
  const registration = registerHandlers({ processObj, log: log(), once: true, events: ['warning'] });
  expect(() => processObj.on.mock.calls[0][1]('warning')).toThrow('cleanup');
  expect(registration.removed).toBe(false);
});

test('ignores stale handler invocations after explicit cleanup', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const logger = log();
  const registration = registerHandlers({ processObj, log: logger, events: ['warning'] });
  const handler = processObj.on.mock.calls[0][1];
  registration.removeHandlers();
  handler('stale');
  expect(logger.warn).not.toHaveBeenCalled();
});

test('retains setup cleanup failures as secondary diagnostics', () => {
  const signal = { aborted: false, addEventListener: jest.fn(), removeEventListener: jest.fn(() => { throw Error('signal cleanup'); }) };
  const logger = { ...log(), debug: jest.fn(() => { throw Error('debug'); }) };
  let error;
  try { registerHandlers({ processObj: { on: jest.fn(), off: jest.fn() }, log: logger, signal }); } catch (caught) { error = caught; }
  expect(error).toHaveProperty('message', 'debug');
  expect(error).toHaveProperty('cleanupError.message', 'signal cleanup');
});

test('is idempotent and supports once listeners', () => {
  const processObj = { on: jest.fn(), once: jest.fn(), off: jest.fn() };
  const first = registerHandlers({ processObj, log: log(), events: ['warning', 'warning'], once: true });
  const later = registerHandlers({ processObj, log: log(), events: ['warning'], once: false });
  expect(later).toBe(first);
  expect(() => registerHandlers({ processObj, log: log(), signal: {} })).toThrow('signal must provide addEventListener');
  expect(processObj.once).toHaveBeenCalledTimes(1);
  expect(processObj.on).not.toHaveBeenCalled();
  processObj.once.mock.calls[0][1]();
  expect(registerHandlers({ processObj, log: log(), events: ['warning'] })).not.toBe(first);
});

test('validates a later process target before idempotent reuse', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  registerHandlers({ processObj, log: log(), events: ['warning'] });
  expect(() => registerHandlers({ processObj: { on: jest.fn() }, log: log() })).toThrow(
    'processObj must provide an off or removeListener method'
  );
});

test('validates a later signal before idempotent reuse', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  registerHandlers({ processObj, log: log(), events: ['warning'] });
  expect(() => registerHandlers({ processObj, log: log(), signal: {} })).toThrow(
    'signal must provide addEventListener'
  );
});

test('rejects reentrant registration while setup is incomplete', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  processObj.on.mockImplementationOnce(() => registerHandlers({ processObj, log: log() }));
  expect(() => registerHandlers({ processObj, log: log(), events: ['warning'] })).toThrow('still being set up');
});

test('rolls back partial registration and logger failure', () => {
  const processObj = { on: jest.fn().mockImplementationOnce(() => {}).mockImplementationOnce(() => { throw Error('add'); }), off: jest.fn() };
  expect(() => registerHandlers({ processObj, log: log() })).toThrow('add');
  const logger = { ...log(), debug: jest.fn(() => { throw Error('log'); }) };
  expect(() => registerHandlers({ processObj: { on: jest.fn(), off: jest.fn() }, log: logger, events: ['warning'] })).toThrow('log');
});

test('preserves registration errors when rollback removal fails', () => {
  const processObj = {
    on: jest.fn().mockImplementationOnce(() => {}).mockImplementationOnce(() => { throw Error('add'); }),
    off: jest.fn(() => { throw Error('remove'); })
  };
  expect(() => registerHandlers({ processObj, log: log() })).toThrow('add');
  expect(processObj.off).toHaveBeenCalledTimes(2);
});

test('retains failed rollback registrations to prevent orphan duplicates', () => {
  const processObj = {
    on: jest.fn().mockImplementationOnce(() => {}).mockImplementationOnce(() => { throw Error('add'); }),
    off: jest.fn(() => { throw Error('remove'); })
  };
  expect(() => registerHandlers({ processObj, log: log() })).toThrow('add');
  const retry = registerHandlers({ processObj, log: log(), events: ['warning'] });
  expect(retry.removeHandlers).toEqual(expect.any(Function));
  expect(processObj.on).toHaveBeenCalledTimes(2);
});

test('exposes a recovery handle when rollback fails', () => {
  const processObj = {
    on: jest.fn().mockImplementationOnce(() => {}).mockImplementationOnce(() => { throw Error('add'); }),
    off: jest.fn().mockImplementationOnce(() => { throw Error('remove'); }).mockImplementation(() => {})
  };
  let error;
  try { registerHandlers({ processObj, log: log() }); } catch (caught) { error = caught; }
  expect(error.registration).toEqual(expect.objectContaining({ removeHandlers: expect.any(Function) }));
  error.registration.removeHandlers();
  expect(error.registration.removed).toBe(true);
});

test('rolls back when signal setup fails', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  expect(() => registerHandlers({ processObj, log: log(), signal: {} })).toThrow('signal must provide addEventListener');
  expect(processObj.off).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
});

test('preserves logger failures when rollback also fails', () => {
  const processObj = { on: jest.fn(), off: jest.fn(() => { throw Error('remove'); }) };
  const logger = { ...log(), debug: jest.fn(() => { throw Error('logger'); }) };
  expect(() => registerHandlers({ processObj, log: logger, events: ['warning'] })).toThrow('logger');
});

test('preserves primitive logger failures when cleanup also fails', () => {
  const processObj = { on: jest.fn(), off: jest.fn(() => { throw Error('cleanup'); }) };
  const logInstance = { ...log(), warn: jest.fn(() => { throw 'logger'; }) };
  const registration = registerHandlers({ processObj, log: logInstance, once: true, events: ['warning'] });
  expect(() => processObj.on.mock.calls[0][1]('warning')).toThrow('logger');
  expect(registration.removed).toBe(false);
});
