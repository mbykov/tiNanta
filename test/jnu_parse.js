//

// var should = require('should');

var debug = (process.env.debug == 'true') ? true : false;
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var salita = require('salita-component');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;
var stemmer = require('../index');

var testPath = path.join(__dirname, './jnu_tests_cache.txt');
var dataPath = path.join(__dirname, '../lib/jnu-tiNanta-values.txt');
var rows = fs.readFileSync(dataPath).toString().split('\n');
log('size', rows.length);

var tips = {
    'परस्मै': ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'],
    'आत्मने': ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहिङ', 'महिङ'] // 'महिङ्' ? что правильно?
}

var la_to_test = 'विधिलिङ्';

var tests = fs.readFileSync(testPath).toString().split('\n');
// log('TS', tests.length);

// भू_BU Bavati_law_parasmE_भवति_लट्_tip_तिप्:
var test, index = 0;
tests.forEach(function(json, idx) {
    // if (index > 0) return;
    // log(json);
    if (json == '') return;
    test = JSON.parse(json);
    if (test.la != la_to_test || test.gana != 'भ्वादि') return; // || test.tip != 'तिप्' // test.pada != 'परस्मै' || // लङ्
    // log('t', test);
    // HERE ==== нет excep=false для laN
    if (test.excep) return;
    _Fn(test);
    // log('T', index, test);
    index +=1;
});

// "la":"लट्","pada":"परस्मै"


// p(tests.slice(0,5));

function _Fn(test) {
    var descr = [test.dhatu, test.dslp].join('_');
    describe(descr, function(){
        var form = test.form;
        var fslp = salita.sa2slp(form);
        var results, result;
        var title = [fslp, test.lslp, test.pslp, form, test.la, 'tip', test.tip].join('_');
        it(title, function() {
            results = stemmer.parse(form);
            // log('t:', test.dhatu, test.dslp, fslp);
            // results.length.should.equal(1);
            // например, cukzuBe चुक्षुभे, совпадают формы, alokata अलोकत - двойной рез. одной формы из-за artha в DP
            var rkeys = results.map(function(r) {return [r.dhatu, r.la, r.pada, r.tip].join('-')});
            var key = [test.dhatu, test.la, test.pada, test.tip].join('-');
            inc(rkeys, key).should.equal(true);
        });
    });
}
