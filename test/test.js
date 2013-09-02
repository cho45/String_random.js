#!/usr/bin/env node

var assert = require('assert');
var util = require('util');

String.random = require('../lib/String_random.js').String_random;

assert.throws(function () {
	String.random('[^not]');
});

var patterns = [
	/^$/,
	/^\d{4}$/,
	/^\w{4}$/,
	/^\D{4}$/,
	/^\W{4}$/,
	/^\w{1,}$/,
	/^\w{1,2}$/,
	/^[abc]+$/,
	/^[$-]+$/, // no warnings
	/^[a-c]+$/, // no warnings
	/^[a\-c]+$/, // no warnings
	/^ab?$/,
	/^ab*$/,
	/^...$/,
	/^aa|bb$/,
	/^(aa|bb)$/,
	/^(aa|bb(cc|dd))$/,
	/^(a(xx|yy)a|bb(cc|dd))$/
];

for (var x = 0, pattern; (pattern = patterns[x]); x++) {
	for (var i = 0; i < 1000; i++) {
		var val = String.random(pattern);
		util.print(val + ' ');
		assert.ok(pattern.test(val), pattern.source + ' -> ' + val + '');
	}
	util.print('\n\n');
}

