import type logger from '@eliware/log';

export type ProcessEvent = 'uncaughtException' | 'unhandledRejection' | 'warning';
export interface RegisterHandlersOptions {
  processObj?: NodeJS.Process;
  log?: typeof logger;
  events?: ProcessEvent[];
  once?: boolean;
  signal?: AbortSignal;
}
export interface RegisteredHandlers {
  readonly removed: boolean;
  removeHandlers(): void;
}
export declare function registerHandlers(options?: RegisterHandlersOptions): RegisteredHandlers;
export default registerHandlers;
