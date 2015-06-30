/// <reference path="../core/Promise.ts" />

if (typeof window['Promise'] == "undefined") {
    window['Promise'] = com.ciplogic.CorePromise;
}
