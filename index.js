/*
 * stemmer.js - forms queries for Morpheus v.0.4.0
 */

// var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;
var _ = require('underscore');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;
// var tins = require('./lib/tins/laN');

// ** tenses
// 1. लट् (law): वर्तमानः Present Tense = 1
//     2. लोट् (low): आज्ञार्थः Imperative  = 10
// 3. लङ् (laN): अनद्यतनभूतः Imperfect (past tense) = 2
//     4. लिङ् (liN): विध्यर्थः Potential Mood -  विधिलिङ् -- Potential mood = 8
// 5. लिट् (liw): परोक्षभूतः Perfect (past tense) = 4
//     6. लुट् (luw): अनद्यतनभविष्यन् 1st Future = (likely) = 5
// 7. लृट् (xw): भविष्यन् 2nd Future = (certain) = 6
// 8. आशीर्लिङ् (ASIrliN): आशीरर्थः Benedictive Mood = 9
// 9. लुङ् (luN): भूतः Aorist (past tense) = 3
//     10. लृङ् (XN): संकेतार्थः Conditional Mood = 7
// 11. One more Lakara is known to be seen in Vedic texts. It is known as लेट् - imperative

// ======================== продолжить сохранять lesson-8 в FF

var lakaras = ['law', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

// samasa to queries array
stemmer.prototype.query = function(query) {
    this.queries = [];
    // если проходит грубый фильтр, то tiNanta ? Или нет смысла?
    this.tiNanta(query);
    return this.queries;
}

stemmer.prototype.tiNanta = function(query) {
    log('tiNanta', query);
    var la = './lib/tins';
    var tins = require(la);
    log('Tins', tins);

    this.queries.push('QQQ');
    return this.queries;
}
