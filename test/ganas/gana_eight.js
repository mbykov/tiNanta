//
var utils = require('../utils');
var conj = 'eight';



var tests = {
    'tan': { // extend
        'lat_par': ['तनोति', 'तनोषि', 'तनोमि', 'तनुतः', 'तनुथः', 'तन्वः-तनुवः', 'तन्वन्ति', 'तनुथ', 'तन्मः-तनुमः'],
        'lat_atm': ['तनुते', 'तनुषे', 'तन्वे', 'तन्वाते', 'तन्वाथे', 'तन्वहे-तनुवहे', 'तन्वते', 'तनुध्वे', 'तन्महे-तनुमहे'],
        'lat_pas': ['तन्यते', 'तन्यसे', 'तन्ये', 'तन्येते', 'तन्येथे', 'तन्यावहे', 'तन्यन्ते', 'तन्यध्वे', 'तन्यामहे'],
        'lan_par': ['अतनोत्', 'अतनोः', 'अतनवम्', 'अतनुताम्', 'अतनुतम्', 'अतन्व-अतनुव', 'अतन्वन्', 'अतनुत', 'अतन्म-अतनुम'],
        'lan_atm': ['अतनुत', 'अतनुथाः', 'अतन्वि', 'अतन्वाताम्', 'अतन्वाथाम्', 'अतन्वहि-अतनुवहि', 'अतन्वत', 'अतनुध्वम्', 'अतन्महि-अतनुमहि'],
        'lan_pas': ['अतन्यत', 'अतन्यथाः', 'अतन्ये', 'अतन्येताम्', 'अतन्येथाम्', 'अतन्यावहि', 'अतन्यन्त', 'अतन्यध्वम्', 'अतन्यामहि'],
        // 'lot_par': ['', '', '', '', '', '', '', '', ''],
        // 'lot_atm': ['', '', '', '', '', '', '', '', ''],
        // 'lot_pas': ['', '', '', '', '', '', '', '', ''],
        'lit_par': ['ततान', 'तेनिथ-ततन्थ', 'ततान-ततन', 'तेनतुः', 'तेनथुः', 'तेनिव', 'तेनुः', 'तेन', 'तेनिम'],
        'lit_atm': ['तेने', 'तेनिषे', 'तेने', 'तेनाते', 'तेनाथे', 'तेनिवहे', 'तेनिरे', 'तेनिध्वे', 'तेनिमहे'],
    },
    'kf': { // do
        'lat_par': ['करोति', 'करोषि', 'करोमि', 'कुरुतः', 'कुरुथः', 'कुर्वः', 'कुर्वन्ति', 'कुरुथ', 'कुर्मः'],
        'lat_atm': ['कुरुते', 'कुरुषे', 'कुर्वे', 'कुर्वाते', 'कुर्वाथे', 'कुर्वहे', 'कुर्वते', 'कुरुध्वे', 'कुर्महे'],
        'lat_pas': ['क्रियते', 'क्रियसे', 'क्रिये', 'क्रियेते', 'क्रियेथे', 'क्रियावहे', 'क्रियन्ते', 'क्रियध्वे', 'क्रियामहे'],
        // 'lan_par': ['अकरोत्', 'अकरोः', 'अकरवम्', 'अकुरुताम्', 'अकुरुतम्', 'अकुर्व', 'अकुर्वन्', 'अकुरुत', 'अकुर्म'],
        // 'lan_atm': ['अकुरुत', 'अकुरुथाः', 'अकुर्वि', 'अकुर्वाताम्', 'अकुर्वाथाम्', 'अकुर्वहि', 'अकुर्वत', 'अकुरुध्वम्', 'अकुर्महि'],
        // 'lan_pas': ['अक्रियत', 'अक्रियथाः', 'अक्रिये', 'अक्रियेताम्', 'अक्रियेथाम्', 'अक्रियावहि', 'अक्रियन्त', 'अक्रियध्वम्', 'अक्रियामहि'],
        'lot_par': ['', '', '', '', '', '', '', '', ''],
        'lot_atm': ['', '', '', '', '', '', '', '', ''],
        'lot_pas': ['', '', '', '', '', '', '', '', ''],
        // 'lit_par': ['', '', '', '', '', '', '', '', ''],
        // 'lit_atm': ['', '', '', '', '', '', '', '', ''],
    },
    'man': { // man - to think, повторяет tan
    //     'lat_par': ['', '', '', '', '', '', '', '', ''],
    //     'lat_atm': ['', '', '', '', '', '', '', '', ''],
    //     'lat_pas': ['', '', '', '', '', '', '', '', ''],
    //     // 'lan_par': ['', '', '', '', '', '', '', '', ''],
    //     // 'lan_atm': ['', '', '', '', '', '', '', '', ''],
    //     // 'lan_pas': ['', '', '', '', '', '', '', '', ''],
    //     'lot_par': ['', '', '', '', '', '', '', '', ''],
    //     'lot_atm': ['', '', '', '', '', '', '', '', ''],
    //     'lot_pas': ['', '', '', '', '', '', '', '', ''],
        'lit_par': ['ममान', 'मेनिथ-ममन्थ', 'ममान-ममन', 'मेनतुः', 'मेनथुः', 'मेनिव', 'मेनुः', 'मेन', 'मेनिम'],
        'lit_atm': ['मेने', 'मेनिषे', 'मेने', 'मेनाते', 'मेनाथे', 'मेनिवहे', 'मेनिरे', 'मेनिध्वे', 'मेनिमहे'],
    },
}

describe(conj, function() {
    utils.fireTest(tests, conj);
});
