#!/usr/bin/env node

import assert from 'assert';
import { String_random } from '../lib/String_random.js';
import test from 'node:test';

// シード付き乱数生成器（Xorshift32）
function seededRandom(seed) {
  let x = seed >>> 0;
  return function() {
    // Xorshift32アルゴリズム
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0x100000000;
  };
}
const random = seededRandom(42);

test('throws on unsupported regexp: \\b', (t) => {
  assert.throws(() => {
    String_random(/aa\bcc/, { random });
  });
});

test('throws on unsupported regexp: \\B', (t) => {
  assert.throws(() => {
    String_random(/aa\Bcc/, { random });
  });
});

test('throws on unsupported regexp: negative lookahead', (t) => {
  assert.throws(() => {
    String_random(/(?!foo).../, { random });
  });
});

test('throws on invalid regexp string', (t) => {
  assert.throws(() => {
    String_random('(aaa', { random });
  });
});


test('SYNOPSIS example: generates 3-digit string', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/\d\d\d/, { random });
    assert.match(val, /^\d{3}$/);
  }
});

test('quantifier: * (zero or more)', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/a*/, { random });
    assert.match(val, /^a*$/);
  }
});

test('quantifier: + (one or more)', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/a+/, { random });
    assert.match(val, /^a+$/);
    assert.ok(val.length >= 1);
  }
});

test('quantifier: ? (zero or one)', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/a?/, { random });
    assert.match(val, /^a?$/);
    assert.ok(val.length <= 1);
  }
});

test('quantifier: {n,n} (range)', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/a{2,4}/, { random });
    assert.match(val, /^a{2,4}$/);
    assert.ok(val.length >= 2 && val.length <= 4);
  }
});

test('dot: . matches any allowed char', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/.../, { random });
    assert.strictEqual(val.length, 3);
    assert.match(val, /^[a-zA-Z0-9 !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{3}$/);
  }
});

test('character class: [abc]', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/[abc]{5}/, { random });
    assert.match(val, /^[abc]{5}$/);
  }
});

test('character class: [1-2]', (t) => {
  const random = seededRandom(42);
  const val = String_random(/[1-2]{5}/, { random });
  assert.strictEqual(val, '21222');
});

test('character class: range [a-z]', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/[a-z]{3}/, { random });
    assert.match(val, /^[a-z]{3}$/);
  }
});

test('quantifier: {n} (fixed)', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/a{5}/, { random });
    assert.match(val, /^a{5}$/);
    assert.strictEqual(val.length, 5);
  }
});

test('throws on invalid bracket', (t) => {
  assert.throws(() => {
    String_random('[abc', { random });
  });
});

test('throws on invalid brace', (t) => {
  assert.throws(() => {
    String_random('a{2,', { random });
  });
});

test('backreference: (a)(b)\\2\\1', (t) => {
  for (let i = 0; i < 100; i++) {
    const val = String_random(/(a)(b)\2\1/, { random });
    assert.match(val, /^abba$/);
  }
});

test('throws on unsupported regexp: positive lookahead', (t) => {
  assert.throws(() => {
    String_random(/(?=foo).../, { random });
  });
});

test('throws on unsupported regexp: lookbehind', (t) => {
  assert.throws(() => {
    String_random(/(?<=foo).../, { random });
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
      const val = String_random(pattern, { random });
      // console.log(val + ' ');
      assert.ok(pattern.test(val), pattern.source + ' -> ' + val + '');
    }
    // console.log('\n\n');
  }
});
