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

var testPath = path.join(__dirname, './tests_cache.txt');
// var dataPath = path.join(__dirname, '../lib/jnu-tiNanta-values.txt');
// var rows = fs.readFileSync(dataPath).toString().split('\n');
// log('size', rows.length);

var tips = {
    'परस्मै': ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'],
    'आत्मने': ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहिङ', 'महिङ'] // 'महिङ्' ? что правильно?
}

var tests = fs.readFileSync(testPath).toString().split('\n');
log('TS', tests.length);
// p(tests.slice(0,5));


// अंहते-अहि!-01-लट्-आ-त
var test;
tests.forEach(function(row, idx) {
    // if (idx > 10) return;
    if (row == '') return;
    var form, dhatu, gana, la, pada, tip, excep;
    [form, dhatu, gana, la, pada, tip, excep] = row.split('-');
    if (excep == 1) return;
    test = {form: form, dhatu, dhatu, gana: gana, la: la, pada: pada, tip: tip};
    // log('T', test);
    _Fn(test);
});


function _Fn(test) {
    var descr = [test.dhatu, test.form].join('_');
    describe(descr, function(){
        var form = test.form;
        var fslp = salita.sa2slp(form);
        var results, result;
        // var title = [fslp, test.lslp, test.pslp, form, test.la, 'tip', test.tip].join('_');
        var title = [test.form, test.gana, test.la, test.pada, 'tip', test.tip].join('_');
        it(title, function() {
            results = stemmer.parse(form);
            // results.length.should.equal(1);
            // например, cukzuBe चुक्षुभे, совпадают формы, alokata अलोकत - двойной рез. одной формы из-за artha в DP
            var rkeys = results.map(function(r) {return [r.dhatu, r.la, r.pada, r.tip].join('-')});
            var key = [test.dhatu, test.la, test.pada, test.tip].join('-');
            // log('t:', test.dhatu, test.form, 'key', key, rkeys);
            inc(rkeys, key).should.equal(true);
        });
    });
}
