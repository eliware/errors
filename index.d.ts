import type logger from '@eliware/log';

export type ProcessEvent = 'uncaughtException' | 'unhandledRejection' | 'warning';
export type ProcessListener = (...args: unknown[]) => void;
export interface Logger {
  error(message: string, metadata: unknown): unknown;
  warn(message: string, metadata: unknown): unknown;
  debug(message: string): unknown;
}
export type ProcessLike = {
  on(event: ProcessEvent, listener: ProcessListener): unknown;
  once?(event: ProcessEvent, listener: ProcessListener): unknown;
} & ({
  off(event: ProcessEvent, listener: ProcessListener): unknown;
} | {
  removeListener(event: ProcessEvent, listener: ProcessListener): unknown;
});
export interface RegisterHandlersOptions {
  processObj?: ProcessLike;
  log?: Logger;
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
