/// <reference path="../core/Promise.ts" />
/// <reference path="../../../typings/node/node.d.ts" />

declare var Promise; // a Promise should already exist

module.exports.Promise = typeof Promise != "undefined" ? Promise : com.ciplogic.CorePromise;
module.exports.CorePromise = com.ciplogic.CorePromise;
