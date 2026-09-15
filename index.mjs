import { registerHandlers } from './src/index.mjs';

const publicRegisterHandlers = registerHandlers;

export { publicRegisterHandlers as registerHandlers, publicRegisterHandlers as default };
