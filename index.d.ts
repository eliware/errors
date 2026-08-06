import type logger from '@eliware/log';

export interface RegisterHandlersOptions {
  processObj?: NodeJS.Process;
  log?: typeof logger;
}

export interface RegisteredHandlers {
  removeHandlers(): void;
}

export declare function registerHandlers(
  options?: RegisterHandlersOptions
): RegisteredHandlers;

export default registerHandlers;
