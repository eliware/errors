import { registerHandlers } from "./registration.mjs";

const publicRegisterHandlers = registerHandlers;

export { defaultEvents } from "./registration.mjs";
export { publicRegisterHandlers as registerHandlers, publicRegisterHandlers as default };
