var CorePromise = require("../lib/core-promise.js").CorePromise;

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
        return CorePromise;
    },
    
    removeGlobalPromise : function(global) {
        delete global.Promise;
    }
};

module.exports = adapter;
