# core-promise

A promise implementation that is fully conformant to the [Promises/A+ spec](https://github.com/promises-aplus/promises-spec),
passing all the 872 tests from the [reference tests](https://github.com/promises-aplus/promises-tests).
Comes with full TypeScript support.


And works from IE8+ without any dependency. (`bower install core-promise`)


On IE9 only 2 tests are failing (for strict functions the this comes as the `window` object
instead of `undefined` - this is a browser bug).


On IE8 multiple tests are failing due to the way the tests themselves are written
(calling `Object.create`, using properties, etc. that the shims are not implementing fully).


Note that the implementation of `CorePromise` itself is compield in pure ES3 JavaScript, and doesn't need
*any* polyfill, and is literally the tests implementation that fails, and not `core-promise` itself.

## IE8, IE9.. Usage

First you will need to fetch the implementation of the promises via bower:

```
bower install core-promise
```

Just include it in the `<head>` of your page a reference to the core-promise js file:

```html
<head>
  <!-- the file is standalone, and has no dependencies -->
  <script type="text/javascript" src="core-promise.js"/>
</head>
```

## Usage in Node

The recommended way to use the `core-promise` is to use the Promise class, that
will use the native Promise class if it is available (e.g. from node 0.12 up).

```javascript
var Promise = require('core-promise').Promise,
    CorePromise = require('core-promise').CorePromise;

// ..
// Create new promises with:

var p = new Promise(function(fulfill, reject)) {
    //..
};
```

## Node with TypeScript

If you use TypeScript, then you should know that the core-promise bundles
the definition file inside the module. So in order for you to get autocomplete,
error checking etc, just add a reference to it, like so: 

```typescript
/// <reference path="node_modules/core-promise/core-promise.d.ts"/>

import core = require("core-promise");
import Promise = core.Promise;

Promise.resolve("core-promise")
    .then((x : number) => { // compile error, resolve returns a string
        console.log(x);
    });
```

## ChangeLog

* 2015-07-02 v0.2.1 *BugFix* Added d.ts module file. Recompiled bower client.
* 2015-07-01 v0.2.0 ES6 compatible functions added (resolve, all, race, reject).
* 2015-06-30 v0.1.3 Documentation.
* 2015-06-30 v0.1.2 *BugFix* `setTimeout` call it via `()` not `.call` for IE8
* 2015-06-30 v0.1.1 Browserify browser tests via mocha.
* 2015-06-30 v0.1.0 Promises/A+ 1.1 compatible.
