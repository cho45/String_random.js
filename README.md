String_random.js
==================

https://github.com/cho45/String_random.js

String_random.js is for generating random string from regexp pattern.


SYNOPSIS
========

```
var randomString = String_random(/\d\d\d/);
console.log(randomString); //=> "000", "010", "432" or etc...

```

SUPPRTED SYNTAXES
=================

 * `*` `+` `?` `{n,n}`: quantifier
 * `.` : generating following: `[a-zA-Z0-9 !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]`
 * `[ .. ]` : character class (also supports range with `-` but does not supports `^`)
 * `( .. )` : simple grouping
 * `|` : alternative

WILL NOT SUPPRT
===============

 * `^` : beginning of line
 * `$` : end of line
 * `\b` `\B`

