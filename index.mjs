import logger from '@eliware/log';

/**
 * Register process-level handlers for uncaught exceptions, unhandled rejections,
 * and warnings.
 *
 * @param {{ processObj?: NodeJS.Process, log?: typeof logger }} [options]
 * @returns {{ removeHandlers: () => void }}
 */
export const registerHandlers = ({ processObj = process, log = logger } = {}) => {
  const handlers = {
    uncaughtException: (error) => log.error('Uncaught Exception', { error }),
    unhandledRejection: (reason, promise) => log.error('Unhandled Rejection', { reason, promise }),
    warning: (warning) => log.warn('Warning', { warning })
  };

  for (const [event, handler] of Object.entries(handlers)) processObj.on(event, handler);
  log.debug('Exception handlers registered');

  return {
    removeHandlers: () => {
      for (const [event, handler] of Object.entries(handlers)) processObj.off(event, handler);
    }
  };
};

export default registerHandlers;
