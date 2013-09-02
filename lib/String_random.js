function String_random (pattern) {
	if (pattern instanceof RegExp) pattern = pattern.source;
	pattern = pattern.replace(/^\^|\$$/g, '');

	function processGrouping (pattern) {
		var tree  = [];
		var stack = [ tree ];
		while (pattern.length) {
			var chr = pattern.shift();
			if (chr === '\\') {
				var next = pattern.shift();
				if (next === '(' || next === ')') {
					stack[0].push(next);
				} else {
					stack[0].push(chr, next);
				}
			} else
			if (chr === '(') {
				var inner = [];
				stack[0].push(inner);
				stack.unshift(inner);
			} else
			if (chr === ')') {
				stack.shift();
			} else {
				stack[0].push(chr);
			}
		}

		return tree;
	}

	function processSelect (tree) {
		var candinates = [ [] ];

		while (tree.length) {
			var chr = tree.shift();
			if (chr === '\\') {
				var next = tree.shift();
				if (next === '|') {
					candinates[0].push(next);
				} else {
					candinates[0].push(chr, next);
				}
			} else
			if (chr === '|') {
				candinates.unshift([]);
			} else {
				candinates[0].push(chr);
			}
		}

		for (var i = 0, it; (it = candinates[i]); i++) {
			tree.push(it);
			for (var j = 0, len = it.length; j < len; j++) {
				if (it[j] instanceof Array) {
					processSelect(it[j]);
				}
			}
		}

		// 入れ子、 奇数段が pattern 偶数段が candinates,
		return [ tree ];
	}

	var UPPERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	var LOWERS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
	var DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	var OTHERS = [" ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "`", "{", "|", "}", "~"];
	var ALL    = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"];
	var WORDS  = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "_"];

	var CLASSES = {
		'd' : DIGITS,
		'D' : [].concat(UPPERS, LOWERS, OTHERS, ['_']),
		'w' : [].concat(UPPERS, LOWERS, DIGITS, ['_']),
		'W' : [].concat(OTHERS),
		'n' : [ '\n' ],
		't' : [ '\t' ],
		's' : [' ', '\t', '\n']
	};

	function processOthers (tree) {
		var ret = '', candinates = [];

		function choice () {
			var ret = candinates[ Math.floor(candinates.length * Math.random()) ];
			if (ret instanceof Array) {
				ret = processOthers(ret);
			}
			return ret || '';
		}

		while (tree.length) {
			var chr = tree.shift();
			switch (chr) {
				case '*':
					for (var i = 0, len = Math.random() * 10; i < len; i++) {
						ret += choice();
					}
					candinates = [];
					break;
				case '+':
					for (var i = 0, len = Math.random() * 10 + 1; i < len; i++) {
						ret += choice();
					}
					candinates = [];
					break;
				case '{':
					var brace = '';
					while (tree.length) {
						chr = tree.shift();
						if (chr === '}') {
							break;
						} else {
							brace += chr;
						}
					}

					var dd = brace.split(/,/);
					var min = +dd[0];
					var max = (dd.length === 1) ? min : (+dd[1] || 10);
					for (var i = 0, len = Math.random() * (max - min) + min; i < len; i++) {
						ret += choice();
					}
					candinates = [];
					break;
				case '?':
					if (Math.random() < 0.5) {
						ret += choice();
					}
					candinates = [];

					break;

				case '\\':
					ret += choice();
					var escaped = tree.shift();
					candinates = CLASSES[escaped];

					if (!candinates) candinates = [ escaped ];

					break;
				case '[':
					ret += choice();

					var sets = [];
					while (tree.length) {
						chr = tree.shift();
						if (chr === '\\') {
							sets.push(tree.shift());
						} else
						if (chr === ']') {
							break;
						} else
						if (chr === '^') {
							console.log('hat');
							var before = sets[ sets.length - 1];
							if (!before) {
								throw "negative character class is not supported";
							} else {
								sets.push(chr);
							}
						} else
						if (chr === '-') {
							var next = tree.shift();
							if (next === ']') {
								sets.push(chr);
								break;
							}
							var before = sets[ sets.length - 1]; // no warnings
							if (!before) {
								sets.push(chr);
							} else {
								for (var i = before.charCodeAt(0) + 1, len = next.charCodeAt(0); i < len; i++) {
									sets.push(String.fromCharCode(i));
								}
							}
						} else {
							sets.push(chr);
						}
					}
					candinates = sets;
					break;
				case '.':
					ret += choice();
					candinates = ALL;
					break;
				default:
					ret += choice();
					candinates = chr;
			}
		}
		return ret + choice();
	}

	var tree;
	tree = processGrouping(pattern.split(''));
	tree = processSelect(tree);
	return processOthers(tree);
}

this.String_random = String_random;
