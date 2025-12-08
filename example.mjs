import log from '@eliware/log';
import { registerHandlers } from '@eliware/errors';
const { removeHandlers } = registerHandlers({ log });
throw new Error('Demo uncaught exception');
