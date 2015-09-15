/// <reference path="../node_modules/grunt-typescript/node_modules/typescript/bin/lib.es6.d.ts" />
/**
 * <p>A promise represents the eventual result of an asynchronous operation. The primary way
 * of interacting with a promise is through its then method, which registers callbacks to
 * receive either a promise’s eventual value or the reason why the promise cannot be fulfilled.</p>
 * <p>This implementation is fully compatible with the specification from: http://promisesaplus.com/,
 * and passes all the tests defined here: https://github.com/promises-aplus/promises-tests.</p>
 *
 * @inmodule "core-promise"
 */
export declare class CorePromise<T> implements Promise<T>, Symbol {
    private _state;
    private _value;
    private _followUps;
    [Symbol.toStringTag]: string;
    /**
     * @param {object} executor A function with two parameters.
     */
    constructor(executor: (resolve: (value) => void, reject: (value) => void) => any);
    /**
     * Chain other callbacks to be executed after the promise gets resolved or rejected.
     * @param onFulfill
     * @param onReject
     * @returns {Promise}
     */
    then<V>(onFulfill?: (value: T) => CorePromise<V>, onReject?: (reason: any) => any): CorePromise<V>;
    then<V>(onFulfill?: (value: T) => V, onReject?: (reason: any) => any): CorePromise<V>;
    then<V>(onFulfill?: (value: T) => void, onReject?: (reason: any) => any): CorePromise<T>;
    then<TResult>(onfulfilled?: (value: T) => TResult | Promise<TResult> | CorePromise<TResult>, onrejected?: (reason: any) => TResult | Promise<TResult> | CorePromise<TResult>): CorePromise<TResult>;
    /**
     * Chain other callbacks after the promise gets rejected.
     */
    catch<T>(onReject?: (reason: any) => any): CorePromise<T>;
    /**
     * Always permits adding some code into the promise chain that will be called
     * irrespective if the chain is successful or not, in order to be used similarily
     * with a finally block.
     * @param always
     */
    always(fn: Function): CorePromise<T>;
    /**
      * Creates a new resolved promise for the provided value.
      * @param value A promise.
      * @returns A promise whose internal state matches the provided promise.
      */
    static resolve<T>(value: T | Promise<T>): Promise<T>;
    /**
     * Creates a new resolved promise .
     * @returns A resolved promise.
     */
    static resolve(): Promise<void>;
    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises
     * resolve, or rejected when any Promise is rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    static all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises
     * resolve, or rejected when any Promise is rejected.
     * @param values An array of values.
     * @returns A new Promise.
     */
    static all(values: Promise<void>[]): Promise<void>;
    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    static reject(reason: any): Promise<void>;
    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    static reject<T>(reason: any): Promise<T>;
    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
     * or rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    static race<T>(values: (T | Promise<T>)[]): Promise<T>;
    /**
     * Resolve a promise.
     * @param {Promise} promise     The promise to resolve.
     * @param {any} x               The value to resolve against.
     */
    private static resolvePromise<U>(promise, x);
    private static resolvePromise<U>(promise, x);
    private _transition(state, value);
    private _fulfill(value);
    private _reject(reason);
    private _notifyCallbacks();
}
export declare var DefaultPromise: PromiseConstructor;
