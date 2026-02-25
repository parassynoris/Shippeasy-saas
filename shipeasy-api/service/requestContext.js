const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

const requestContext = {
    run: (traceId, callback) => {
        asyncLocalStorage.run(new Map([['traceId', traceId]]), callback);
    },
    getTraceId: () => {
        const store = asyncLocalStorage.getStore();
        return store ? store.get('traceId') : null;
    }
};

module.exports = requestContext;