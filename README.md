String_random.js
==================

https://github.com/cho45/String_random.js

String_random.js is for generating random string from regexp pattern.


SYNOPSIS
========

```

String.random = require('String_random').String_random; // or use String_random directory;

var randomString = String.random(/\d\d\d/);
console.log(randomString); //=> "000", "010", "432" or etc...

```
