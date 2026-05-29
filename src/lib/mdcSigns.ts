// Sign inventory: Gardiner code -> Unicode hieroglyph (U+13000..U+1342F block).
// Sources: Unicode 5.2 Egyptian Hieroglyphs block, Gardiner Sign List.
//
// Categories follow Gardiner's letter prefixes:
//   A man, B woman, C anthropomorphic deity, D parts of human body, E mammal,
//   F parts of mammals, G bird, H parts of birds, I amphibian/reptile/etc,
//   K fish, L invertebrate/lesser animal, M tree/plant, N sky/earth/water,
//   O building/structure, P ship/boat, Q domestic furniture, R temple furniture,
//   S crown/dress/staff, T warfare/hunting, U agriculture/crafts, V rope/basketry,
//   W vessel of stone/earthenware, X bread/loaf, Y writing/games, Z stroke/etc,
//   Aa unclassified.

// Uniliteral signs (the alphabet). Used by all input modes.
export const UNILITERAL: Record<string, string> = {
  'G1': '\u{1313F}',    // Egyptian vulture, value '3' (aleph)
  'M17': '\u{131CB}',   // reed leaf, value 'i'
  'M17a': '\u{131CC}',  // double reed leaf, value 'y'
  'Z4': '\u{13386}',    // two strokes, value 'y' alt
  'D36': '\u{1309D}',   // arm, value 'a' (ayin)
  'G43': '\u{13171}',   // quail chick, value 'w'
  'Z7': '\u{13389}',    // coiled rope, value 'w' alt
  'D58': '\u{130C0}',   // foot, value 'b'
  'Q3': '\u{132AA}',    // stool, value 'p'
  'I9': '\u{13191}',    // horned viper, value 'f'
  'G17': '\u{13153}',   // owl, value 'm'
  'N35': '\u{13216}',   // water ripple, value 'n'
  'D21': '\u{1308B}',   // mouth, value 'r'
  'O4': '\u{13254}',    // reed shelter, value 'h'
  'V28': '\u{1339B}',   // wick of twisted flax, value 'H' (h-dot)
  'Aa1': '\u{1340D}',   // placenta, value 'x' (kh)
  'F32': '\u{13121}',   // animal belly with teats, value 'X' (h-bar)
  'S29': '\u{132F4}',   // folded cloth, value 's'
  'O34': '\u{13283}',   // door bolt, value 'z'
  'N37': '\u{13219}',   // pool, value 'S' (sh)
  'N29': '\u{1320E}',   // hill slope, value 'q'
  'V31': '\u{133A1}',   // basket with handle, value 'k'
  'W11': '\u{133BC}',   // jar stand, value 'g'
  'X1': '\u{133CF}',    // bread loaf, value 't'
  'V13': '\u{1337F}',   // tethering rope, value 'T' (tj)
  'D46': '\u{130A7}',   // hand, value 'd'
  'I10': '\u{13193}',   // cobra, value 'D' (dj)
};

// Biliteral signs (two consonants). One sign represents a 2-consonant value.
// Map is { transliteration -> Gardiner }, with the Gardiner row in a second map.
export const BILITERAL_TRANSLIT: Record<string, string> = {
  '3w': 'G35',
  '3b': 'F16',
  '3H': 'U7',
  '3x': 'G1',     // fallback
  '3s': 'M40',
  '3t': 'D8',
  'iw': 'E9',
  'ib': 'F34',
  'in': 'W25',
  'ir': 'D4',
  'is': 'M40',
  'it': 'U33',
  'aw': 'F40',
  'ab': 'F18',
  'an': 'D36',    // fallback
  'ap': 'G39',
  'wp': 'F13',
  'wn': 'E34',
  'wr': 'G36',
  'wD': 'V24',
  'b3': 'G29',
  'bH': 'F18',
  'p3': 'G40',
  'pH': 'F22',
  'pr': 'O1',
  'm3': 'U1',
  'mi': 'W19',
  'mn': 'Y5',
  'mr': 'U6',
  'mH': 'V22',
  'ms': 'F31',
  'mt': 'D52',
  'md': 'S43',
  'mw': 'N35a',
  'n3': 'M22a',
  'nb': 'V30',
  'nm': 'T34',
  'nn': 'M22a',
  'nh': 'M2',
  'nH': 'V28',    // shared
  'nD': 'Aa27',
  'r3': 'D21',    // shared
  'rw': 'E23',
  'hw': 'O4',     // shared
  'hp': 'S37',
  'hn': 'W24',
  'Hm': 'U36',
  'Hn': 'T3',
  'Hr': 'D2',
  'HD': 'T3',
  'xt': 'M3',
  'xn': 'W9',
  'xr': 'T28',
  'xa': 'N28',
  'Xn': 'F26',
  'Xr': 'T28',
  'sw': 'M23',
  'sn': 'T22',
  'sk': 'V29',
  'st': 'Q1',
  'sA': 'G39',
  'Sn': 'V7',
  'Sm': 'N40',
  'Sa': 'N20',
  'Sd': 'F30',
  'qd': 'Aa28',
  'kA': 'D28',
  'km': 'I6',
  'gm': 'G28',
  'gs': 'Aa13',
  'tA': 'N16',
  'ti': 'U33',    // shared
  'tm': 'U15',
  'tp': 'D1',
  'tr': 'M6',
  'TA': 'G47',
  'Tz': 'F1',
  'd3': 'V19',
  'dr': 'M36',
  'di': 'D37',
  'dw': 'N26',
  'Db': 'U28',
  'Dd': 'R11',
  'Dr': 'M36',
};

export const BILITERAL_UNICODE: Record<string, string> = {
  'G35': '\u{13145}',   // cormorant 'aq'
  'F16': '\u{1310F}',   // horn 'wp'/'ab'
  'U7': '\u{13367}',    // mr hoe (fallback)
  'M40': '\u{131F0}',   // bundle of reeds 'is'
  'D8': '\u{1306F}',    // encircling arms
  'E9': '\u{130E2}',    // newborn bubalis 'iw'
  'F34': '\u{13121}',   // heart 'ib'
  'W25': '\u{133D0}',   // pot with handles 'in'
  'D4': '\u{1307B}',    // eye 'ir'
  'U33': '\u{13390}',   // pestle 'ti'
  'F40': '\u{13129}',   // backbone with spinal cord 'Aw'
  'F18': '\u{13118}',   // tusk 'bH'
  'G39': '\u{1316E}',   // pintail duck 'sA'
  'F13': '\u{1310B}',   // horns 'wp'
  'E34': '\u{130FA}',   // hare 'wn'
  'G36': '\u{1316B}',   // swallow 'wr'
  'V24': '\u{13390}',   // cord on stick (fallback)
  'G29': '\u{13162}',   // saddle-billed stork 'bA'
  'G40': '\u{1316F}',   // duck flying 'pA'
  'F22': '\u{1311A}',   // hindquarters 'pH'
  'O1': '\u{13241}',    // house 'pr'
  'U1': '\u{13367}',    // sickle 'mA'
  'W19': '\u{133C9}',   // milk jug 'mi'
  'Y5': '\u{1340F}',    // senet board 'mn'
  'U6': '\u{1336C}',    // hoe 'mr'
  'V22': '\u{13399}',   // whip 'mH'
  'F31': '\u{13121}',   // skin tied (fallback)
  'D52': '\u{130A8}',   // phallus 'mt'
  'S43': '\u{13301}',   // walking stick 'md'
  'N35a': '\u{13218}',  // three water ripples 'mw'
  'M22a': '\u{131E2}',  // two rushes 'nn'
  'V30': '\u{1339E}',   // basket 'nb'
  'T34': '\u{13340}',   // butcher knife 'nm'
  'M2': '\u{131CD}',    // plant 'Hn'
  'Aa27': '\u{1341B}',  // unknown obj 'nD'
  'E23': '\u{130EE}',   // recumbent lion 'rw'
  'S37': '\u{132FE}',   // fan 'xw'
  'W24': '\u{133CD}',   // bowl 'nw'
  'U36': '\u{13373}',   // fuller's club 'Hm'
  'T3': '\u{1331C}',    // mace 'HD'
  'D2': '\u{13076}',    // face 'Hr'
  'M3': '\u{131CE}',    // branch 'xt'
  'W9': '\u{133C2}',    // stone jug 'xn'
  'T28': '\u{13338}',   // butcher's block 'xr'
  'N28': '\u{1320D}',   // sun on hill 'xa'
  'F26': '\u{1311E}',   // skin of goat 'Xn'
  'M23': '\u{131DA}',   // sedge 'sw'
  'T22': '\u{13334}',   // arrowhead 'sn'
  'V29': '\u{1339C}',   // swab 'sk'
  'Q1': '\u{132AE}',    // seat 'st'
  'V7': '\u{1338E}',    // loop 'Sn'
  'N40': '\u{13221}',   // walking legs (fallback)
  'N20': '\u{13208}',   // tongue of land 'Sa'
  'F30': '\u{13120}',   // water-skin 'Sd'
  'Aa28': '\u{1341C}',  // builder's level 'qd'
  'D28': '\u{1309F}',   // upraised arms 'kA'
  'I6': '\u{1318F}',    // crocodile skin 'km'
  'G28': '\u{13161}',   // ibis 'gm'
  'Aa13': '\u{13412}',  // segment 'gs'
  'N16': '\u{131FE}',   // land with grains 'tA'
  'U15': '\u{13379}',   // sledge 'tm'
  'D1': '\u{1306A}',    // head 'tp'
  'M6': '\u{131D1}',    // palm branch 'rnp/tr'
  'G47': '\u{13177}',   // duckling 'TA'
  'F1': '\u{130F6}',    // head of ox 'kA' (fallback)
  'V19': '\u{13393}',   // hobble 'mDt'
  'M36': '\u{131F3}',   // bundle of flax 'Dr'
  'D37': '\u{130A8}',   // hand giving (fallback)
  'N26': '\u{1320C}',   // two mountains 'dw'
  'U28': '\u{1337F}',   // fire-drill 'DA'
  'R11': '\u{132D8}',   // djed pillar 'Dd'
};

// Triliteral signs (three consonants). Less common but iconic.
export const TRILITERAL_TRANSLIT: Record<string, string> = {
  'anx': 'S34',         // ankh, 'life'
  'nfr': 'F35',         // lute, 'good/beautiful'
  'nTr': 'R8',          // flag, 'god'
  'Htp': 'R4',          // offering loaf on mat, 'peace'
  'wsr': 'F12',         // animal head and neck, 'powerful'
  'wAs': 'S40',         // was sceptre
  'wAH': 'U28',         // fire-drill (shared) 'enduring'
  'wAD': 'M13',         // papyrus stem 'fresh'
  'wDA': 'F36',         // 'prosperous'
  'snb': 'S29',         // 'healthy' (fallback to folded cloth)
  'aHa': 'P6',          // mast 'stand'
  'aSA': 'M12',         // lotus stem 'many'
  'aAa': 'O29',         // door bolt long 'great'
  'mAa': 'U5',          // sickle 'true'
  'mAa-xrw': 'A1',      // (sequence not single sign)
  'mwt': 'G14',         // vulture 'mother'
  'msi': 'F31',         // three fox skins 'birth'
  'nbw': 'S12',         // gold collar 'gold'
  'nDm': 'M29',         // pod 'pleasant'
  'rwd': 'T12',         // bowstring 'firm'
  'rmT': 'A1',          // seated man 'people' (placeholder)
  'rdi': 'D37',         // hand giving 'give'
  'Hms': 'Q1',          // seat (shared) 'sit'
  'Hpr': 'L1',          // scarab 'become'
  'xpr': 'L1',          // scarab 'become' (alt translit)
  'xrw': 'P8',          // oar 'voice'
  'xpS': 'F23',         // foreleg 'strong arm'
  'sxm': 'S42',         // sekhem sceptre 'power'
  'spr': 'D63',         // rib 'reach'
  'sDm': 'F21',         // animal ear 'hear'
  'stp': 'U21',         // adze 'choose'
  'Spsi': 'A50',        // noble seated 'noble'
  'Sms': 'T18',         // crook+package 'follow'
  'kAp': 'O45',         // shrine 'cover'
  'gnw': 'W11',         // jar stand (shared) 'annals'
  'twt': 'A53',         // mummy 'image'
  'tyt': 'V39',         // isis knot 'tit-amulet'
  'tit': 'V39',         // same
  'TAw': 'G47',         // duckling (shared) 'wind'
  'dwA': 'N14',         // star 'praise'
  'DfA': 'X4',          // bread roll 'provisions'
  'Dsr': 'D45',         // forearm holding sceptre 'sacred'
};

export const TRILITERAL_UNICODE: Record<string, string> = {
  'S34': '\u{132F9}',   // ankh
  'F35': '\u{1311D}',   // lute
  'R8': '\u{132C7}',    // god flag
  'R4': '\u{132C3}',    // loaf on mat
  'F12': '\u{13107}',   // wsr head
  'S40': '\u{13300}',   // was sceptre
  'M13': '\u{131D8}',   // papyrus stem
  'F36': '\u{1311E}',   // lungs+windpipe
  'P6': '\u{13280}',    // mast
  'M12': '\u{131D7}',   // lotus stem
  'O29': '\u{1325C}',   // wooden column
  'U5': '\u{13365}',    // sickle
  'G14': '\u{13157}',   // vulture
  'S12': '\u{132E7}',   // gold collar
  'M29': '\u{131EC}',   // pod
  'T12': '\u{13326}',   // bowstring
  'A1': '\u{13000}',    // seated man
  'L1': '\u{131A3}',    // scarab
  'P8': '\u{13282}',    // oar
  'F23': '\u{1311B}',   // foreleg
  'S42': '\u{13302}',   // sekhem sceptre
  'D63': '\u{130BC}',   // rib
  'F21': '\u{13119}',   // animal ear
  'U21': '\u{13380}',   // adze
  'A50': '\u{13031}',   // noble seated
  'T18': '\u{1332C}',   // crook+package
  'O45': '\u{13267}',   // shrine
  'A53': '\u{13034}',   // mummy
  'V39': '\u{133AB}',   // isis knot
  'N14': '\u{131FC}',   // star
  'X4': '\u{133E1}',    // bread roll
  'D45': '\u{130A6}',   // forearm holding
};

// Determinatives: small curated map of common English words -> Gardiner code.
// These are appended to a word after the phonetic signs to clarify meaning.
// This is a heuristic mapping; real Egyptian usage is far more nuanced.
export const DETERMINATIVE_BY_WORD: Record<string, string> = {
  // people
  'man': 'A1',
  'men': 'A1',
  'boy': 'A17',
  'father': 'A1',
  'son': 'A17',
  'king': 'A42',
  'pharaoh': 'A43',
  'woman': 'B1',
  'mother': 'B1',
  'girl': 'B1',
  'daughter': 'B1',
  'wife': 'B1',
  'queen': 'B7',
  'god': 'A40',
  'goddess': 'B1',
  // body
  'eye': 'D4',
  'head': 'D1',
  'arm': 'D36',
  'hand': 'D46',
  'leg': 'D56',
  'mouth': 'D21',
  // animals
  'lion': 'E23',
  'cat': 'E13',
  'dog': 'E14',
  'bull': 'E1',
  'cow': 'E1',
  'bird': 'G39',
  'horse': 'E6',
  // motion
  'walk': 'D54',
  'go': 'D54',
  'come': 'D55',
  'run': 'D54',
  // speech / thought
  'speak': 'A2',
  'say': 'A2',
  'eat': 'A2',
  'drink': 'A2',
  'think': 'A2',
  // places
  'house': 'O1',
  'city': 'O49',
  'town': 'O49',
  'temple': 'O6',
  'land': 'N16',
  'desert': 'N25',
  'mountain': 'N26',
  'foreign': 'N25',
  // nature
  'water': 'N35a',
  'river': 'N36',
  'sun': 'N5',
  'moon': 'N11',
  'star': 'N14',
  'sky': 'N1',
  'night': 'N2',
  'day': 'N5',
  // abstractions
  'life': 'S34',
  'death': 'A14',
  'time': 'N5',
  'year': 'M4',
  // misc nouns
  'tree': 'M1',
  'flower': 'M9',
  'boat': 'P1',
  'bread': 'X1',
  'fire': 'Q7',
  'book': 'Y1',
  'scroll': 'Y1',
};

// Extra Gardiner codes used only as determinatives. Merged with the rest at lookup time.
export const DETERMINATIVE_UNICODE: Record<string, string> = {
  'A2': '\u{13001}',    // man with hand to mouth (speech/eat)
  'A14': '\u{1300E}',   // dead man on side
  'A17': '\u{13011}',   // child
  'A40': '\u{13028}',   // seated god
  'A42': '\u{1302A}',   // king with flail
  'A43': '\u{1302B}',   // king with white crown
  'B1': '\u{13050}',    // seated woman
  'B7': '\u{13056}',    // queen with lotus
  'D54': '\u{130B1}',   // walking legs
  'D55': '\u{130B2}',   // legs walking backward
  'D56': '\u{130B3}',   // leg
  'E1': '\u{130D9}',    // bull
  'E6': '\u{130DE}',    // horse
  'E13': '\u{130E5}',   // cat
  'E14': '\u{130E6}',   // dog
  'M1': '\u{131C7}',    // tree
  'M4': '\u{131CA}',    // palm rib year
  'M9': '\u{131D4}',    // lotus
  'N1': '\u{131F4}',    // sky
  'N2': '\u{131F5}',    // night sky with stars
  'N5': '\u{131F8}',    // sun
  'N11': '\u{131F9}',   // moon
  'N25': '\u{1320B}',   // hill country desert
  'N36': '\u{13214}',   // canal water
  'O6': '\u{13245}',    // temple
  'O49': '\u{13270}',   // village
  'P1': '\u{13278}',    // boat
  'Q7': '\u{132B0}',    // brazier
  'Y1': '\u{1340E}',    // papyrus scroll
};

// Single lookup combining everything by Gardiner code -> Unicode.
export function gardinerToUnicode(code: string): string | null {
  return (
    UNILITERAL[code] ||
    BILITERAL_UNICODE[code] ||
    TRILITERAL_UNICODE[code] ||
    DETERMINATIVE_UNICODE[code] ||
    null
  );
}

// Sign palette grouped by category, for the click-to-insert UI panel.
export interface PaletteEntry {
  code: string;
  value: string;
  label: string;
}

export const PALETTE: Record<string, PaletteEntry[]> = {
  'Uniliterals (alphabet)': [
    { code: 'G1', value: '3', label: 'aleph' },
    { code: 'M17', value: 'i', label: 'i' },
    { code: 'M17a', value: 'y', label: 'y' },
    { code: 'D36', value: 'a', label: 'a (ayin)' },
    { code: 'G43', value: 'w', label: 'w' },
    { code: 'D58', value: 'b', label: 'b' },
    { code: 'Q3', value: 'p', label: 'p' },
    { code: 'I9', value: 'f', label: 'f' },
    { code: 'G17', value: 'm', label: 'm' },
    { code: 'N35', value: 'n', label: 'n' },
    { code: 'D21', value: 'r', label: 'r' },
    { code: 'O4', value: 'h', label: 'h' },
    { code: 'V28', value: 'H', label: 'H (h-dot)' },
    { code: 'Aa1', value: 'x', label: 'x (kh)' },
    { code: 'F32', value: 'X', label: 'X (h-bar)' },
    { code: 'S29', value: 's', label: 's' },
    { code: 'O34', value: 'z', label: 'z' },
    { code: 'N37', value: 'S', label: 'S (sh)' },
    { code: 'N29', value: 'q', label: 'q' },
    { code: 'V31', value: 'k', label: 'k' },
    { code: 'W11', value: 'g', label: 'g' },
    { code: 'X1', value: 't', label: 't' },
    { code: 'V13', value: 'T', label: 'T (tj)' },
    { code: 'D46', value: 'd', label: 'd' },
    { code: 'I10', value: 'D', label: 'D (dj)' },
  ],
  'Common biliterals': [
    { code: 'V30', value: 'nb', label: 'nb lord' },
    { code: 'O1', value: 'pr', label: 'pr house' },
    { code: 'D4', value: 'ir', label: 'ir eye' },
    { code: 'F34', value: 'ib', label: 'ib heart' },
    { code: 'D2', value: 'Hr', label: 'Hr face' },
    { code: 'Y5', value: 'mn', label: 'mn endure' },
    { code: 'U6', value: 'mr', label: 'mr love' },
    { code: 'M23', value: 'sw', label: 'sw king' },
    { code: 'D1', value: 'tp', label: 'tp head' },
    { code: 'N16', value: 'tA', label: 'tA land' },
    { code: 'N26', value: 'dw', label: 'dw mountain' },
    { code: 'R11', value: 'Dd', label: 'Dd stable' },
    { code: 'M2', value: 'Hn', label: 'Hn plant' },
    { code: 'E23', value: 'rw', label: 'rw lion' },
    { code: 'D28', value: 'kA', label: 'kA bull/ka' },
    { code: 'G36', value: 'wr', label: 'wr great' },
    { code: 'G29', value: 'bA', label: 'bA soul' },
    { code: 'I6', value: 'km', label: 'km black' },
    { code: 'F22', value: 'pH', label: 'pH end' },
    { code: 'V22', value: 'mH', label: 'mH cubit' },
  ],
  'Triliterals (iconic words)': [
    { code: 'S34', value: 'anx', label: 'anx life' },
    { code: 'F35', value: 'nfr', label: 'nfr good/beautiful' },
    { code: 'R8', value: 'nTr', label: 'nTr god' },
    { code: 'R4', value: 'Htp', label: 'Htp peace' },
    { code: 'S40', value: 'wAs', label: 'wAs sceptre' },
    { code: 'F12', value: 'wsr', label: 'wsr powerful' },
    { code: 'M13', value: 'wAD', label: 'wAD fresh' },
    { code: 'P6', value: 'aHa', label: 'aHa stand' },
    { code: 'S12', value: 'nbw', label: 'nbw gold' },
    { code: 'L1', value: 'xpr', label: 'xpr become' },
    { code: 'F23', value: 'xpS', label: 'xpS strong arm' },
    { code: 'S42', value: 'sxm', label: 'sxm power' },
    { code: 'F21', value: 'sDm', label: 'sDm hear' },
    { code: 'N14', value: 'dwA', label: 'dwA praise' },
    { code: 'D45', value: 'Dsr', label: 'Dsr sacred' },
    { code: 'V39', value: 'tit', label: 'tit tit-amulet' },
    { code: 'A50', value: 'Spsi', label: 'Spsi noble' },
    { code: 'D37', value: 'rdi', label: 'rdi give' },
  ],
  'Determinatives (common)': [
    { code: 'A1', value: '(man)', label: 'seated man' },
    { code: 'B1', value: '(woman)', label: 'seated woman' },
    { code: 'A40', value: '(god)', label: 'seated god' },
    { code: 'A42', value: '(king)', label: 'king with flail' },
    { code: 'D54', value: '(walk)', label: 'walking legs' },
    { code: 'A2', value: '(speak)', label: 'man hand to mouth' },
    { code: 'O1', value: '(house)', label: 'house plan' },
    { code: 'O49', value: '(city)', label: 'crossroads' },
    { code: 'N5', value: '(sun)', label: 'sun disc' },
    { code: 'N11', value: '(moon)', label: 'moon' },
    { code: 'N14', value: '(star)', label: 'star' },
    { code: 'N25', value: '(desert)', label: 'foreign hills' },
    { code: 'N35a', value: '(water)', label: 'water' },
    { code: 'M1', value: '(tree)', label: 'tree' },
    { code: 'P1', value: '(boat)', label: 'boat' },
    { code: 'Q7', value: '(fire)', label: 'brazier' },
    { code: 'Y1', value: '(book)', label: 'papyrus scroll' },
  ],
};
