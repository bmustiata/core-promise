# core-promise

A promise implementation that is fully conformant to the [Promises/A+ spec](https://github.com/promises-aplus/promises-spec),
passing all the 872 tests from the [reference tests](https://github.com/promises-aplus/promises-tests).


And works from IE8+ without any dependency. (`bower install core-promise`)


On IE9 only 2 tests are failing (for strict functions the this comes as the `window` object
instead of `undefined` - this is a browser bug).


On IE8 multiple tests are failing due to the way the tests themselves are written
(calling `Object.create`, using properties, etc. that the shims are not implementing fully).


Note that the implementation of `CorePromise` itself is compield in pure ES3 JavaScript, and doesn't need
*any* polyfill.

## Usage

The recommended way to use the `core-promise` is to use the Promise class, that
will use the native Promise class if it is available.

```javascript
var Promise = require('core-promise').Promise,
    CorePromise = require('core-promise').CorePromise;

// ..
// Create new promises with:

var p = new Promise(function(fulfill, reject)) {
    //..
};
```

## ChangeLog

* 2015-06-30 v0.1.1 Browserify browser tests via mocha.
* 2015-06-30 v0.1.0 Promises/A+ 1.1 compatible.
