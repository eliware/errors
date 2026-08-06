import { registerHandlers } from '@eliware/errors';

const controller = new AbortController();

const registration = registerHandlers({
  events: ['unhandledRejection', 'warning'],
  once: false,
  signal: controller.signal,
});

console.log('Error handlers registered.');

// Simulate an event without terminating the process:
process.emit('warning', new Error('Demo warning'));
process.emit('unhandledRejection', new Error('Demo rejection'), Promise.resolve());

// Remove the listeners when the application shuts down.
registration.removeHandlers();

// AbortSignal cleanup is also supported:
controller.abort();
console.log('Error handlers removed.');
