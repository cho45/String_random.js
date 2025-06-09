#!/usr/bin/env node

import assert from 'assert';
import { String_random } from '../lib/String_random.js';
import test from 'node:test';

test('throws on unsupported regexp: \\b', (t) => {
  assert.throws(() => {
    String_random(/aa\bcc/);
  });
});

test('throws on unsupported regexp: \\B', (t) => {
  assert.throws(() => {
    String_random(/aa\Bcc/);
  });
});

test('throws on unsupported regexp: negative lookahead', (t) => {
  assert.throws(() => {
    String_random(/(?!foo).../);
  });
});

test('throws on invalid regexp string', (t) => {
  assert.throws(() => {
    String_random('(aaa');
  });
});

const patterns = [
  /^$/,
  /^\$/, // no warnings
  /^\d{4}$/,
  /^\w{4}$/,
  /^\D{4}$/,
  /^\W{4}$/,
  /^\w{1,}$/,
  /^\w{1,2}$/,
  /^[\d]$/,
  /^[abc]+$/,
  /^[a|b]+$/,
  /^[^\W]+$/,
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
  /^((a|b)c)$/,
  /^(()a)$/,
  /^(aa|bb)$/,
  /^(aa|bb(cc|dd))$/,
  /^(a(xx|yy)a|bb(cc|dd))$/,
  /^http:\/\/[a-z]{3,8}\.example\.com\/([a-z\d]+\/){3}$/,
  /(?:<(p|div) title="[^"]+">[^<]+<\/\1>)+/,
  /^[カコ][ッー]{1,3}?[フヒ]{1,3}[ィェー]{1,3}[ズス][クグュ][リイ][プブ]{1,3}[トドォ]{1,2}$/,
  /(aa|(bb|cc))\1\2/
];

test('pattern generation and matching', (t) => {
  for (let x = 0, pattern; (pattern = patterns[x]); x++) {
    for (let i = 0; i < 1000; i++) {
      const val = String_random(pattern);
      // console.log(val + ' ');
      assert.ok(pattern.test(val), pattern.source + ' -> ' + val + '');
    }
    // console.log('\n\n');
  }
});
