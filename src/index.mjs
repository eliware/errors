import { registerHandlers } from './registration.mjs';

const publicRegisterHandlers = registerHandlers;

export { publicRegisterHandlers as registerHandlers, publicRegisterHandlers as default };
