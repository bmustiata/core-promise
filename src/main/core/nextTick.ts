/// <reference path="../../../typings/node/node.d.ts" />

var callbacks = [],
    nextTickPointer = internalNextTick,
    nextTickFunction = typeof process != "undefined" && typeof process.nextTick == "Function" ? process.nextTick : setTimeout;

function nextTick(callback: Function) {
    nextTickPointer(callback);
}

function internalNextTick(callback: Function) {
    callbacks.push(callback);
    //setTimeout(runTicks, 0);
    nextTickFunction.call(null, runTicks, 0);
}

function addCallback(callback: Function) {
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
    } finally {
        nextTickPointer = internalNextTick;
    }
}
