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

var tips = {
    'परस्मै': ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'],
    'आत्मने': ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहिङ', 'महिङ'] // 'महिङ्' ? что правильно?
}

var tests = fs.readFileSync(testPath).toString().split('\n');
log('TS', tests.length);

tests = tests.slice(0, 200);

var test;
var ts = [];
var forms = [];
tests.forEach(function(row, idx) {
    if (row == '') return;
    var form, dhatu, gana, la, pada, tip, excep;
    [form, dhatu, gana, la, pada, tip, excep] = row.split('-');
    // if (gana != '01') return;
    test = {form: form, dhatu, dhatu, gana: gana, la: la, pada: pada, tip: tip};
    ts.push(test);
    forms.push([form]);
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
