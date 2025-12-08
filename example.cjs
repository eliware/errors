const log = require('@eliware/log');
const { registerHandlers } = require('@eliware/errors');
const { removeHandlers } = registerHandlers({ log });
throw new Error('Demo uncaught exception');
