var u = require('../utils');
var desc = {gend: 'masc', var: 'cons'};

// total 140

var tests = {
    // Root, W.383 MASC
    // 'gir': { // praise, song ==== inst,dat,abl
    //     'sg': ['गीः', 'गीः', 'गिरम्', 'गिरा', 'गिरे', 'गिरः', 'गिरः', 'गिरि'],
    //     'du': ['गिरौ', 'गिरौ', 'गिरौ', 'गीर्भ्याम्', 'गीर्भ्याम्', 'गीर्भ्याम्', 'गिरोः', 'गिरोः'],
    //     'pl': ['गिरः', 'गिरः', 'गिरः', 'गीर्भिः', 'गीर्भ्यः', 'गीर्भ्यः', 'गिराम्', 'गीर्षु'],
    // },
    'pad': { // foot - m.
        'sg': ['पत्', 'पत्', 'पदम्', 'पदा', 'पदे', 'पदः', 'पदः', 'पदि'],
        'du': ['पदौ', 'पदौ', 'पदौ', 'पद्भ्याम्', 'पद्भ्याम्', 'पद्भ्याम्', 'पदोः', 'पदोः'],
        'pl': ['पदः', 'पदः', 'पदः', 'पद्भिः', 'पद्भ्यः', 'पद्भ्यः', 'पदाम्', 'पत्सु'],
    },

    'sarit': { // river
        'sg': ['सरित्', 'सरित्', 'सरितम्', 'सरिता', 'सरिते', 'सरितः', 'सरितः', 'सरिति'],
        'du': ['सरितौ', 'सरितौ', 'सरितौ', 'सरिद्भ्याम्', 'सरिद्भ्याम्', 'सरिद्भ्याम्', 'सरितोः', 'सरितोः'],
        'pl': ['सरितः', 'सरितः', 'सरितः', 'सरिद्भिः', 'सरिद्भ्यः', 'सरिद्भ्यः', 'सरिताम्', 'सरित्सु'],
    },

    'marut': { // wind - m.
        'sg': ['मरुत्', 'मरुत्', 'मरुतम्', 'मरुता', 'मरुते', 'मरुतः', 'मरुतः', 'मरुति'],
        'du': ['मरुतौ', 'मरुतौ', 'मरुतौ', 'मरुद्भ्याम्', 'मरुद्भ्याम्', 'मरुद्भ्याम्', 'मरुतोः', 'मरुतोः'],
        'pl': ['मरुतः', 'मरुतः', 'मरुतः', 'मरुद्भिः', 'मरुद्भ्यः', 'मरुद्भ्यः', 'मरुताम्', 'मरुत्सु'],
    },

    'druh': { // demon - m.
        'sg': ['ध्रुट्-ध्रुक्', 'ध्रुट्-ध्रुक्', 'द्रुहम्', 'द्रुहा', 'द्रुहे', 'द्रुहः', 'द्रुहः', 'द्रुहि'],
        'du': ['द्रुहौ', 'द्रुहौ', 'द्रुहौ', 'ध्रुड्भ्याम्-ध्रुग्भ्याम्', 'ध्रुड्भ्याम्-ध्रुग्भ्याम्', 'ध्रुड्भ्याम्-ध्रुग्भ्याम्', 'द्रुहोः', 'द्रुहोः'],
        'pl': ['द्रुहः', 'द्रुहः', 'द्रुहः', 'ध्रुड्भिः-ध्रुग्भिः', 'ध्रुड्भ्यः-ध्रुग्भ्यः', 'ध्रुड्भ्यः-ध्रुग्भ्यः', 'द्रुहाम्', 'ध्रुट्सु-ध्रुक्षु'],
    },

    'kzam': { // earth, ground
        'sg': ['क्षम्', 'क्षम्', 'क्षमम्', 'क्षमा', 'क्षमे', 'क्षमः', 'क्षमः', 'क्षमि'],
        'du': ['क्षमौ', 'क्षमौ', 'क्षमौ', 'क्षंभ्याम्', 'क्षंभ्याम्', 'क्षंभ्याम्', 'क्षमोः', 'क्षमोः'],
        'pl': ['क्षमः', 'क्षमः', 'क्षमः', 'क्षंभिः', 'क्षंभ्यः', 'क्षंभ्यः', 'क्षमाम्', 'क्षंसु'],
    },
    'stuB': { // praising, m.
        'sg': ['स्तुप्', 'स्तुप्', 'स्तुभम्', 'स्तुभा', 'स्तुभे', 'स्तुभः', 'स्तुभः', 'स्तुभि'],
        'du': ['स्तुभौ', 'स्तुभौ', 'स्तुभौ', 'स्तुब्भ्याम्', 'स्तुब्भ्याम्', 'स्तुब्भ्याम्', 'स्तुभोः', 'स्तुभोः'],
        'pl': ['स्तुभः', 'स्तुभः', 'स्तुभः', 'स्तुब्भिः', 'स्तुब्भ्यः', 'स्तुब्भ्यः', 'स्तुभाम्', 'स्तुप्सु'],
    },

    'viS': { // a man, person
        'sg': ['विट्', 'विट्', 'विशम्', 'विशा', 'विशे', 'विशः', 'विशः', 'विशि'],
        'du': ['विशौ', 'विशौ', 'विशौ', 'विड्भ्याम्', 'विड्भ्याम्', 'विड्भ्याम्', 'विशोः', 'विशोः'],
        'pl': ['विशः', 'विशः', 'विशः', 'विड्भिः', 'विड्भ्यः', 'विड्भ्यः', 'विशाम्', 'विट्सु'],
    },
    'suhfd': { // friend
        'sg': ['सुहृत्', 'सुहृत्', 'सुहृदम्', 'सुहृदा', 'सुहृदे', 'सुहृदः', 'सुहृदः', 'सुहृदि'],
        'du': ['सुहृदौ', 'सुहृदौ', 'सुहृदौ', 'सुहृद्भ्याम्', 'सुहृद्भ्याम्', 'सुहृद्भ्याम्', 'सुहृदोः', 'सुहृदोः'],
        'pl': ['सुहृदः', 'सुहृदः', 'सुहृदः', 'सुहृद्भिः', 'सुहृद्भ्यः', 'सुहृद्भ्यः', 'सुहृदाम्', 'सुहृत्सु'],
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
    '': { //
        'sg': ['', '', '', '', '', '', '', ''],
        'du': ['', '', '', '', '', '', '', ''],
        'pl': ['', '', '', '', '', '', '', ''],
    },

}

describe(u.title(desc), function() {
    u.fireNoun(tests, desc);
});
