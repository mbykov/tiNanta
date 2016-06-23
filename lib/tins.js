// sg3, du3, pl3, sg2, du2, pl2, sg1, du1, pl1
// first - 14610, second - 235789

// перенести в utils
var c = {};
c.laN = 'लङ्';

var laN = {
    first: {
        'परस्मै': ['त्', 'ताम्', 'अन्', 'स्', 'तम्', 'त', 'अम्', 'व', 'म'],
        'आत्मने': ['त', 'इताम्', 'अन्त', 'थाः', 'इथाम्', 'ध्वम्', 'इ', 'वहि', 'महि']
    },
    second: {
        'परस्मै': ['', '', '', '', '', '', '', '', ''],
        'आत्मने': ['', '', '', '', '', '', '', '', '']
    },
}

// правила для фильтров в comm: A-14610, B-235789

var tins = {
    'लट्': {
        par: ['ति', 'तः', 'न्ति', 'सि', 'थः', 'थ', 'मि', 'वः', 'मः'], // pl.3: anti
        atm: ['ते', 'ते', 'न्ते-न्ते', 'से', 'थे', 'इथेध्वे', 'ि-े', 'वहे', 'महे'] // du.3 ite-Ate ; pl.3: ate-ante ; du.2: iTe-ATe ; sg.1: i-e ;
    },
    'लङ्': {
        par: ['त्-द्', 'ताम्', 'न्-उः', 'स्', 'तम्', 'त', 'म्', 'व', 'म'], // du3: (A - an, uH, B: n) ; sg1: m-am (нет ?AB);
        atm: ['त', 'ताम्', 'न्त', 'थाः', 'थाम्', 'ध्वम्', 'ि', 'वहि', 'महि'] // sg.2: itAn-atAn ; pl.3: anta-nta-ata ; du.2: iTAm-aTAm ;
    },
    la: {
        par: ['', '', '', '', '', '', '', '', ''], //
        atm: ['', '', '', '', '', '', '', '', '']
    },
}


exports = module.exports = tins;

/*
  thema - совсем убрать, преверять отличия в фильтрах
  law: {}
  laN: {}

  а затем, спец. скпиптом - преобразовать в форму
  [
  {'त्': { gana, pada, thema, } }
  ]

*/

// 1. लट् (law): वर्तमानः Present Tense =
//     2. लोट् (low): आज्ञार्थः Imperative (exclusively for giving blessings or benedictions)
// 3. लङ् (laN): अनद्यतनभूतः Imperfect (past tense) =
//     4. लिङ् (liN): विध्यर्थः Potential Mood -  विधिलिङ् -- Potential mood
// 5. लिट् (liw): परोक्षभूतः Perfect (past tense) =
//     6. लुट् (luw): अनद्यतनभविष्यन् 1st Future = (likely)
// 7. लृट् (xw): भविष्यन् 2nd Future = (certain)
// 8. आशीर्लिङ् (ASIrliN): आशीरर्थः Benedictive Mood
// 9. लुङ् (luN): भूतः Aorist (past tense) =
//     10. लृङ् (XN): संकेतार्थः Conditional Mood
// 11. One more Lakara is known to be seen in Vedic texts. It is known as लेट् - imperative
