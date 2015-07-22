/// <reference path="../../../typings/node/node.d.ts" />
var com;
(function (com) {
    var ciplogic;
    (function (ciplogic) {
        var callbacks = [], nextTickPointer = internalNextTick, nextTickFunction = typeof process != "undefined" && typeof process.nextTick == "function" ? process.nextTick : setTimeout;
        function nextTick(callback) {
            nextTickPointer(callback);
        }
        ciplogic.nextTick = nextTick;
        function internalNextTick(callback) {
            callbacks.push(callback);
            //setTimeout(runTicks, 0);
            nextTickFunction(runTicks, 0);
        }
        function addCallback(callback) {
            callbacks.push(callback);
        }
        function runTicks() {
            var fn;
            // while running ticks, adding new ticks is not needed to add a new setTimeout,
            // thus improving the performance quite a bit.
            try {
                nextTickPointer = addCallback;
                // FIXME: some yield should be done every 50-100 msecs
                while (fn = callbacks.shift()) {
                    fn.apply(undefined, []);
                }
            }
            finally {
                nextTickPointer = internalNextTick;
            }
        }
    })(ciplogic = com.ciplogic || (com.ciplogic = {}));
})(com || (com = {}));
/// <reference path="nextTick.ts"/>
var com;
(function (com) {
    var ciplogic;
    (function (ciplogic) {
        /**
         * Iterates over all the elements in the iterable, calling the callback on each one.
         * Basically poor man's `Array.forEach()`
         */
        function forEach(iterable, callback) {
            for (var i = 0; i < iterable.length; i++) {
                callback(iterable[i], i);
            }
        }
        /**
         * A promise can be in any of these states. FULFILLED and REJECTED are final states for a promise.
         */
        var PromiseState;
        (function (PromiseState) {
            PromiseState[PromiseState["FULFILLED"] = 0] = "FULFILLED";
            PromiseState[PromiseState["REJECTED"] = 1] = "REJECTED";
            PromiseState[PromiseState["PENDING"] = 2] = "PENDING";
        })(PromiseState || (PromiseState = {}));
        /**
         * <p>A promise follow up is a set of callbacks, followed by the next promise that are
         * registered on the "then" method of the Promise.</p>
         * <p>The callback function for onFulfill, or onReject will be called at most once as per
         * Promises spec.</p>
         */
        var PromiseFollowUp = (function () {
            function PromiseFollowUp() {
                this.callbacks = [null, null];
                this.promise = null;
            }
            return PromiseFollowUp;
        })();
        /**
         * <p>A promise represents the eventual result of an asynchronous operation. The primary way
         * of interacting with a promise is through its then method, which registers callbacks to
         * receive either a promise’s eventual value or the reason why the promise cannot be fulfilled.</p>
         * <p>This implementation is fully compatible with the specification from: http://promisesaplus.com/,
         * and passes all the tests defined here: https://github.com/promises-aplus/promises-tests.</p>
         *
         * @inmodule "core-promise"
         */
        var CorePromise = (function () {
            function CorePromise(executor) {
                var _this = this;
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
                    executor(function (r) {
                        CorePromise.resolvePromise(_this, r);
                    }, function (e) {
                        _this._reject(e);
                    });
                }
                catch (e) {
                    this._reject(e);
                }
            }
            CorePromise.prototype.then = function (onFulfill, onReject) {
                var followUp = new PromiseFollowUp();
                if (typeof onFulfill === "function") {
                    followUp.callbacks[PromiseState.FULFILLED] = onFulfill;
                }
                if (typeof onReject === "function") {
                    followUp.callbacks[PromiseState.REJECTED] = onReject;
                }
                followUp.promise = new CorePromise(function (fulfill, reject) { });
                this._followUps.push(followUp);
                this._notifyCallbacks();
                return followUp.promise;
            };
            CorePromise.prototype.catch = function (onReject) {
                return this.then(undefined, onReject);
            };
            /**
             * Always permits adding some code into the promise chain that will be called
             * irrespective if the chain is successful or not, in order to be used similarily
             * with a finally block.
             * @param always
             */
            CorePromise.prototype.always = function (fn) {
                return this.then(function (result) {
                    fn.apply(undefined);
                    return result;
                }, function (reason) {
                    fn.apply(undefined);
                    throw reason;
                });
            };
            CorePromise.resolve = function (x) {
                if (typeof this != "function") {
                    throw new TypeError("The this of Promise.resolve must be a constructor.");
                }
                if (x instanceof CorePromise) {
                    return x;
                }
                var result = new this(function (fulfill, reject) {
                    CorePromise.resolvePromise({
                        _fulfill: fulfill,
                        _reject: reject
                    }, x);
                });
                return result;
            };
            /**
             * The Promise.all(iterable) method returns a promise that resolves when all of the promises
             * in the iterable argument have resolved.
             * @param {Array<Promise<any>>} args
             * @returns {Promise<Iterable<T>>}
             */
            CorePromise.all = function (iterable) {
                if (typeof this != "function") {
                    throw new TypeError("The this of Promise.all must be a constructor.");
                }
                if (!iterable || typeof iterable.length == "undefined") {
                    return CorePromise.reject(new TypeError("Passed a non iterable to Promise.all(): " + typeof iterable));
                }
                if (iterable.length == 1) {
                    return CorePromise.resolve(iterable[0])
                        .then(function (it) { return [it]; });
                }
                if (iterable.length == 0) {
                    return CorePromise.resolve([]);
                }
                return new this(function (resolve, reject) {
                    var unresolvedPromisesCount = iterable.length, resolvedValues = new Array(iterable.length);
                    forEach(iterable, function (it, i) {
                        CorePromise.resolve(it).then(function (value) {
                            resolvedValues[i] = value;
                            unresolvedPromisesCount--;
                            if (unresolvedPromisesCount == 0) {
                                resolve(resolvedValues);
                            }
                        }, reject);
                    });
                });
            };
            /**
             * Create a new promise that is already rejected with the given value.
             */
            CorePromise.reject = function (reason) {
                if (typeof this != "function") {
                    throw new TypeError("The this of Promise.reject must be a constructor.");
                }
                return new this(function (fulfill, reject) {
                    reject(reason);
                });
            };
            /**
             * The Promise.race(iterable) method returns the first promise that resolves or
             * rejects from the iterable argument.
             * @param {Array<Promise<any>>} args
             * @returns {Promise<Iterable<T>>}
             */
            CorePromise.race = function (iterable) {
                if (typeof this != "function") {
                    throw new TypeError("The this of Promise.race must be a constructor.");
                }
                if (!iterable || typeof iterable.length == "undefined") {
                    return CorePromise.reject(new TypeError("Passed a non iterable to Promise.race(): " + typeof iterable));
                }
                if (iterable.length == 1) {
                    return CorePromise.resolve(iterable[0])
                        .then(function (it) { return [it]; });
                }
                if (iterable.length == 0) {
                    return new this(function (resolve, reject) { });
                }
                // if any of the promises is already done, resolve them faster.
                for (var i = 0; i < iterable.length; i++) {
                    if (iterable[i] instanceof CorePromise && iterable[i]._state != PromiseState.PENDING) {
                        return iterable[i];
                    }
                }
                return new this(function (resolve, reject) {
                    var rejectedPromiseCount = 0;
                    for (var i = 0; i < iterable.length; i++) {
                        CorePromise.resolvePromise({
                            _fulfill: resolve,
                            _reject: reject
                        }, iterable[i]);
                    }
                });
            };
            CorePromise.resolvePromise = function (promise, x) {
                if (promise === x) {
                    throw new TypeError();
                }
                if ((typeof x !== "function") && (typeof x !== "object") || !x) {
                    promise._fulfill(x);
                    return;
                }
                if (x instanceof CorePromise) {
                    x.then(function (v) {
                        promise._fulfill(v);
                    }, function (r) {
                        promise._reject(r);
                    });
                    return;
                }
                var then;
                try {
                    then = x.then;
                }
                catch (e) {
                    promise._reject(e);
                    return;
                }
                if (!then && typeof x === "function") {
                    then = x;
                }
                if (typeof then === "function") {
                    var execute = true;
                    try {
                        then.call(x, function (value) {
                            if (execute) {
                                execute = false;
                                CorePromise.resolvePromise(promise, value);
                            }
                        }, function (reason) {
                            if (execute) {
                                execute = false;
                                promise._reject(reason);
                            }
                        });
                    }
                    catch (e) {
                        if (execute) {
                            promise._reject(e);
                        }
                    }
                }
                else {
                    promise._fulfill(x);
                }
            };
            CorePromise.prototype._transition = function (state, value) {
                if (this._state == PromiseState.PENDING) {
                    this._state = state;
                    this._value = value;
                    this._notifyCallbacks();
                }
            };
            CorePromise.prototype._fulfill = function (value) {
                this._transition(PromiseState.FULFILLED, value);
                return this;
            };
            CorePromise.prototype._reject = function (reason) {
                this._transition(PromiseState.REJECTED, reason);
                return this;
            };
            CorePromise.prototype._notifyCallbacks = function () {
                var _this = this;
                if (this._state !== PromiseState.PENDING) {
                    var followUps = this._followUps;
                    this._followUps = [];
                    com.ciplogic.nextTick(function () {
                        for (var i = 0; i < followUps.length; i++) {
                            var followUpPromise;
                            followUpPromise = followUps[i].promise;
                            try {
                                if (followUps[i].callbacks[_this._state] == null) {
                                    followUpPromise._transition(_this._state, _this._value);
                                }
                                else {
                                    var result = followUps[i].callbacks[_this._state].call(undefined, _this._value);
                                    CorePromise.resolvePromise(followUpPromise, result);
                                }
                            }
                            catch (e) {
                                followUpPromise._transition(PromiseState.REJECTED, e);
                            }
                        }
                    });
                }
            };
            return CorePromise;
        })();
        ciplogic.CorePromise = CorePromise;
    })(ciplogic = com.ciplogic || (com.ciplogic = {}));
})(com || (com = {}));
/// <reference path="../core/Promise.ts" />
if (typeof window['Promise'] == "undefined") {
    window['Promise'] = com.ciplogic.CorePromise;
}
//# sourceMappingURL=core-promise.js.map