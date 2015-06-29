/// <reference path="Promise.ts" />
/// <reference path="../../../typings/node/node.d.ts" />

declare var Promise; // a Promise should already exist

module.exports.Promise = typeof Promise != "undefined" ? Promise : CorePromise;
module.exports.CorePromise = CorePromise;
