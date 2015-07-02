var CorePromise = require("../lib/core-promise.js").CorePromise,
    assert = require("assert"),
    Promise = CorePromise;

var adapter = {
    /**
     * resolved - Create a resolved promise.
     * @param {any} value
     * @return {Promise}
     */
    resolved : function(value) {
    	return CorePromise.resolve(value);
    },

    /**
     * rejected - Create a rejected promise
     * @param {} value
     * @return {Promise}
     */
    rejected : function(value) {
    	return CorePromise.reject(value);
    },

    deferred: function() {
        var result,
            _fulfill,
            _reject;

        result = new CorePromise(function(fulfill, reject) {
            _fulfill = fulfill;
            _reject = reject;
        });

        return {
            promise: result,
            resolve: function(v) {
                try {
                    _fulfill(v);
                } catch (e1) {
                    console.log("ERROR:", e1);
                }
            },
            reject: function(e) {
                try {
                    _reject(e);
                } catch (e2) {
                    console.log("ERROR:", e2);
                }
            },
        };
    },
    
    defineGlobalPromise : function(global) {
        global.Promise = CorePromise;
        global.assert = assert;
     },
    
    removeGlobalPromise : function(global) {
    }
};

describe("Promises/A+ Tests", function () {
     require("promises-aplus-tests").mocha(adapter);
});

describe("Promise ES6 Tests", function () {
    require("promises-es6-tests").mocha(adapter);
});

