/// <reference path="nextTick.ts"/>

module com.ciplogic {

/**
 * Iterates over all the elements in the iterable, calling the callback on each one.
 * Basically poor man's `Array.forEach()`
 */
function forEach(iterable: Array<any>, callback: (value: any, index: number) => void) {
    for (var i = 0; i < iterable.length; i++) {
        callback(iterable[i], i);
    }
}

/**
 * A promise can be in any of these states. FULFILLED and REJECTED are final states for a promise.
 */
enum PromiseState {
    FULFILLED,
    REJECTED,
    PENDING
}

/**
 * <p>A promise follow up is a set of callbacks, followed by the next promise that are
 * registered on the "then" method of the Promise.</p>
 * <p>The callback function for onFulfill, or onReject will be called at most once as per
 * Promises spec.</p>
 */
class PromiseFollowUp<X> {
    callbacks : Array<Function> = [ null, null ];
    promise : CorePromise<X> = null;
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
export class CorePromise<T> {
    private _state : PromiseState;
    private _value : any; // or reason if state == PromiseState.REJECTED

    private _followUps;

    /**
     * @param {object} executor A function with two parameters.
     */
    constructor(executor : (resolve : (value) => void, reject : (value) => void) => any);
    constructor(executor : (resolve : Function, reject : Function) => any) {
        if (!executor) {
            throw new Error("You need an executor(resolve, reject) to be passed to " +
                    "the constructor of a Promise");
        }

        if (typeof this != "object") {
            throw new TypeError("The this object for a Promise must be an object.");
        }
        
        if (this instanceof Number || this instanceof String || this instanceof Date || this instanceof Boolean) {
            throw new TypeError("The this object for a Promise must be an object.");
        }
        
        if (typeof this._state != "undefined") {
            throw new TypeError("Already constructed promise passed as this.");
        }
        
        if (typeof executor != "function") {
            throw new TypeError("Executor must be a callable object.");
        }

        this._followUps = [];
        this._state = PromiseState.PENDING;
        
        try {
            executor((r) => {
                CorePromise.resolvePromise(this, r);
            }, (e) => {
                this._reject(e);
            });
        } catch (e) {
            this._reject(e);
        }
    }

    /**
     * Chain other callbacks to be executed after the promise gets resolved or rejected.
     * @param onFulfill
     * @param onReject
     * @returns {Promise}
     */
    then<V>(onFulfill?: (value: T) => CorePromise<V>, onReject?: (reason: any) => any): CorePromise<V>;
    then<V>(onFulfill?: (value: T) => V, onReject?: (reason: any) => any): CorePromise<V>;
    then<V>(onFulfill?: (value: T) => void, onReject?: (reason: any) => any): CorePromise<T>;
    then(onFulfill? : (value : T) => any, onReject? : (reason : any) => any) : CorePromise<any> {
        var followUp = new PromiseFollowUp();

        if (typeof onFulfill === "function") {
            followUp.callbacks[ PromiseState.FULFILLED ] = onFulfill;
        }

        if (typeof onReject === "function") {
            followUp.callbacks[ PromiseState.REJECTED ] = onReject;
        }

        followUp.promise = new CorePromise(function(fulfill, reject){});
        this._followUps.push( followUp );

        this._notifyCallbacks();

        return followUp.promise;
    }

    /**
     * Chain other callbacks after the promise gets rejected.
     */
    catch<T>(onReject?: (reason: any) => any): CorePromise<T>;
    catch(onReject? : (reason : any) => any) : CorePromise<any> {
        return this.then(undefined, onReject);
    }
    
    /**
     * Always permits adding some code into the promise chain that will be called
     * irrespective if the chain is successful or not, in order to be used similarily
     * with a finally block.
     * @param always
     */
    always(fn : Function): CorePromise<T> {
        return this.then(function(result) {
            fn.apply(undefined);
            return result;
        }, function (reason) {
            fn.apply(undefined);
            throw reason;
        });
    }

    /**
     * Resolve the given value, using the promise resolution algorithm.
     */
    static resolve(x : number) : CorePromise<number>;
    static resolve(x : string) : CorePromise<string>;
    static resolve(x : any) : CorePromise<any>;
    static resolve<U>(x : any) : CorePromise<U> {
        if (typeof this != "function") {
            throw new TypeError("The this of Promise.resolve must be a constructor.");
        }
        
        if (x instanceof CorePromise) {
            return x;
        }
        
        var result = new this((fulfill, reject) => {
            CorePromise.resolvePromise({
                _fulfill: fulfill,
                _reject: reject
            }, x);
        });

        return result;
    }

    /**
     * The Promise.all(iterable) method returns a promise that resolves when all of the promises
     * in the iterable argument have resolved.
     * @param {Array<Promise<any>>} args
     * @returns {Promise<Iterable<T>>}
     */
    public static all<T>(iterable: Array<CorePromise<any>>) : CorePromise<Array<T>> {
        if (typeof this != "function") {
            throw new TypeError("The this of Promise.all must be a constructor.");
        }

        if (!iterable || typeof iterable.length == "undefined") {
            return CorePromise.reject(new TypeError("Passed a non iterable to Promise.all(): " + typeof iterable));
        }

        if (iterable.length == 1) {
            return CorePromise.resolve(iterable[0])
                .then((it) => [it]);
        }

        if (iterable.length == 0) {
            return CorePromise.resolve([]);
        }

        return new this<Array<any>>(function(resolve, reject) {
            var unresolvedPromisesCount = iterable.length,
                resolvedValues = new Array(iterable.length);

            forEach(iterable, (it, i) => {
                CorePromise.resolve(it).then((value) => {
                    resolvedValues[i] = value;

                    unresolvedPromisesCount--;
                    if (unresolvedPromisesCount == 0) {
                        resolve(resolvedValues);
                    }
                }, reject);
            });
        });
    }

    /**
     * Create a new promise that is already rejected with the given value.
     */
    static reject<U>(reason : any) : CorePromise<U> {
        if (typeof this != "function") {
            throw new TypeError("The this of Promise.reject must be a constructor.");
        }

        return new this((fulfill, reject) => {
            reject(reason);
        });
    }

    /**
     * The Promise.race(iterable) method returns the first promise that resolves or
     * rejects from the iterable argument.
     * @param {Array<Promise<any>>} args
     * @returns {Promise<Iterable<T>>}
     */
    public static race<T>(iterable: Array<CorePromise<any>>) : CorePromise<Array<T>> {
        if (typeof this != "function") {
            throw new TypeError("The this of Promise.race must be a constructor.");
        }

        if (!iterable || typeof iterable.length == "undefined") {
            return CorePromise.reject(new TypeError("Passed a non iterable to Promise.race(): " + typeof iterable));
        }

        if (iterable.length == 1) {
            return CorePromise.resolve(iterable[0])
                .then((it) => [it]);
        }

        if (iterable.length == 0) {
            return new this(function(resolve, reject) {});
        }
        
        // if any of the promises is already done, resolve them faster.
        for (var i = 0; i < iterable.length; i++) {
            if (iterable[i] instanceof CorePromise && iterable[i]._state != PromiseState.PENDING) {
                return iterable[i];
            }
        }
        
        return new this<any>(function(resolve, reject) {
            var rejectedPromiseCount = 0;

            for (var i = 0; i < iterable.length; i++) {
                CorePromise.resolvePromise({
                    _fulfill: resolve,
                    _reject: reject
                }, iterable[i]);
            }
        });
    }

    /**
     * Resolve a promise.
     * @param {Promise} promise     The promise to resolve.
     * @param {any} x               The value to resolve against.
     */
    private static resolvePromise<U>(promise : CorePromise<U>, x : any);
    private static resolvePromise<U>(promise : any, x : any);
    private static resolvePromise<U>(promise : CorePromise<U>, x : any) {
        if (promise === x) {
            throw new TypeError();
        }

        if ((typeof x !== "function") && (typeof x !== "object") || !x) {
            promise._fulfill(x);
            return;
        }

        if (x instanceof CorePromise) {
            x.then(function(v) {
                promise._fulfill(v);
            }, function(r) {
                promise._reject(r);
            });
            return;
        }

        var then;

        try {
            then = x.then;
        } catch (e) {
            promise._reject(e);
            return;
        }

        if (!then && typeof x === "function") {
            then = x;
        }

        if (typeof then === "function") {
            var execute = true;

            try {
                then.call(x, function(value) {
                    if (execute) {
                        execute = false;
                        CorePromise.resolvePromise(promise, value);
                    }
                }, function(reason) {
                    if (execute) {
                        execute = false;
                        promise._reject(reason);
                    }
                });
            } catch(e) {
                if (execute) {
                    promise._reject(e);
                }
            }
        } else {
            promise._fulfill(x);
        }
    }

    private _transition(state : PromiseState, value) {
        if (this._state == PromiseState.PENDING) {
            this._state = state;
            this._value = value;

            this._notifyCallbacks();
        }
    }

    private _fulfill(value : T) : CorePromise<T> {
        this._transition(PromiseState.FULFILLED, value);

        return this;
    }

    private _reject(reason : any) : CorePromise<T> {
        this._transition(PromiseState.REJECTED, reason);

        return this;
    }

    private _notifyCallbacks() {
        if (this._state !== PromiseState.PENDING) {
            var followUps = this._followUps;
            this._followUps = [];

            com.ciplogic.nextTick(() => {
                for (var i = 0; i < followUps.length; i++) {
                    var followUpPromise : CorePromise<any>; 

                    followUpPromise = followUps[i].promise;
                        
                    try {
                        if (followUps[i].callbacks[ this._state ] == null) {
                            followUpPromise._transition(this._state, this._value);
                        } else {
                            var result = followUps[i].callbacks[ this._state ].call(undefined, this._value);
                            CorePromise.resolvePromise(followUpPromise, result);
                        }
                    } catch (e) {
                        followUpPromise._transition(PromiseState.REJECTED, e);
                    }
                }
            });
        }
    }
}

}
