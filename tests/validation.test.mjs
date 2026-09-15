import { jest } from '@jest/globals';
import registerHandlers from '../index.mjs';

test('validates event selections and process-like objects', () => {
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  expect(() => registerHandlers({ processObj: {}, log })).toThrow('on method');
  expect(() => registerHandlers({ processObj: { on: jest.fn() }, log })).toThrow('off or removeListener');
  expect(() => registerHandlers({ processObj: { on: jest.fn(), off: jest.fn() }, log, events: [] })).toThrow('at least one');
  expect(() => registerHandlers({ processObj: { on: jest.fn(), off: jest.fn() }, log, events: 'warning' })).toThrow('events must be an array');
  expect(() => registerHandlers({ processObj: { on: jest.fn(), off: jest.fn() }, log, events: ['invalid'] })).toThrow('at least one');
  expect(() => registerHandlers({ processObj: { on: jest.fn(), off: jest.fn() }, log, events: ['warning', 'invalid'] })).toThrow('Unsupported process event');
});

test('rejects malformed loggers during registration', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  expect(() => registerHandlers({ processObj, log: {} })).toThrow('log must provide a error method');
  expect(() => registerHandlers({ processObj, log: { error: jest.fn() } })).toThrow('log must provide a warn method');
  expect(() => registerHandlers({ processObj, log: { error: jest.fn(), warn: jest.fn() } })).toThrow('log must provide a debug method');
});
