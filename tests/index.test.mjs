import { jest } from '@jest/globals';
import registerHandlers, { registerHandlers as namedRegisterHandlers } from '../index.mjs';

test('exposes the same named and default public API', () => {
  expect(registerHandlers).toBe(namedRegisterHandlers);
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({ processObj, log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() } });
  expect(registration.removeHandlers).toEqual(expect.any(Function));
  registration.removeHandlers();
});

test('preserves existing listeners while registering and cleaning up its own', () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  const registration = registerHandlers({ processObj, log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() }, events: ['warning'] });
  expect(processObj.on).toHaveBeenCalledWith('warning', expect.any(Function));
  registration.removeHandlers();
  expect(processObj.off).toHaveBeenCalledWith('warning', expect.any(Function));
});
