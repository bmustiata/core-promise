#!/usr/bin/env bash

fast-live-reload -nc -ns -ep "tsc -w src/main/node/exports.ts --out lib/core-promise.js" test/ lib/ -e "mocha test/test_promise.js"

