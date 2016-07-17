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
var canonicalTinsPath = path.join(__dirname, '../lib/canonical_tins.js');

var jnuTinsPath = path.join(__dirname, '../lib/jnu_tins_cache.js');
var jnuDhatuAngaPath = path.join(__dirname, '../lib/jnu_dhatu_anga_cache.js');
var jnuTestsPath = path.join(__dirname, '../test/jnu_tests_cache.txt');

// var tin_names = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var pars = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
var atms = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var tips = {
    'प.प': ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'],
    'आ.प': ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहिङ', 'महिङ'] // 'महिङ्' ? что правильно?
}

// var tins = {};
// pada сидит в голове глагола, неудачно, поэтому la есть массив, пробую latins
// var lakaras = {'लट्': [], 'लङ्': [], 'लिट्': [], 'लुङ्': [], 'लुट्': [], 'ऌट्': [], 'लोट्': [], 'विधिलिङ्': [], 'आशीर्लिङ्': [], 'ॡङ्': []};
var latins = {'लट्': {}, 'लङ्': {}, 'लिट्': {}, 'लुङ्': {}, 'लुट्': {}, 'ऌट्': {}, 'लोट्': {}, 'विधिलिङ्': {}, 'आशीर्लिङ्': {}, 'ॡङ्': {}};
var lakara = {};
// var glpcheck = {};

var la_to_test;
la_to_test = 'लट्';
// GANAS: भ्वादि, अदादि, जुहोत्यादि, दिवादि, तुदादि, रुधादि, तनादि, क्र्यादि, क्र्यादि, चुरादि
var gana_to_test;
gana_to_test = 'भ्वादि';


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
// 1; भ्वादिः; भू ( भू ) ; सत्तायाम् ; सेट् ; प.प
dhatuList.forEach(function(row) {
    if (row[0] == '#') return;
    if (row == '') return;
    var arr = row.trim('').split(';');
    var listData;
    var cdhatu, dhatu, gana, artha, set, pada, num;
    var padas; // उ.प
    num = arr[0].trim();
    gana = arr[1].trim().replace(c.visarga, '');
    [cdhatu, dhatu] = arr[2].split('(');
    cdhatu = cdhatu.trim();
    dhatu = dhatu.replace(')', '').trim();
    artha = arr[3].trim().replace(/ /g, '_');
    set = arr[4].trim();
    pada = arr[5].trim();
    padas = (pada == 'उ.प') ? ['प.प', 'आ.प'] : [pada];
    padas.forEach(function(p) {
        listData = [num, gana, cdhatu, dhatu, artha, set, p].join('-');
        listData = [listData, '\n'].join('');
        list_logger.write(listData);
    });

});
// log('DN', dnames.slice(0,9));

var rows = fs.readFileSync(dataPath).toString().split('\n');
log('size', rows.length);

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
        if (pada == 'परस्मै') pada = 'प.प';
        else if (pada == 'आत्मने') pada = 'आ.प';
        la = headarr[3].trim();
        dslp = salita.sa2slp(dhatu);
        aslp = salita.sa2slp(artha.replace(/ /g, '_'));
        gslp = salita.sa2slp(gana);
        pslp = salita.sa2slp(pada);
        lslp = salita.sa2slp(la);

        // 'लट्', 'लङ्', 'लिट्', 'लुङ्', 'लुट्', 'ऌट्', 'लोट्', 'विधिलिङ्', 'आशीर्लिङ्', 'ॡङ्'
        if (inc(['लिट्', 'लुङ्', 'लुट्', 'ऌट्', 'लोट्', 'आशीर्लिङ्', 'ॡङ्'], la)) return;
        if (la_to_test && la != la_to_test) return;
        if (gana_to_test && gana != gana_to_test) return;

        rowarrstr = rowarr.join('-');
        key = [la, dslp, aslp, gslp, pslp, rowarrstr].join('-');
        if (!check[key]) {
            if (doc) {
                docs.push(doc);
            }
            doc = {dhatu: dhatu, artha: artha, gana: gana, la: la, pada: pada}; // key: key,
        }
        if (!check[key]) check[key] = true;

        var res = stemForLa(rowarr, gana, la, pada);
        // doc[la] = {stem: res.stem, tvar: res.tvar};
        // doc = {stem: res.stem, tvar: res.tvar};
        doc.stem = res.stem;
        doc.tvar = res.tvar;

        var index = 0;
        var tip, test;
        var sres;
        var sdhatus;
        rowarr.forEach(function(row, idx) {
            rowforms = row.trim().split(' ');
            rowforms.forEach(function(form, idy) {
                tip = tips[pada][index];
                test = {form: form, dhatu: dhatu, gana: gana, la: la, pada: pada, tip: tip, dslp: dslp, lslp: lslp, aslp: aslp, gslp: gslp, pslp: pslp};
                // if (form != 'स्पर्धेते') return;

                sres = stemmer.parse(form);
                sdhatus = sres.map(function(r) { return r.dhatu});
                if (!inc(sdhatus, dhatu)) test.excep = true;
                // log('RES', sres, 2, sdhatus, 3, dhatu);

                tests.push(test);
                index +=1;
            });
        });

    });
    docs.push(doc); // final unprocessed doc
}

function stemForLa(rowarr, gana, la, pada) {
    var stem, column, sym, next, next2, soft;
    var syms = [];
    var forms = [];
    rowarr.forEach(function(r) { forms = forms.concat(r.trim().split(' '))});
    if (forms.length != 9) {
        log('ERR: ', la, forms);
        throw new Error('forms length is not 9 ' + la);
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
    // ============================= TIN LAKARA REFINE ====================:
    stem = syms.join('');
    var fin = stem.slice(-1);
    if (la == 'law') ;
    else if (la == 'विधिलिङ्' && fin == c.e) stem = stem.slice(0, -1);
    fin = stem.slice(-1);
    // if (!u.isConsonant(fin)) log('--------- fin is not a --------- stem:', stem, 'fin:', fin, 'form0:', forms[0], 'gana:', gana, 'la:', la, 'pada:', pada);

    var reStem = new RegExp('^' + stem);
    var tinArr = [];
    var json;
    forms.forEach(function(form, idx) {
        // var tip = idx.toString();
        var stin = form.replace(reStem, '');
        tinArr.push(stin);
    });

    // json = JSON.stringify(tinArr);
    json = tinArr.toString();
    var res = {stem: stem};

    // ========== TVAR =====================

    var glpkey = [gana, la, pada].join('-');
    if (!lakara[glpkey]) lakara[glpkey] = [];
    var index = lakara[glpkey].indexOf(json);
    if (index > -1) {
        res.tvar = index;
        // res.old = true;
    } else {
        lakara[glpkey].push(json);
        res.tvar = lakara[glpkey].indexOf(json);
        // res.new = true;
    }

    return res;
}

run(rows);

// log('TEST', docs.slice(-9));
log('check', _.keys(check).length);
// log('docs', docs.slice(0,3));
log('docs', docs.length);

// return;

var tincount = 0;

var canons, canon;
var canonObj = require(canonicalTinsPath);
// p('C', canonObj);

writeStemCache(docs);
writeTinCache(lakara, canonObj);
writeTestsCache(tests);

log('tins', tincount);

function writeStemCache(docs) {
    writeHeader(anga_logger);
    var stemcount = 0;
    docs.forEach(function(doc, idx) {
        // if (idx > 5) return;
        // var las = _.keys(lakaras);
        var oStem = {stem: doc.stem, dhatu: doc.dhatu, gana: doc.gana, la: doc.la, pada: doc.pada, tvar: doc.tvar};
        var stemData = util.inspect(oStem,  {depth: null});
        anga_logger.write(stemData);
        anga_logger.write(',\n');
    });
    log('stems:', stemcount);
    writeFooter(anga_logger);
    anga_logger.end();
}

function writeTinCache(lakara, canonObj) {
    writeHeader(tin_logger);
    var check = {};
    var tkey;
    for (var glpkey in lakara) {
        var gana, la, pada;
        [gana, la, pada] = glpkey.split('-');
        // log(1, gana, la, pada, 2, lakara[glpkey]);
        var jsons = lakara[glpkey];
        canons = canonObj[gana][la][pada];
        jsons.forEach(function(json, tvar, canons) {
            // log('CAN', canons);
            if (inc(canons, json)) canon = true;
            // var tins = JSON.parse(json);
            var tins = json.split(',');
            // log(la, pada, tins);
            // ============= если json - canonical, то oTin - тоже canonical
            var oTin, tinData;
            var tip;
            tins.forEach(function(tin, idz) {
                // log(la, pada, tin);
                tip = tips[pada][idz];
                tkey = [tin, la, pada, tip].join('-'); // здесь добавить json не нужно, а нужно в parse - иначе дубли. Но нет ли пропуска в find?
                if (check[tkey]) return;
                check[tkey] = true;
                oTin = {tin: tin, tip: tips[pada][idz], size: tin.length, gana: gana, la: la, pada: pada, tvar: tvar};
                if (canon) oTin.canon = true;
                tinData = util.inspect(oTin,  {depth: null});
                tin_logger.write(tinData);
                tin_logger.write(',\n');
                tincount +=1;
            });
        });
    }
    writeFooter(tin_logger);
    tin_logger.end();
}

// =========== TEST TVAR
//{ stem: 'अचेट', dhatu: 'चिट', la: 'लुङ्', pada: 'परस्मै', tvar: 0 }
log('==>> la_to_test:', la_to_test);
log('==>> json tins :', lakara);
// log('==>> json tins p:', latins[la_to_test]['प.प']);
// log('==>> json tins a:', latins[la_to_test]['आ.प']);

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
