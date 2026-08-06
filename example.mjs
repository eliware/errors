import { registerHandlers } from '@eliware/errors';

registerHandlers();

setTimeout(() => { throw new Error('Demo uncaught exception'); }, 1000);
