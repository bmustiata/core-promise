# core-promise

A promise implementation that is fully conformant to the [Promises/A+ spec](https://github.com/promises-aplus/promises-spec),
passing all the 872 tests from the [reference tests](https://github.com/promises-aplus/promises-tests).

And works from IE8+ without any dependency. (`bower install core-promise`)

## Usage

```javascript
var Promise = require('core-promise').Promise,
    CorePromise = require('core-promise').CorePromise;

// Promise will default to the platform Promise if it exists
// e.g. in node 0.12, it will be node's own promise, otherwise
// it will be the internal implementation: CorePromise

// ..
// Create new promises with:

var p = new Promise(function(fulfill, reject)) {
    //..
};
```

## ChangeLog

* 2015-06-30 v0.1.0 Promises/A+ 1.1 compatible.
