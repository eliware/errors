import { jest } from '@jest/globals';
import registerHandlers, { registerHandlers as namedRegisterHandlers } from './index.mjs';

const makeProcess = () => ({
  on: jest.fn(),
  off: jest.fn()
});
const makeLogger = () => ({
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
});

describe('registerHandlers', () => {
  test('registers all handlers and logs registration', () => {
    const processObj = makeProcess();
    const log = makeLogger();
    const result = namedRegisterHandlers({ processObj, log });

    expect(processObj.on).toHaveBeenCalledTimes(3);
    expect(processObj.on.mock.calls.map(([event]) => event)).toEqual([
      'uncaughtException', 'unhandledRejection', 'warning'
    ]);
    expect(log.debug).toHaveBeenCalledWith('Exception handlers registered');
    expect(result.removeHandlers).toEqual(expect.any(Function));
  });

  test('logs each process event', () => {
    const processObj = makeProcess();
    const log = makeLogger();
    namedRegisterHandlers({ processObj, log });
    const handlers = Object.fromEntries(processObj.on.mock.calls.map(([event, handler]) => [event, handler]));
    const error = new Error('boom');
    const promise = Promise.resolve();
    const warning = { name: 'Warning', message: 'notice' };

    handlers.uncaughtException(error);
    handlers.unhandledRejection('reason', promise);
    handlers.warning(warning);

    expect(log.error).toHaveBeenNthCalledWith(1, 'Uncaught Exception', { error });
    expect(log.error).toHaveBeenNthCalledWith(2, 'Unhandled Rejection', { reason: 'reason', promise });
    expect(log.warn).toHaveBeenCalledWith('Warning', { warning });
  });

  test('removes all handlers', () => {
    const processObj = makeProcess();
    const log = makeLogger();
    const { removeHandlers } = registerHandlers({ processObj, log });
    removeHandlers();

    expect(processObj.off).toHaveBeenCalledTimes(3);
    expect(processObj.off.mock.calls.map(([event]) => event)).toEqual([
      'uncaughtException', 'unhandledRejection', 'warning'
    ]);
  });

  test('supports defaults and the default export', () => {
    const registration = registerHandlers({ processObj: makeProcess(), log: makeLogger() });
    expect(registration.removeHandlers).toEqual(expect.any(Function));
    expect(registerHandlers).toBe(namedRegisterHandlers);
  });
  test('covers default process and logger options', () => {
    const fakeProcess = makeProcess();
    registerHandlers({ processObj: fakeProcess }).removeHandlers();
    const registration = registerHandlers({ log: makeLogger() });
    registration.removeHandlers();
    registerHandlers().removeHandlers();
  });
});

test('supports selected events, idempotence, once listeners, and repeat cleanup', () => {
  const processObj = { on: jest.fn(), once: jest.fn(), off: jest.fn() };
  const log = makeLogger();
  const first = registerHandlers({ processObj, log, events: ['warning', 'warning'], once: true });
  const second = registerHandlers({ processObj, log, events: ['warning'] });
  expect(second).toBe(first);
  expect(processObj.once).toHaveBeenCalledTimes(1);
  first.removeHandlers(); first.removeHandlers();
  expect(processObj.off).toHaveBeenCalledTimes(1);
  expect(first.removed).toBe(true);
});

test('validates event lists and supports abort signals', () => {
  const processObj = makeProcess(); const log = makeLogger();
  expect(() => registerHandlers({ processObj, log, events: 'warning' })).toThrow('events must be an array');
  expect(() => registerHandlers({ processObj, log, events: ['invalid'] })).toThrow('at least one');
  const controller = new AbortController();
  const registration = registerHandlers({ processObj, log, events: ['warning'], signal: controller.signal });
  controller.abort();
  expect(registration.removed).toBe(true);
  const aborted = new AbortController(); aborted.abort();
  const already = registerHandlers({ processObj: makeProcess(), log, events: ['warning'], signal: aborted.signal });
  expect(already.removed).toBe(true);
});
