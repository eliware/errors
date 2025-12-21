const logger = require('@eliware/log');

/**
 * Registers process-level exception handlers for uncaught exceptions, unhandled rejections, warnings, and exit events.
 * @param {Object} options
 * @param {Object} [options.processObj=process] - The process object to attach handlers to.
 * @param {Object} [options.log=logger] - Logger for output.
 * @returns {Object} { removeHandlers } - Function to remove all registered handlers (for testability).
 */
const registerHandlers = ({
    processObj = process,
    log = logger
} = {}) => {
    // Safe serializer: shallowly serialize objects without invoking toJSON or other getters
    const safeSerialize = (obj) => {
        try {
            if (obj === null) return null;
            if (typeof obj !== 'object') return obj;
            const out = {};
            for (const k of Object.keys(obj)) {
                try {
                    const v = obj[k];
                    if (v === null) { out[k] = null; continue; }
                    if (typeof v === 'object') {
                        const info = { type: v.constructor && v.constructor.name ? v.constructor.name : 'Object' };
                        try { if ('id' in v && (typeof v.id === 'string' || typeof v.id === 'number')) info.id = v.id; } catch (e) {}
                        try { if ('name' in v && typeof v.name === 'string') info.name = v.name; } catch (e) {}
                        out[k] = info;
                    } else if (typeof v === 'function') {
                        out[k] = `[Function: ${v.name || 'anonymous'}]`;
                    } else {
                        out[k] = v;
                    }
                } catch (e) {
                    out[k] = '[Unserializable]';
                }
            }
            return out;
        } catch (e) {
            try { return String(obj); } catch (ee) { return '[Unserializable]'; }
        }
    };

    const handlers = {
        uncaughtException: (err) => {
            try {
                // Include raw error object for downstream consumers, but also provide safe fields
                log.error('Uncaught Exception', {
                    name: err && err.name,
                    message: err && err.message,
                    stack: err && err.stack,
                    error: err
                });
            } catch (e) {
                try { log.error('Uncaught Exception (logging failed)', { error: String(err) }); } catch (ee) { /* swallow */ }
            }
        },
        unhandledRejection: (reason, promise) => {
            try {
                if (reason instanceof Error) {
                    return log.error('Unhandled Rejection', { reason: { name: reason.name, message: reason.message, stack: reason.stack, error: reason }, promise });
                }
                return log.error('Unhandled Rejection', { reason: safeSerialize(reason), promise: safeSerialize(promise) });
            } catch (e) {
                try { log.error('Unhandled Rejection (logging failed)', { reason: String(reason) }); } catch (ee) { /* swallow */ }
            }
        },
        warning: (warning) => {
            try {
                // include raw warning object while also exposing key fields
                log.warn('Warning', {
                    name: warning && warning.name,
                    message: warning && warning.message,
                    stack: warning && warning.stack,
                    warning
                });
            } catch (e) {
                try { log.warn('Warning (logging failed)', { warning: String(warning) }); } catch (ee) { /* swallow */ }
            }
        }
    };
    processObj.on('uncaughtException', handlers.uncaughtException);
    processObj.on('unhandledRejection', handlers.unhandledRejection);
    processObj.on('warning', handlers.warning);
    const removeHandlers = () => {
        processObj.off('uncaughtException', handlers.uncaughtException);
        processObj.off('unhandledRejection', handlers.unhandledRejection);
        processObj.off('warning', handlers.warning);
    };
    log.debug('Exception handlers registered');
    return { removeHandlers };
};

module.exports = { registerHandlers };
module.exports.default = registerHandlers;
