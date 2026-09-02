export function eventLog(log, event, ...args) {
  if (event === 'warning') return log.warn('Warning', { warning: args[0] });
  if (event === 'unhandledRejection') return log.error('Unhandled Rejection', { reason: args[0], promise: args[1] });
  return log.error('Uncaught Exception', { error: args[0] });
}
