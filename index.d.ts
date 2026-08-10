import type logger from '@eliware/log';

export type ProcessEvent = 'uncaughtException' | 'unhandledRejection' | 'warning';
export interface ProcessLike {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  once?(event: string, listener: (...args: unknown[]) => void): unknown;
  off?(event: string, listener: (...args: unknown[]) => void): unknown;
  removeListener?(event: string, listener: (...args: unknown[]) => void): unknown;
}
export interface RegisterHandlersOptions {
  processObj?: ProcessLike;
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
