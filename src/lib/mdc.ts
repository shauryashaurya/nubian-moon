// Manuel de Codage (MdC) Translation Pipeline

// 1. Core Sign Mappings (Expanded with common Biliterals, Triliterals, and Determinatives)
const TRANSLIT_TO_GARDINER: Record<string, string> = {
	"3": "G1",
	i: "M17",
	y: "M17a",
	a: "D36",
	w: "G43",
	b: "D58",
	p: "Q3",
	f: "I9",
	m: "G17",
	n: "N35",
	r: "D21",
	h: "O4",
	H: "V28",
	x: "Aa1",
	X: "F32",
	s: "S29",
	z: "O34",
	S: "N37",
	q: "N29",
	k: "V31",
	g: "W11",
	t: "X1",
	T: "V13",
	d: "D46",
	D: "I10",
};

const GARDINER_TO_UNICODE: Record<string, string> = {
	// Uniliterals
	G1: "\u{1313F}",
	M17: "\u{131CB}",
	M17a: "\u{131CC}",
	D36: "\u{1309D}",
	G43: "\u{13171}",
	D58: "\u{130C0}",
	Q3: "\u{132AA}",
	I9: "\u{13191}",
	G17: "\u{13153}",
	N35: "\u{13216}",
	D21: "\u{1308B}",
	O4: "\u{13254}",
	V28: "\u{1339B}",
	Aa1: "\u{1340D}",
	F32: "\u{13121}",
	S29: "\u{132F4}",
	O34: "\u{13283}",
	N37: "\u{13219}",
	N29: "\u{1320E}",
	V31: "\u{133A1}",
	W11: "\u{133BC}",
	X1: "\u{133CF}",
	V13: "\u{1337F}",
	D46: "\u{130A7}",
	I10: "\u{13193}",
	// Dictionary Specific Signs (Biliterals, Triliterals, Determinatives)
	M23: "\u{131F8}", // swt (king)
	G7: "\u{13145}", // falcon on standard (divine/royal determinative)
	E13: "\u{130EA}", // cat determinative
	N5: "\u{131F3}", // sun (Ra)
	Z1: "\u{133E4}", // stroke
	S34: "\u{132F9}", // ankh (life)
	O1: "\u{13250}", // pr (house)
	O29: "\u{13271}", // aA (column)
	Y1: "\u{133F2}", // papyrus roll (abstract determinative)
};

const DIGIT_UNICODE: Record<string, string> = {
	"0": "\u{13361}",
	"1": "\u{13362}",
	"2": "\u{13363}",
	"3": "\u{13364}",
	"4": "\u{13365}",
	"5": "\u{13366}",
	"6": "\u{13367}",
	"7": "\u{13368}",
	"8": "\u{13369}",
	"9": "\u{1336A}",
};

// 2. English Heuristics
const DIGRAPH_TO_TRANSLIT: Array<[string, string]> = [
	["sh", "S"],
	["ch", "S"],
	["kh", "x"],
	["th", "t"],
	["ph", "f"],
	["gh", "g"],
	["qu", "qw"],
	["ng", "ng"],
	["ck", "k"],
	["wh", "w"],
	["tj", "T"],
	["dj", "D"],
];

const LETTER_TO_TRANSLIT: Record<string, string> = {
	a: "3",
	b: "b",
	c: "k",
	d: "d",
	e: "i",
	f: "f",
	g: "g",
	h: "h",
	i: "i",
	j: "D",
	k: "k",
	l: "r",
	m: "m",
	n: "n",
	o: "w",
	p: "p",
	q: "q",
	r: "r",
	s: "s",
	t: "t",
	u: "w",
	v: "f",
	w: "w",
	x: "x",
	y: "y",
	z: "z",
};

// 3. Real Egyptian Translation Dictionary
// Uses MdC operators: ':' stacks vertically, '*' places side-by-side
const DICTIONARY: Record<string, { translit: string; mdc: string }> = {
	king: { translit: "nsw", mdc: "M23:X1*G7" },
	cat: { translit: "mjw", mdc: "G17:M17*G43:E13" },
	sun: { translit: "ra", mdc: "D21:D36*N5:Z1" }, // Ra
	life: { translit: "anx", mdc: "S34" },
	pharaoh: { translit: "pr-aA", mdc: "O1:D36*O29:Y1" },
};

// 4. Data Structures
export interface Quadrat {
	rows: string[][]; // Outer array = stacked vertically, Inner array = placed horizontally
}

export type Group = { type: "quadrat"; quadrat: Quadrat } | { type: "space" };

export interface PipelineTrace {
	english: string;
	translit: string;
	gardiner: string;
	isDictMatch: boolean;
	finalSigns: string;
}

export interface MdCResult {
	groups: Group[];
	trace: PipelineTrace[];
}

function englishToTranslit(s: string): string {
	const lower = s.toLowerCase();
	let out = "";
	let i = 0;
	while (i < lower.length) {
		const pair = lower.slice(i, i + 2);
		const dg = DIGRAPH_TO_TRANSLIT.find(([k]) => k === pair);
		if (dg) {
			out += dg[1];
			i += 2;
			continue;
		}
		const ch = lower[i];
		if (DIGIT_UNICODE[ch]) {
			out += ch;
		} else if (LETTER_TO_TRANSLIT[ch]) {
			out += LETTER_TO_TRANSLIT[ch];
		}
		i += 1;
	}
	return out;
}

// 5. Parsers
function parseMdCString(mdc: string): Quadrat {
	const rowStrs = mdc.split(":"); // Split vertically
	const rows = rowStrs.map((r) => {
		const signs = r.split("*"); // Split horizontally
		return signs.map((s) => GARDINER_TO_UNICODE[s] || "");
	});
	return { rows };
}

function heuristicToQuadrat(translit: string): Quadrat {
	const signs = translit
		.split("")
		.map((ch) => {
			if (DIGIT_UNICODE[ch]) return DIGIT_UNICODE[ch];
			const code = TRANSLIT_TO_GARDINER[ch];
			return code ? GARDINER_TO_UNICODE[code] || "" : "";
		})
		.filter(Boolean);

	// Group into pairs of 2 to mimic natural historical stacking
	const rows: string[][] = [];
	for (let i = 0; i < signs.length; i += 2) {
		rows.push(signs.slice(i, i + 2));
	}
	return { rows };
}

export function renderMdC(text: string): MdCResult {
	if (!text) return { groups: [], trace: [] };

	const groups: Group[] = [];
	const trace: PipelineTrace[] = [];
	const words = text.split(/\s+/).filter((w) => w.length > 0);

	words.forEach((word, idx) => {
		if (idx > 0) groups.push({ type: "space" });

		const lowerWord = word.toLowerCase();

		// Check True Dictionary Match first
		if (DICTIONARY[lowerWord]) {
			const entry = DICTIONARY[lowerWord];
			const quadrat = parseMdCString(entry.mdc);
			groups.push({ type: "quadrat", quadrat });
			trace.push({
				english: word,
				translit: entry.translit,
				gardiner: entry.mdc,
				isDictMatch: true,
				finalSigns: quadrat.rows.flat().join(" "),
			});
			return;
		}

		// Fallback: Phonetic Heuristic with custom '|' grouping
		const chunks = word.split("|").filter((c) => c.length > 0);
		chunks.forEach((chunk) => {
			const translit = englishToTranslit(chunk);
			const gardinerArr = translit
				.split("")
				.map((ch) => TRANSLIT_TO_GARDINER[ch])
				.filter(Boolean);
			const quadrat = heuristicToQuadrat(translit);

			if (quadrat.rows.length > 0) {
				groups.push({ type: "quadrat", quadrat });
				trace.push({
					english: chunk,
					translit: translit,
					gardiner: gardinerArr.join("*"), // Pseudo-MdC for display
					isDictMatch: false,
					finalSigns: quadrat.rows.flat().join(" "),
				});
			}
		});
	});

	return { groups, trace };
}

// OLD VERSION (DEFUNCT)
// // Manuel de Codage (MdC) inspired pipeline.
// //
// // Pipeline stages:
// //   1. English text -> Egyptian transliteration (digraph-aware heuristic).
// //      Egyptian had no /l/ phoneme; we substitute 'r' (a common practice
// //      for foreign names in Egyptological writing).
// //   2. Transliteration -> Gardiner sign code (uniliteral signs only).
// //   3. Gardiner code -> Unicode codepoint in the U+13000..U+1342F block.
// //   4. Quadrats: the user can split a word with '|' to mark sign-group
// //      boundaries. Each chunk becomes one visually-grouped quadrat at
// //      render time.
// //
// // This is intentionally a small subset of the full MdC specification.
// // Future work: full MdC operator parser ('-', ':', '*', '!'), determinatives,
// // biliteral/triliteral lookups, and constraint-based quadrat packing.

// // Standard Egyptological transliteration -> Gardiner uniliteral sign code.
// // Symbols use ASCII proxies common in MdC tooling:
// //   '3' = aleph, 'a' = ayin, 'H' = h-dot, 'x' = kh, 'X' = h-bar, 'S' = sh,
// //   'T' = tj, 'D' = dj.
// const TRANSLIT_TO_GARDINER: Record<string, string> = {
//   '3': 'G1',
//   'i': 'M17',
//   'y': 'M17a',
//   'a': 'D36',
//   'w': 'G43',
//   'b': 'D58',
//   'p': 'Q3',
//   'f': 'I9',
//   'm': 'G17',
//   'n': 'N35',
//   'r': 'D21',
//   'h': 'O4',
//   'H': 'V28',
//   'x': 'Aa1',
//   'X': 'F32',
//   's': 'S29',
//   'z': 'O34',
//   'S': 'N37',
//   'q': 'N29',
//   'k': 'V31',
//   'g': 'W11',
//   't': 'X1',
//   'T': 'V13',
//   'd': 'D46',
//   'D': 'I10',
// };

// // Gardiner sign code -> Unicode hieroglyph codepoint.
// const GARDINER_TO_UNICODE: Record<string, string> = {
//   'G1': '\u{1313F}',
//   'M17': '\u{131CB}',
//   'M17a': '\u{131CC}',
//   'D36': '\u{1309D}',
//   'G43': '\u{13171}',
//   'D58': '\u{130C0}',
//   'Q3': '\u{132AA}',
//   'I9': '\u{13191}',
//   'G17': '\u{13153}',
//   'N35': '\u{13216}',
//   'D21': '\u{1308B}',
//   'O4': '\u{13254}',
//   'V28': '\u{1339B}',
//   'Aa1': '\u{1340D}',
//   'F32': '\u{13121}',
//   'S29': '\u{132F4}',
//   'O34': '\u{13283}',
//   'N37': '\u{13219}',
//   'N29': '\u{1320E}',
//   'V31': '\u{133A1}',
//   'W11': '\u{133BC}',
//   'X1': '\u{133CF}',
//   'V13': '\u{1337F}',
//   'D46': '\u{130A7}',
//   'I10': '\u{13193}',
// };

// const DIGIT_UNICODE: Record<string, string> = {
//   '0': '\u{13361}', '1': '\u{13362}', '2': '\u{13363}', '3': '\u{13364}',
//   '4': '\u{13365}', '5': '\u{13366}', '6': '\u{13367}', '7': '\u{13368}',
//   '8': '\u{13369}', '9': '\u{1336A}',
// };

// // English digraphs -> transliteration tokens.
// // Order matters when overlapping digraphs share a prefix; longest first.
// const DIGRAPH_TO_TRANSLIT: Array<[string, string]> = [
//   ['sh', 'S'],
//   ['ch', 'S'],
//   ['kh', 'x'],
//   ['th', 't'],
//   ['ph', 'f'],
//   ['gh', 'g'],
//   ['qu', 'qw'],
//   ['ng', 'ng'],
//   ['ck', 'k'],
//   ['wh', 'w'],
//   ['tj', 'T'], // ADDED tj mapping
//   ['dj', 'D'], // ADDED dj mapping
// ];

// // Single English letter -> transliteration token.
// const LETTER_TO_TRANSLIT: Record<string, string> = {
//   'a': '3', 'b': 'b', 'c': 'k', 'd': 'd', 'e': 'i',
//   'f': 'f', 'g': 'g', 'h': 'h', 'i': 'i', 'j': 'D',
//   'k': 'k', 'l': 'r', 'm': 'm', 'n': 'n', 'o': 'w',
//   'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't',
//   'u': 'w', 'v': 'f', 'w': 'w', 'x': 'x', 'y': 'y',
//   'z': 'z',
// };

// export interface Quadrat {
//   signs: string[];
// }

// export type Group =
//   | { type: 'quadrat'; quadrat: Quadrat }
//   | { type: 'space' };

// // English chunk -> transliteration string.
// function englishToTranslit(s: string): string {
//   const lower = s.toLowerCase();
//   let out = '';
//   let i = 0;
//   while (i < lower.length) {
//     const pair = lower.slice(i, i + 2);
//     const dg = DIGRAPH_TO_TRANSLIT.find(([k]) => k === pair);
//     if (dg) {
//       out += dg[1];
//       i += 2;
//       continue;
//     }
//     const ch = lower[i];
//     if (DIGIT_UNICODE[ch]) {
//       out += ch;
//     } else if (LETTER_TO_TRANSLIT[ch]) {
//       out += LETTER_TO_TRANSLIT[ch];
//     }
//     i += 1;
//   }
//   return out;
// }

// // Transliteration string -> Unicode hieroglyph signs (one per token).
// function translitToSigns(t: string): string[] {
//   const signs: string[] = [];
//   for (const ch of t) {
//     if (DIGIT_UNICODE[ch]) {
//       signs.push(DIGIT_UNICODE[ch]);
//       continue;
//     }
//     const code = TRANSLIT_TO_GARDINER[ch];
//     if (code) {
//       const u = GARDINER_TO_UNICODE[code];
//       if (u) signs.push(u);
//     }
//   }
//   return signs;
// }

// // Full pipeline: text with optional pipe-separated syllables -> Group[].
// // Each whitespace-separated word breaks into chunks on '|'; each chunk
// // renders as one quadrat. Words are separated by a 'space' group.
// export function renderMdC(text: string): Group[] {
//   if (!text) return [];
//   const out: Group[] = [];
//   const words = text.split(/\s+/).filter(w => w.length > 0);
//   words.forEach((word, idx) => {
//     if (idx > 0) out.push({ type: 'space' });
//     const chunks = word.split('|').filter(c => c.length > 0);
//     chunks.forEach(chunk => {
//       const signs = translitToSigns(englishToTranslit(chunk));
//       if (signs.length > 0) {
//         out.push({ type: 'quadrat', quadrat: { signs } });
//       }
//     });
//   });
//   return out;
// }
