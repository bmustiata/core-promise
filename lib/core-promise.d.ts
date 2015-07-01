/// <reference path="../typings/node/node.d.ts" />
declare module com.ciplogic {
    function nextTick(callback: Function): void;
}
declare module com.ciplogic {
    /**
     * <p>A promise represents the eventual result of an asynchronous operation. The primary way
     * of interacting with a promise is through its then method, which registers callbacks to
     * receive either a promise’s eventual value or the reason why the promise cannot be fulfilled.</p>
     * <p>This implementation is fully compatible with the specification from: http://promisesaplus.com/,
     * and passes all the tests defined here: https://github.com/promises-aplus/promises-tests.</p>
     */
    class CorePromise<T> {
        private state;
        private value;
        private followUps;
        /**
         * @param {object} executor A function with two parameters.
         */
        constructor(executor: (resolve: (value) => void, reject: (value) => void) => any);
        /**
         *
         * @param onFulfill
         * @param onReject
         * @returns {Promise}
         */
        then<V>(onFulfill?: (value: T) => CorePromise<V>, onReject?: (reason: any) => any): CorePromise<V>;
        then<V>(onFulfill?: (value: T) => V, onReject?: (reason: any) => any): CorePromise<V>;
        then<V>(onFulfill?: (value: T) => void, onReject?: (reason: any) => any): CorePromise<T>;
        /**
         * Always permits adding some code into the promise chain that will be called
         * irrespective if the chain is successful or not, in order to be used similarily
         * with a finally block.
         * @param always
         */
        always(fn: Function): CorePromise<T>;
        private transition(state, value);
        private fulfill(value);
        private reject(reason);
        private notifyCallbacks();
        static resolve<U>(x: any): CorePromise<U>;
        /**
         * The Promise.all(iterable) method returns a promise that resolves when all of the promises
         * in the iterable argument have resolved.
         * @param {Array<Promise<any>>} args
         * @returns {Promise<Iterable<T>>}
         */
        static all(iterable: Array<CorePromise<any>>): CorePromise<Array<any>>;
        /**
         * Create a new promise that is already rejected with the given value.
         */
        static reject<U>(reason: any): CorePromise<U>;
        /**
         * Resolve a promise.
         * @param {Promise} promise     The promise to resolve.
         * @param {any} x               The value to resolve against.
         */
        private static resolvePromise<U>(promise, x);
        toString(): string;
    }
}
declare var Promise: any;
