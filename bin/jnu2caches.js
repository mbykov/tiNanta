// conjugationa l - two tenses - present-law and imperfect-laN - and the two moods - imperative-low and potential-v-lin

var fs = require('fs');
var util = require('util');
var _ = require('underscore');
// var slp = require('../sandhi/slp');
var path = require('path');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;
var salita = require('salita-component');
var stemmer = require('../index');

// log('DRU', dru); // слово о полку Игоревом

// log('JTINS', c_tins);
var jnu_verbs = './lib/jnu-tiNanta-values.txt';
var dataPath = path.join(__dirname, '../', jnu_verbs);
var dhatuListSourcePath = path.join(__dirname, '../', './lib/uohyd_dhatu_list.txt');
var dhatuListPath = path.join(__dirname, '../', './lib/dhatu_list_cache.txt');
// var canonicalTinsPath = path.join(__dirname, '../lib/canonical_tins.js');
// var c_tins = require(canonicalTinsPath);

// var dhatuAngaPath = path.join(__dirname, '../lib/dhatu_anga.js');
// var canonicalTinsCachePath = path.join(__dirname, '../lib/canonical_tins_cache.js');
var jnuTinsPath = path.join(__dirname, '../lib/jnu_tins_cache.js');
var jnuDhatuAngaPath = path.join(__dirname, '../lib/jnu_dhatu_anga_cache.js');
var jnuTestsPath = path.join(__dirname, '../test/jnu_tests_cache.txt');

// var tin_names = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var pars = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
var atms = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var tips = {
    'परस्मै': ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'],
    'आत्मने': ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहिङ', 'महिङ'] // 'महिङ्' ? что правильно?
}

// var tins = {};
// pada сидит в голове глагола, неудачно, поэтому la есть массив, пробую latins
var lakaras = {'लट्': [], 'लङ्': [], 'लिट्': [], 'लुङ्': [], 'लुट्': [], 'ऌट्': [], 'लोट्': [], 'विधिलिङ्': [], 'आशीर्लिङ्': [], 'ॡङ्': []};
var latins = {'लट्': {}, 'लङ्': {}, 'लिट्': {}, 'लुङ्': {}, 'लुट्': {}, 'ऌट्': {}, 'लोट्': {}, 'विधिलिङ्': {}, 'आशीर्लिङ्': {}, 'ॡङ्': {}};


// to save in db-file:

// // fs.unlinkSync(canonicalTinsCachePath);
fs.unlinkSync(dhatuListPath);
fs.unlinkSync(jnuDhatuAngaPath);
fs.unlinkSync(jnuTinsPath);
fs.unlinkSync(jnuTestsPath);

// var logger = fs.createWriteStream(dhatuAngaPath, {
//     flags: 'a', // 'a' means appending (old data will be preserved)
//     defaultEncoding: 'utf8'
// });
// var can_logger = fs.createWriteStream(canonicalTinsCachePath, {
//     flags: 'a', // 'a' means appending (old data will be preserved)
//     defaultEncoding: 'utf8'
// });

var tin_logger = fs.createWriteStream(jnuTinsPath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});
var anga_logger = fs.createWriteStream(jnuDhatuAngaPath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});
var test_logger = fs.createWriteStream(jnuTestsPath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});
var list_logger = fs.createWriteStream(dhatuListPath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});


var dhatuList = fs.readFileSync(dhatuListSourcePath).toString().split('\n');
var dnames = [];
// log('DN', dhatuList[0]);
dhatuList.forEach(function(row) {
    if (row[0] == '#') return;
    if (row == '') return;
    var arr = row.split(';');
    var cdhatu, dhatu;
    [cdhatu, dhatu] = arr[2].split('(');
    // var dname = {};
    var listData;
    // dname.cdhatu = cdhatu.trim().replace('॒', '').replace('ँ', c.virama);
    // dname.cdhatu = cdhatu.trim().replace('॒', '').replace('ँ', ''); //  एधँ॒ ( एध्)
    cdhatu = cdhatu.trim();
    dhatu = dhatu.replace(')', '').trim(); // कुचँ ( कुच् )
    // dnames.push(dname);
    listData = [cdhatu, dhatu].join('-');
    listData = [listData, '\n'].join('');
    list_logger.write(listData);

});
// log('DN', dnames.slice(0,9));

var rows = fs.readFileSync(dataPath).toString().split('\n');
log('size', rows.length);

var la_to_test = 'लुङ्';

var check = {};
var docs = [];
var tests = [];

function run(rows) {
    var rowarr, rowforms = [];
    var rowarrstr;
    var head, headarr, dhatu, artha, gana, pada, la;
    var dslp, aslp, gslp, pslp, lslp, key;
    var stem;
    var doc;
    rows.forEach(function(row, idz) {
        row = row.trim();
        if (row == '') return;
        if (row[0] == '#') return;
        // if (idz > 100) return;
        row = row.replace(/\s+/g, ' ');
        rowarr = row.split('\\n');
        head = rowarr.shift();
        rowforms = row.split(1);
        dhatu = head.split('(')[0].trim();

        headarr = head.split('(')[1].trim();
        headarr = headarr.replace(')', '');
        headarr = headarr.split(',');
        // log(rowarr);
        if (!headarr[2]) log('E', row);
        artha = headarr[0].trim();
        gana = headarr[1].trim().replace('गण', '');
        pada = headarr[2].trim();
        la = headarr[3].trim();
        dslp = salita.sa2slp(dhatu);
        aslp = salita.sa2slp(artha.replace(/ /g, '_'));
        gslp = salita.sa2slp(gana);
        pslp = salita.sa2slp(pada);
        lslp = salita.sa2slp(la);

        if (gslp != 'BvAdi') return;

        // if (dhatu != 'चिट') return; // खन्
        // if (pslp == 'Atmane') return;
        // if (pslp == 'parasmE') return;
        // if (la != la_to_test) return;

        // if ('वदि' == dhatu) log('==========>>', dhatu, gslp, dslp, la, pslp);
        // if ('वदि' == dhatu) log('==========>>', check[key]);
        rowarrstr = rowarr.join('-');
        key = [la, dslp, aslp, gslp, pslp, rowarrstr].join('-');
        if (!check[key]) {
            if (doc) {
                docs.push(doc);
                // if ('वदि' == doc.dhatu) log('========== doc >>>>>', doc);
            }
            doc = {key: key, dhatu: dhatu, artha: artha, pada: pada};
            // if ('वदि' == dhatu) log('========== doc >>', doc);
        }
        if (!check[key]) check[key] = true;

        var res = stemForLa(rowarr, la, pada, dhatu);
        doc[la] = {stem: res.stem, tvar: res.tvar};

        var index = 0;
        var tip, test;
        var sres;
        var sdhatus;
        rowarr.forEach(function(row, idx) {
            rowforms = row.trim().split(' ');
            rowforms.forEach(function(form, idy) {
                if (gslp != 'BvAdi') return;
                tip = tips[pada][index];
                test = {form: form, dhatu: dhatu, gana: gana, la: la, pada: pada, tip: tip, dslp: dslp, lslp: lslp, aslp: aslp, gslp: gslp, pslp: pslp};
                // if (form != 'उङ्खथ') return;

                if (la == 'लट्' && pada == 'परस्मै' && res.tvar == 0) {
                    sres = stemmer.parse(form);
                    sdhatus = sres.map(function(r) { return r.dhatu});
                    if (form == 'उङ्खथ') log('================ Stemmer RES', sres);
                    if (form == 'उङ्खथ') log('================ RES for LA', res);
                    if (form == 'उङ्खथ') log('================ rowarr', rowarr);
                    if (!inc(sdhatus, dhatu)) test.excep = true;
                    // log('================', form, test);
                    tests.push(test);
                }
                // tests.push(test);
                index +=1;
            });
        });

    });
    docs.push(doc);
}

function stemForLa(rowarr, la, pada, dhatu) {
    // log(111, rowarr);
    var stem, column, sym, next, next2, soft;
    var syms = [];
    var forms = [];
    rowarr.forEach(function(r) { forms = forms.concat(r.trim().split(' '))});
    if (forms.length != 9) {
        log('ERR: ', la, forms);
        throw new Error('forms length is not 9 ' + la + ' - ' +dhatu);
    }
    var idx = 0;
    while(idx < 15) {
        column = forms.map(function(form) { //
            sym = form[idx];
            next = form[idx+1];
            next2 = form[idx+2];
            return sym;
        });
        var uniq = _.uniq(column);
        if (uniq.length > 1) break;
        syms.push(uniq[0]);
        idx++;
    };
    stem = syms.join('');
    var reStem = new RegExp('^' + stem);
    var tinArr = [];
    var json;
    forms.forEach(function(form, idx) {
        // var tip = idx.toString();
        var stin = form.replace(reStem, '');
        tinArr.push(stin);
    });

    json = JSON.stringify(tinArr);
    var res;
    res = {stem: stem};
    if (!latins[la][pada]) latins[la][pada] = [];
    var index = latins[la][pada].indexOf(json);
    if (index > -1) {
        res.tvar = index;
        res.old = true;
    } else {
        latins[la][pada].push(json);
        res.tvar = latins[la][pada].indexOf(json);
        res.new = true;
    }
    return res;
}

run(rows);

// log('LATINS', latins[la_to_test]);
// log('TEST', docs.slice(-9));
log('check', _.keys(check).length);
log('docs', docs.length);

// return;

var tincount = 0;

writeStemCache(docs);
writeTinCache(latins);
writeTestsCache(tests);

log('tins', tincount);

function writeStemCache(docs) {
    writeHeader(anga_logger);
    var stemcount = 0;
    docs.forEach(function(doc, idx) {
        // if (idx > 5) return;
        var las = _.keys(lakaras);
        las.forEach(function(la) {
            if (!doc[la]) return;
            var oStem = {stem: doc[la].stem, dhatu: doc.dhatu, la: la, pada: doc.pada, tvar: doc[la].tvar};
            var stemData = util.inspect(oStem,  {depth: null});
            anga_logger.write(stemData);
            anga_logger.write(',\n');
            stemcount += 1;
        });
    });
    log('stems:', stemcount);
    writeFooter(anga_logger);
    anga_logger.end();
}

function writeTinCache(latins) {
    writeHeader(tin_logger);
    var check = {};
    var tkey;
    for (var la in latins) {
        var padas = latins[la];
        // log('LA', la);
        for (var pada in padas) {
            var jsons = padas[pada];
            // log(la, pada, jsons);
            jsons.forEach(function(json, tvar) {
                var tins = JSON.parse(json);
                // log(la, pada, tins);
                var oTin, tinData;
                var tip;
                tins.forEach(function(tin, idz) {
                    // log(la, pada, tin);
                    tip = tips[pada][idz];
                    tkey = [tin, la, pada, tip, json].join('-');
                    if (check[tkey]) return;
                    check[tkey] = true;
                    oTin = {tin: tin, la: la, tip: tips[pada][idz], size: tin.length, pada: pada, tvar: tvar};
                    tinData = util.inspect(oTin,  {depth: null});
                    tin_logger.write(tinData);
                    tin_logger.write(',\n');
                    tincount +=1;
                });
            });
        }
    }
    writeFooter(tin_logger);
    tin_logger.end();
}

//{ stem: 'अचेट', dhatu: 'चिट', la: 'लुङ्', pada: 'परस्मै', tvar: 0 }
// log('==>> json tins:', latins['लट्']['परस्मै'][0]);
// log('==>> json tins:', latins['लुङ्']['परस्मै'][7]);
log('==>> json tins 0 ==>');

function writeTestsCache(tests) {
    // writeHeader(anga_logger);
    var count = 0;
    var json;
    tests.forEach(function(test, idx) {
        // if (idx > 5) return;
        // var testData = util.inspect(test,  {depth: null});
        json = JSON.stringify(test);
        test_logger.write(json);
        test_logger.write('\n');
        count += 1;
    });
    log('tests:', count);
    // writeFooter(anga_logger);
    test_logger.end();
}



// это затравка для создания механизма определения стандартных tins
for (var la in latins) {
    var padas = latins[la];
    for (var pada in padas) {
        var tins = padas[pada];
        // log(la, pada, tins[0]);
    }
}

function writeHeader(logger) {
    var data = 'var data = [\n';
    logger.write(data);
}

function writeFooter(logger) {
    var data = ']; \nexports = module.exports = data;';
    logger.write(data);
}
