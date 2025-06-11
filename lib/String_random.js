function String_random (pattern, options) {
	if (pattern instanceof RegExp) pattern = pattern.source;
	const random = options && options.random || Math.random;

	function processGrouping (pattern) {
		const tree  = [];
		const stack = [ tree ];
		let n = 1;
		while (pattern.length) {
			const chr = pattern.shift();
			if (chr === '\\') {
				const next = pattern.shift();
				if (next === '(' || next === ')') {
					stack[0].push(next);
				} else {
					stack[0].push(chr, next);
				}
			} else
			if (chr === '(') {
				const inner = [];
				stack[0].push(inner);
				stack.unshift(inner);

				let next = pattern.shift(); // no warnings
				if (next === '?') {
					next = pattern.shift();
					if (next === ':') {
						// just create a group
					} else {
						throw Error("Invalid group");
					}
				} else
				if (next === '(' || next === ')') {
					pattern.unshift(next);
				} else {
					inner.n = n++;
					inner.push(next);
				}
			} else
			if (chr === ')') {
				stack.shift();
			} else {
				stack[0].push(chr);
			}
		}

		if (stack.length > 1) throw Error("mismatch paren");

		return tree;
	}

	function processSelect (tree) {
		const candidates = [ [] ];

		while (tree.length) {
			let chr = tree.shift();
			if (chr === '\\') {
				const next = tree.shift();
				if (next === '|') {
					candidates[0].push(next);
				} else {
					candidates[0].push(chr, next);
				}
			} else
			if (chr === '[') {
				candidates[0].push(chr);
				while (tree.length) {
					chr = tree.shift();
					candidates[0].push(chr);
					if (chr === '\\') {
						const next = tree.shift(); // no warnings
						candidates[0].push(next);
					} else
					if (chr === ']') {
						break;
					}
				}
			} else
			if (chr === '|') {
				candidates.unshift([]);
			} else {
				candidates[0].push(chr);
			}
		}

		for (let i = 0, it; (it = candidates[i]); i++) {
			tree.push(it);
			for (let j = 0, len = it.length; j < len; j++) {
				if (it[j] instanceof Array) {
					processSelect(it[j]);
				}
			}
		}

		// 入れ子、 奇数段が pattern 偶数段が candidates,
		return [ tree ];
	}

	const UPPERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	const LOWERS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
	const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	const SPACES = [" ", "\n", "\t"];
	const OTHERS = ["!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "`", "{", "|", "}", "~"];
	const ALL    = [].concat(UPPERS, LOWERS, DIGITS, " ", OTHERS, ["_"]);

	const CLASSES = {
		'd' : DIGITS,
		'D' : [].concat(UPPERS, LOWERS, SPACES, OTHERS, ['_']),
		'w' : [].concat(UPPERS, LOWERS, DIGITS, ['_']),
		'W' : [].concat(SPACES, OTHERS),
		't' : [ '\t' ],
		'n' : [ '\n' ],
		'v' : [ '\u000B' ],
		'f' : [ '\u000C' ],
		'r' : [ '\r' ],
		's' : SPACES,
		'S' : [].concat(UPPERS, LOWERS, DIGITS, OTHERS, ['_']),
		'0' : [ '\0' ]
	};

	const REFERENCE = {};

	function processOthers (tree) {
		let ret = '', candidates = [];
		tree = tree.slice(0);

		function choice () {
			let ret = candidates[ Math.floor(candidates.length * random()) ];
			if (ret instanceof Array) {
				ret = processOthers(ret);
			}
			if (candidates.n) REFERENCE[candidates.n] = ret;
			return ret || '';
		}

		while (tree.length) {
			let chr = tree.shift();
			switch (chr) {
				case '^':
				case '$':
					// do nothing
					break;
				case '*':
					for (let i = 0, len = random() * 10; i < len; i++) {
						ret += choice();
					}
					candidates = [];
					break;
				case '+':
					for (let i = 0, len = random() * 10 + 1; i < len; i++) {
						ret += choice();
					}
					candidates = [];
					break;
				case '{':
					let brace = '';
					while (tree.length) {
						chr = tree.shift();
						if (chr === '}') {
							break;
						} else {
							brace += chr;
						}
					}

					if (chr !== '}') throw Error(`missmatch brace: ${chr}`);

					const dd = brace.split(/,/);
					const min = +dd[0];
					const max = (dd.length === 1) ? min : (+dd[1] || 10);
					for (let i = 0, len = Math.floor(random() * (max - min + 1)) + min; i < len; i++) {
						ret += choice();
					}
					candidates = [];
					break;
				case '?':
					if (random() < 0.5) {
						ret += choice();
					}
					candidates = [];

					break;

				case '\\':
					ret += choice();
					const escaped = tree.shift();

					if (escaped.match(/^[1-9]$/)) {
						candidates = [ REFERENCE[escaped] || '' ];
					} else {
						if (escaped === 'b' || escaped === 'B') {
							throw Error(`\\b and \\B is not supported`);
						}
						candidates = CLASSES[escaped];
					}

					if (!candidates) candidates = [ escaped ];

					break;
				case '[':
					ret += choice();

					let sets = [], negative = false;
					while (tree.length) {
						chr = tree.shift();
						if (chr === '\\') {
							const next = tree.shift();
							if (CLASSES[next]) {
								sets = sets.concat(CLASSES[next]);
							} else {
								sets.push(next);
							}
						} else
						if (chr === ']') {
							break;
						} else
						if (chr === '^') {
							const before = sets[ sets.length - 1];
							if (!before) {
								negative = true;
							} else {
								sets.push(chr);
							}
						} else
						if (chr === '-') {
							const next = tree.shift(); // no warnings
							if (next === ']') {
								sets.push(chr);
								chr = next;
								break;
							}
							const before = sets[ sets.length - 1]; // no warnings
							if (!before) {
								sets.push(chr);
							} else {
								for (let i = before.charCodeAt(0) + 1, len = next.charCodeAt(0); i < len; i++) {
									sets.push(String.fromCharCode(i));
								}
							}
						} else {
							sets.push(chr);
						}
					}
					if (chr !== ']') throw "missmatch bracket: " + chr;

					if (negative) {
						const neg = {};
						for (let i = 0, len = sets.length; i < len; i++) {
							neg[sets[i]] = true;
						}

						candidates = [];
						for (let i = 0, len = ALL.length; i < len; i++) {
							if (!neg[ALL[i]]) candidates.push(ALL[i]);
						}
					} else {
						candidates = sets;
					}
					break;
				case '.':
					ret += choice();
					candidates = ALL;
					break;
				default:
					ret += choice();
					candidates = chr;
			}
		}
		return ret + choice();
	}

	let tree;
	tree = processGrouping(pattern.split(''));
	tree = processSelect(tree);
	return processOthers(tree);
}

export { String_random };
