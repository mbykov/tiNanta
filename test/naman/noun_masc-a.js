var u = require('../utils');
var desc = {gend: 'masc', var: 'a'};

// total 69

var tests = {
    'kAma': { // love
        'sg': ['कामः', 'काम', 'कामम्', 'कामेन', 'कामाय', 'कामात्', 'कामस्य', 'कामे'], // abl. कामतः
        'du': ['कामौ', 'कामौ', 'कामौ', 'कामाभ्याम्', 'कामाभ्याम्', 'कामाभ्याम्', 'कामयोः', 'कामयोः'],
        'pl': ['कामाः', 'कामाः', 'कामान्', 'कामैः', 'कामेभ्यः', 'कामेभ्यः', 'कामानाम्', 'कामेषु'],
    },
    'deva': { // god m.
        'sg': ['देवः', 'देव', 'देवम्', 'देवेन', 'देवाय', 'देवात्', 'देवस्य', 'देवे'], // abl. देवतः
        'du': ['देवौ', 'देवौ', 'देवौ', 'देवाभ्याम्', 'देवाभ्याम्', 'देवाभ्याम्', 'देवयोः', 'देवयोः'],
        'pl': ['देवाः', 'देवाः', 'देवान्', 'देवैः', 'देवेभ्यः', 'देवेभ्यः', 'देवानाम्', 'देवेषु'],
    },

    'kfpa': { // well
        'sg': ['कृपः', 'कृप', 'कृपम्', 'कृपेण', 'कृपाय', 'कृपात्', 'कृपस्य', 'कृपे'], // abl. कृपतः
        'du': ['कृपौ', 'कृपौ', 'कृपौ', 'कृपाभ्याम्', 'कृपाभ्याम्', 'कृपाभ्याम्', 'कृपयोः', 'कृपयोः'],
        'pl': ['कृपाः', 'कृपाः', 'कृपान्', 'कृपैः', 'कृपेभ्यः', 'कृपेभ्यः', 'कृपाणाम्', 'कृपेषु'],
    },

    'rAma': { //
        'sg': ['रामः', 'राम', 'रामम्', 'रामेण', 'रामाय', 'रामात्', 'रामस्य', 'रामे'],
        'du': ['रामौ', 'रामौ', 'रामौ', 'रामाभ्याम्', 'रामाभ्याम्', 'रामाभ्याम्', 'रामयोः', 'रामयोः'],
        'pl': ['रामाः', 'रामाः', 'रामान्', 'रामैः', 'रामेभ्यः', 'रामेभ्यः', 'रामाणाम्', 'रामेषु'],
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
