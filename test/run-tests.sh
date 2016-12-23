#!/bin/bash
mocha "test/graph/specs/**/*.test.js" "test/js/specs/**/*.test.js" --require test/setup.js --compilers js:babel-register
