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
var async = require("async");

var tins = [];
var das = [];

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
// p(tests.slice(0,2));

tests = tests.slice(10000, 20000);

var test;
var ts = [];
var forms = [];
tests.forEach(function(row, idx) {
    // if (idx > 9) return; // FIXME: ========================================
    if (row == '') return;
    var form, dhatu, gana, la, pada, tip, excep;
    [form, dhatu, gana, la, pada, tip, excep] = row.split('-');
    // if (gana != '01') return;
    test = {form: form, dhatu, dhatu, gana: gana, la: la, pada: pada, tip: tip};
    ts.push(test);
    forms.push([form]);
    // log('T', test);
    // _Fn(test);
});

log('TS', ts.length);

async.eachSeries(ts, fn, function(err) {
    log('.');
    if (err) log('ERR', err);
});


function fn(test, cb) {
    let stems = [test.form];
    stemmer.query(stems, function(err, rs) {
        // results.length.should.equal(1);
        // например, cukzuBe चुक्षुभे, совпадают формы, alokata अलोकत - двойной рез. одной формы из-за artha в DP
        var rkeys = rs.map(function(r) {return [r.dhatu, r.la, r.pada].join('-');});
        var key = [test.dhatu, test.la, test.pada].join('-');
        // log('K', key, rkeys);
        let rk = inc(rkeys, key);
        if (!rk) {
            log('err-test:', test.dhatu, 'form:', test.form, 'key', key, 'keys', rkeys);
            // if (!rk) throw new Error();
        }
        process.stdout.write(green('.'));
        cb(err);
    });
}

function green(s) {
    return '\033[32m' + s;
}

return;

// errs
/*
  err-test: अक्ष् form: आक्षिष्टाम् key अक्ष्-लुङ्-प keys []
  err-test: अञ्ज् form: आञ्जिष्टाम् key अञ्ज्-लुङ्-प keys []
  err-test: अश् form: अक्षीयास्ताम् key अश्-आशीर्लिङ्-आ keys []
  err-test: ऊर्णु form: ऊर्णुवितास्वहे key ऊर्णु-लुट्-आ keys []
  ऋछ् form: आर्च्छिष्टाम् key ऋछ्-लुङ्-प keys []
  err-test: उन्द् form: उद्यास्ताम् key उन्द्-आशीर्लिङ्-प keys [ 'वद्-आशीर्लिङ्-प' ]
*/


async.map(forms, stemmer.query, function(err, results){
    // if any of the saves produced an error, err would equal that error
    // p('R', err, results.length);
    results.forEach(function(rs, idx) {
        let test = ts[idx];
        var descr = [test.dhatu, test.form].join('_');
        // log('D', descr);
        // log('RS', idx, rs);
        // log('T', test);
        // return;
        var rkeys = rs.map(function(r) {return [r.dhatu, r.la, r.pada].join('-');});
        var key = [test.dhatu, test.la, test.pada].join('-');
        // log('K', key, rkeys);
        let rk = inc(rkeys, key);
        if (!rk) {
            log('idx', idx);
            log('err-test:', test.dhatu, 'form:', test.form, 'key', key, 'keys', rkeys);
            // if (!rk) throw new Error();
        }
        process.stdout.write('.');
        // true.should.equal(true);
        // inc(rkeys, key).should.equal(true);
    });
    log('.');
});


async.eachSeries(ts, _Fn, function(err, results) {
    // if result is true then every file exists
    log('END RESULTS OK');
    if (err) log('ERR', err);
});

function _Fn(test, cb) {
    var descr = [test.dhatu, test.form].join('_');
    log('D', descr);
    stemmer.query(test.form, function(err, results) {
        // results.length.should.equal(1);
        // например, cukzuBe चुक्षुभे, совпадают формы, alokata अलोकत - двойной рез. одной формы из-за artha в DP
        log('STEMMER');
        var rkeys = results.map(function(r) {return [r.dhatu, r.la, r.pada, r.tip].join('-');});
        var key = [test.dhatu, test.la, test.pada, test.tip].join('-');
        log('K', key, rkeys);
        if (!inc(rkeys, key)) log('err-test dhatu:', test.dhatu, 'form:', test.form, 'key', key, rkeys);
        // true.should.equal(true);
        // inc(rkeys, key).should.equal(true);
        cb(1);
    });
}


function _Fn_(test, cb) {
    var descr = [test.dhatu, test.form].join('_');
    describe(descr, function(){
        // log('D', descr);
        // cb();
        // return;
        var form = test.form;
        var fslp = salita.sa2slp(form);
        var result;
        // var title = [fslp, test.lslp, test.pslp, form, test.la, 'tip', test.tip].join('_');
        var title = [test.form, test.gana, test.la, test.pada, 'tip', test.tip].join('_');
        log('TITLE', title);
        it(title, function(cb) {
            log('T', test.form);
            cb();
            return;
            stemmer.query(form, function(err, results) {
                // results.length.should.equal(1);
                // например, cukzuBe चुक्षुभे, совпадают формы, alokata अलोकत - двойной рез. одной формы из-за artha в DP
                var rkeys = results.map(function(r) {return [r.dhatu, r.la, r.pada, r.tip].join('-');});
                var key = [test.dhatu, test.la, test.pada, test.tip].join('-');
                // log('K', key, rkeys);
                if (!inc(rkeys, key)) log('err-test dhatu:', test.dhatu, 'form:', test.form, 'key', key, rkeys);
                true.should.equal(true);
                // inc(rkeys, key).should.equal(true);
                cb();
            });
        });
    });
}


// before(function() {
//     var dhatuAngaPath = path.join(__dirname, '../lib/dhatu_anga_cache.txt');
//     var dhatuAngas = fs.readFileSync(dhatuAngaPath).toString().split('\n');
//     // var das = [];
//     var odhatu, ostem, ogana, ola, opada, otvar, otips;
//     dhatuAngas.forEach(function(da) {
//         if (da == '') return;
//         [odhatu, ostem, ogana, ola, opada, otvar, otips] = da.split('-');
//         das.push({dhatu: odhatu, stem: ostem, gana: ogana, la: ola, pada: opada, tvar: otvar, tips:otips});
//     });


//     var tinsPath = path.join(__dirname, '../lib/tins_cache.js');
//     var ctins = fs.readFileSync(tinsPath).toString().split('\n');
//     // tins = [];
//     var tip, tin, size, gana, la, pada, tvar;
//     ctins.forEach(function(ctin) {
//         if (ctin == '') return;
//         [tip, tin, size, gana, la, pada, tvar] = ctin.split('-');
//         tins.push({tip: tip, tin: tin, size: size, gana: gana, la: la, pada: pada, tvar: tvar});
//     });
// });

// log('T', tins);
// return;

// अंहते-अहि!-01-लट्-आ-त

// function run(test, cb) {
//     log('T:', test);
//     cb();
// }
