const isDev = import.meta.env.DEV;

/**
 * Production-safe logger
 * - In development: logs everything
 * - In production: only logs errors
 */
export const logger = {
    log: isDev ? console.log : () => { },
    error: console.error,  // Always log errors
    warn: isDev ? console.warn : () => { },
    debug: isDev ? console.log : () => { },
    info: isDev ? console.info : () => { }
};

// Convenience function for grouped logs
export const logGroup = (title, callback) => {
    if (isDev) {
        console.group(title);
        callback();
        console.groupEnd();
    }
};
