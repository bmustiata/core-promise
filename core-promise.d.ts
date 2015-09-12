declare module 'core-promise/lib/Promise' {
	/// <reference path="../node_modules/grunt-typescript/node_modules/typescript/bin/lib.es6.d.ts" />
	/**
	 * A promise can be in any of these states. FULFILLED and REJECTED are final states for a promise.
	 */
	export declare enum PromiseState {
	    FULFILLED = 0,
	    REJECTED = 1,
	    PENDING = 2,
	}
	/**
	 * <p>A promise follow up is a set of callbacks, followed by the next promise that are
	 * registered on the "then" method of the Promise.</p>
	 * <p>The callback function for onFulfill, or onReject will be called at most once as per
	 * Promises spec.</p>
	 */
	export declare class PromiseFollowUp<X> {
	    callbacks: Array<Function>;
	    promise: CorePromise<X>;
	}
	/**
	 * <p>A promise represents the eventual result of an asynchronous operation. The primary way
	 * of interacting with a promise is through its then method, which registers callbacks to
	 * receive either a promise’s eventual value or the reason why the promise cannot be fulfilled.</p>
	 * <p>This implementation is fully compatible with the specification from: http://promisesaplus.com/,
	 * and passes all the tests defined here: https://github.com/promises-aplus/promises-tests.</p>
	 *
	 * @inmodule "core-promise"
	 */
	export declare class CorePromise<U> implements Promise<U> {
	    private _state;
	    private _value;
	    private _followUps;
	    /**
	     * @param {object} executor A function with two parameters.
	     */
	    constructor(executor: (resolve: (value) => void, reject: (value) => void) => void);
	    /**
	     * Chain other callbacks to be executed after the promise gets resolved or rejected.
	     * @param onFulfill
	     * @param onReject
	     * @returns {Promise}
	     */
	    then<V, X, Y>(onFulfill?: (value: U) => CorePromise<V>, onReject?: (reason: X) => Y): CorePromise<V>;
	    then<V, X, Y>(onFulfill?: (value: U) => V, onReject?: (reason: X) => Y): CorePromise<V>;
	    then<V, X, Y>(onFulfill?: (value: U) => void, onReject?: (reason: X) => Y): CorePromise<U>;
	    /**
	     * Chain other callbacks after the promise gets rejected.
	     */
	    catch<T, X, Y>(onReject?: (reason: X) => Y): CorePromise<T>;
	    /**
	     * Always permits adding some code into the promise chain that will be called
	     * irrespective if the chain is successful or not, in order to be used similarily
	     * with a finally block.
	     * @param always
	     */
	    always(fn: Function): CorePromise<U>;
	    /**
	     * Resolve the given value, using the promise resolution algorithm.
	     */
	    static resolve(x: number): CorePromise<number>;
	    static resolve(x: string): CorePromise<string>;
	    static resolve<X, Y>(x: X): CorePromise<Y>;
	    /**
	     * The Promise.all(iterable) method returns a promise that resolves when all of the promises
	     * in the iterable argument have resolved.
	     * @param {Array<Promise<any>>} args
	     * @returns {Promise<Iterable<T>>}
	     */
	    static all<T, X>(iterable: Array<CorePromise<X>>): CorePromise<Array<T>>;
	    /**
	     * Create a new promise that is already rejected with the given value.
	     */
	    static reject<U, X>(reason: X): CorePromise<U>;
	    /**
	     * The Promise.race(iterable) method returns the first promise that resolves or
	     * rejects from the iterable argument.
	     * @param {Array<Promise<any>>} args
	     * @returns {Promise<Iterable<T>>}
	     */
	    static race<T, X>(iterable: Array<CorePromise<X>>): CorePromise<Array<T>>;
	    /**
	     * Resolve a promise.
	     * @param {Promise} promise     The promise to resolve.
	     * @param {any} x               The value to resolve against.
	     */
	    private static resolvePromise<U, X>(promise, x);
	    private static resolvePromise<U, X, Y>(promise, x);
	    private _transition(state, value);
	    private _fulfill(value);
	    private _reject(reason);
	    private _notifyCallbacks();
	}
	export declare var DefaultPromise: PromiseConstructor | typeof CorePromise;

}
declare module 'core-promise/lib/nextTick' {
	/// <reference path="../typings/node/node.d.ts" />
	export declare function nextTick(callback: Function): void;

}
declare module 'core-promise' {
	import main = require('core-promise/lib/Promise');
	export = main;
}
