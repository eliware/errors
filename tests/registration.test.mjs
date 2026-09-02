import { jest } from '@jest/globals';
import registerHandlers from '../index.mjs';

const log = () => ({ debug: jest.fn(), error: jest.fn(), warn: jest.fn() });

test('registers default handlers', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  registerHandlers({ processObj, log: log() });
  expect(processObj.on).toHaveBeenCalledTimes(3);
});

test('falls back to removable on listeners when once is unavailable', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({ processObj, log: log(), once: true, events: ['warning'] });
  processObj.on.mock.calls[0][1]();
  registration.removeHandlers();
  expect(processObj.off).toHaveBeenCalledWith('warning', expect.any(Function));
});

test('handles synchronous one-shot callbacks during registration', () => {
  const processObj = { on: jest.fn(), once: jest.fn((event, handler) => handler()), off: jest.fn() };
  const registration = registerHandlers({ processObj, log: log(), once: true, events: ['warning'] });
  expect(registration.removed).toBe(true);
});

test('is idempotent and supports once listeners', () => {
  const processObj = { on: jest.fn(), once: jest.fn(), off: jest.fn() };
  const first = registerHandlers({ processObj, log: log(), events: ['warning', 'warning'], once: true });
  expect(registerHandlers({ processObj, log: log() })).toBe(first);
  expect(processObj.once).toHaveBeenCalledTimes(1);
  processObj.once.mock.calls[0][1]();
  expect(registerHandlers({ processObj, log: log(), events: ['warning'] })).not.toBe(first);
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
  expect(processObj.off).toHaveBeenCalledTimes(1);
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
