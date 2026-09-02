import { defaultEvents } from '../src/constants.mjs';

test('defines the supported default process events', () => {
  expect(defaultEvents).toEqual(['uncaughtException', 'unhandledRejection', 'warning']);
  expect(Object.isFrozen(defaultEvents)).toBe(true);
});
