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
	/^[\d]$/,
	/^[abc]+$/,
	/^[$-]+$/, // no warnings
	/^[a-c]+$/, // no warnings
	/^[a\-c]+$/, // no warnings
	/^\d{1,3}(,\d{3})*$/,
	/^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/,
	/^ab?$/,
	/^ab*$/,
	/^...$/,
	/^aa|bb$/,
	/^(a|b)$/,
	/^(aa|bb)$/,
	/^(aa|bb(cc|dd))$/,
	/^(a(xx|yy)a|bb(cc|dd))$/,
	/http:\/\/[a-z]{3,8}\.example\.com\/([a-z\d]+\/){3}/,
	/(?:<(p|div)>foo<\/\1>)+/,
	/(aa|(bb|cc))\1\2/
];

for (var x = 0, pattern; (pattern = patterns[x]); x++) {
	for (var i = 0; i < 1000; i++) {
		var val = String.random(pattern);
		util.print(val + ' ');
		assert.ok(pattern.test(val), pattern.source + ' -> ' + val + '');
	}
	util.print('\n\n');
}
