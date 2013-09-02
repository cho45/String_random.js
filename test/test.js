#!/usr/bin/env node

var assert = require('assert');

String.random = require('../lib/String_random.js').String_random;

var patterns = [
	/aa|bb/,
	/(aa|bb)/,
	/(aa|bb(cc|dd))/,
	/(a(xx|yy)a|bb(cc|dd))/
];

for (var x = 0, pattern; (pattern = patterns[x]); x++) {
	var pattern = /aa|bb/;
	for (var i = 0; i < 1000; i++) {
		var val = String.random(pattern.source);
		assert.ok(pattern.test(val), pattern.source + ' -> ' + val + '');
	}
}

