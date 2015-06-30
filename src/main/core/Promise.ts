/// <reference path="nextTick.ts"/>

module com.ciplogic {

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
 */
export class CorePromise<T> {
    private state : PromiseState = PromiseState.PENDING;
    private value : any; // or reason if state == PromiseState.REJECTED

    private followUps = [];

    /**
     * @param {object} executor A function with two parameters.
     */
    constructor(executor : (resolve : (value) => void, reject : (value) => void) => any);
    constructor(executor : (resolve : Function, reject : Function) => any) {
        if (!executor) {
            throw new Error("You need an executor(resolve, reject) to be passed to " +
                    "the constructor of a Promise");
        }

        executor((r) => {
            CorePromise.resolvePromise(this, r);
        }, (e) => {
            this.reject(e);
        });
    }

    /**
     *
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
        this.followUps.push( followUp );

        this.notifyCallbacks();

        return followUp.promise;
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

    private transition(state : PromiseState, value) {
        if (this.state == PromiseState.PENDING) {
            this.state = state;
            this.value = value;

            this.notifyCallbacks();
        }
    }

    private fulfill(value : T) : CorePromise<T> {
        this.transition(PromiseState.FULFILLED, value);

        return this;
    }

    private reject(reason : any) : CorePromise<T> {
        this.transition(PromiseState.REJECTED, reason);

        return this;
    }

    private notifyCallbacks() {
        if (this.state !== PromiseState.PENDING) {
            com.ciplogic.nextTick(() => {
                var followUps = this.followUps;
                this.followUps = [];

                for (var i = 0; i < followUps.length; i++) {
                    try {
                        if (followUps[i].callbacks[ this.state ] == null) {
                            followUps[i].promise.transition(this.state, this.value);
                        } else {
                            var result = followUps[i].callbacks[ this.state ].call(undefined, this.value);
                            CorePromise.resolvePromise(followUps[i].promise, result);
                        }
                    } catch (e) {
                        followUps[i].promise.transition(PromiseState.REJECTED, e);
                    }
                }
            });
        }
    }

    static resolve<U>(x : any) : CorePromise<U> {
        var result = new CorePromise((fulfill, reject) => {
        });

        CorePromise.resolvePromise(result, x);

        return result;
    }

    /**
     * The Promise.all(iterable) method returns a promise that resolves when all of the promises
     * in the iterable argument have resolved.
     * @param args
     * @returns {Promise<Iterable<T>>}
     */
    static all<T>(args: Array<any>) : CorePromise<Array<T>> {
        // var promises : Array<Promise<T>> = [];

        // for (var i = 0; i < args.length; i++) {
        //     promises.push(Promise.resolve(args[i]));
        // }

        throw new Error('not implemented');
    }

    /**
     * Create a new promise that is already rejected with the given value.
     */
    static reject<U>(reason : any) : CorePromise<U> {
        return new CorePromise((fulfill, reject) => {
            reject(reason);
        });
    }

    /**
     * Resolve a promise.
     * @param {Promise} promise     The promise to resolve.
     * @param {any} x               The value to resolve against.
     */
    private static resolvePromise<U>(promise : CorePromise<U>, x : any) {
        if (promise === x) {
            throw new TypeError();
        }

        if ((typeof x !== "function") && (typeof x !== "object") || !x) {
            promise.fulfill(x);
            return;
        }

        if (x instanceof CorePromise) {
            x.then(function(v) {
                promise.fulfill(v);
            }, function(r) {
                promise.reject(r);
            });
            return;
        }

        var then;

        try {
            then = x.then;
        } catch (e) {
            promise.reject(e);
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
                        promise.reject(reason);
                    }
                });
            } catch(e) {
                if (execute) {
                    promise.reject(e);
                }
            }
        } else {
            promise.fulfill(x);
        }
    }

    toString() {
        return "Promise";
    }
}

}
