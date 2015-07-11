var u = require('../utils');
var desc = {gend: 'masc', var: 'pal'};

// total 120

var tests = {
    'samrAj': { // emperor  - सम्राज्
        'sg': ['सम्राट्', 'सम्राट्', 'सम्राजम्', 'सम्राजा', 'सम्राजे', 'सम्राजः', 'सम्राजः', 'सम्राजि'],
        'du': ['सम्राजौ', 'सम्राजौ', 'सम्राजौ', 'सम्राड्भ्याम्', 'सम्राड्भ्याम्', 'सम्राड्भ्याम्', 'सम्राजोः', 'सम्राजोः'],
        'pl': ['सम्राजः', 'सम्राजः', 'सम्राजः', 'सम्राड्भिः', 'सम्राड्भ्यः', 'सम्राड्भ्यः', 'सम्राजाम्', 'सम्राट्सु'],
    },
    'vAc': { // speech - f.
        'sg': ['वाक्', 'वाक्', 'वाचम्', 'वाचा', 'वाचे', 'वाचः', 'वाचः', 'वाचि'],
        'du': ['वाचौ', 'वाचौ', 'वाचौ', 'वाग्भ्याम्', 'वाग्भ्याम्', 'वाग्भ्याम्', 'वाचोः', 'वाचोः'],
        'pl': ['वाचः', 'वाचः', 'वाचः', 'वाग्भिः', 'वाग्भ्यः', 'वाग्भ्यः', 'वाचाम्', 'वाक्षु'],
    },

    'yuj': { // companion
        'sg': ['युङ्', 'युङ्', 'युञ्जम्', 'युजा', 'युजे', 'युजः', 'युजः', 'युजि'],
        'du': ['युञ्जौ', 'युञ्जौ', 'युञ्जौ', 'युग्भ्याम्', 'युग्भ्याम्', 'युग्भ्याम्', 'युजोः', 'युजोः'],
        'pl': ['युञ्जः', 'युञ्जः', 'युजः', 'युग्भिः', 'युग्भ्यः', 'युग्भ्यः', 'युजाम्', 'युक्षु'],
    },
    'rAj': { // king - m.
        'sg': ['राट्', 'राट्', 'राजम्', 'राजा', 'राजे', 'राजः', 'राजः', 'राजि'],
        'du': ['राजौ', 'राजौ', 'राजौ', 'राड्भ्याम्', 'राड्भ्याम्', 'राड्भ्याम्', 'राजोः', 'राजोः'],
        'pl': ['राजः', 'राजः', 'राजः', 'राड्भिः', 'राड्भ्यः', 'राड्भ्यः', 'राजाम्', 'राट्सु'],
    },

    'lih': { // mild wind
        'sg': ['लिट्', 'लिट्', 'लिहम्', 'लिहा', 'लिहे', 'लिहः', 'लिहः', 'लिहि'],
        'du': ['लिहौ', 'लिहौ', 'लिहौ', 'लिड्भ्याम्', 'लिड्भ्याम्', 'लिड्भ्याम्', 'लिहोः', 'लिहोः'],
        'pl': ['लिहः', 'लिहः', 'लिहः', 'लिड्भिः', 'लिड्भ्यः', 'लिड्भ्यः', 'लिहाम्', 'लिट्सु'],
    },

    '': { //
        'sg': ['', '', '', '', '', '', '', ''],
        'du': ['', '', '', '', '', '', '', ''],
        'pl': ['', '', '', '', '', '', '', ''],
    },
    '': { //
        'sg': ['', '', '', '', '', '', '', ''],
        'du': ['', '', '', '', '', '', '', ''],
        'pl': ['', '', '', '', '', '', '', ''],
    },
    '': { //
        'sg': ['', '', '', '', '', '', '', ''],
        'du': ['', '', '', '', '', '', '', ''],
        'pl': ['', '', '', '', '', '', '', ''],
    },
}

describe(u.title(desc), function() {
    u.fireNoun(tests, desc);
});
