//

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
var sha1 = require('sha1');

var dataPath = path.join(__dirname, '../uohyd/drpatel/generatedverbforms_deva20062016.csv');

var dhatuPathaCachePath = path.join(__dirname, '../lib/dhatupatha_cache.txt');
var dhpths = fs.readFileSync(dhatuPathaCachePath).toString().split('\n');
// अहि!-अंह-01-आ-0-sha1
var dp, adp;
var dps = dhpths.map(function(row) {
    adp = row.split('-');
    dp = {raw: adp[1], dhatu: adp[2]};
    return dp;
});

// log('DPS', dps[10]);
// return;

var tinsCachePath = path.join(__dirname, '../lib/tins_cache.js');
var dhatuAngaCachePath = path.join(__dirname, '../lib/dhatu_anga_cache.txt');
var testsCachePath = path.join(__dirname, '../test/tests_cache.txt');

var canonicalTinsPath = path.join(__dirname, '../lib/canonical_tins.js');
var canonObj = require(canonicalTinsPath);
// p(canonObj);


var laks = {'लट्': {}, 'लङ्': {}, 'लिट्': {}, 'लुङ्': {}, 'लुट्': {}, 'ऌट्': {}, 'लोट्': {}, 'विधिलिङ्': {}, 'आशीर्लिङ्': {}, 'ॡङ्': {}};
// var tips = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var tips = {
    'प': ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'],
    'आ': ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ'] // 'महिङ्' ? что правильно?
}

var pars = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
var atms = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var endings = {};
var la_to_test = 'लट्'; // लृङ्
var debug = true;


function formsRun(rows) {
    var listForms = fs.readFileSync(dataPath).toString().split('\n');
    var key;
    var form, dhatu, la, tip, nums;
    var check = {};
    var heads = {};
    var nests = {};
    var nest, line;
    var gana, num;
    var docs = [];
    var doc, laDocs, laDoc;
    // आंसयत्,अंस,लङ्,तिप्,10.0460
    listForms.forEach(function(row, idz) {
        // if (idz > 10000) return;
        if (row == '') return;
        [form, dhatu, la, tip, nums] = row.split(',');
        key = [dhatu, nums].join('-');
        gana = nums.split('.')[0];
        num = nums.split('.')[1];
        if (gana != '01') return; // =============================== GANA ==============
        var line = {form: form, la: la, tip: tip, dhatu: dhatu, gana: gana}; // , num: num, key: key
        // dhatu = dhatu.replace('!', '');
        // FIXME: верно-ли убирать "!" ? или м.б. совпадающие после этого? Или c.virama ?

        if (!check[key]) {
            check[key] = true;
            heads[key] = {dhatu: dhatu, gana: gana, num: num}; // , key: key
            nests[key] = [line];
        } else {
            nests[key].push(line);
        }
    });

    log('N-heads', _.keys(heads).length, 'N-nests', _.keys(nests).length);

    var dict, cleandhatu;
    for (var vkey in heads) {
        var vhead = heads[vkey];
        var vnest = nests[vkey];
        var ndhatus = vnest.map(function(n) { return n.dhatu});
        ndhatus = _.uniq(ndhatus);
        if (ndhatus.length > 1) {
            log(vhead, ndhatus, nest.length);
            log(vnest.slice(-2));
            throw new Error();
        }
        dict = _.find(dps, function(dp) { return dp.raw == vhead.dhatu || dp.raw.replace(/!/g, '') == vhead.dhatu.replace(/!/g, '') });
        if (!dict) {
            log('doc head:', vhead, vkey);
            throw new Error();
        }
        cleandhatu = dict.dhatu;

        doc = {dhatu: cleandhatu, gana: vhead.gana, num: vhead.num};
        laDocs = parseNest(vnest, vhead.gana, vhead.dhatu);
        laDocs.forEach(function(ladoc) {
            doc.stem = ladoc.stem;
            doc.pada = ladoc.pada;
            doc.tvar = ladoc.tvar;
            doc.key = vkey;
            // if (doc.dhatu == 'अच्') log('=D=', doc);
            docs.push(doc);
        });
    }

    log('d:', docs.length, docs[0]);
    writeDhatuAnga(docs);
    writeTinCache(endings, canonObj);
    writeTestsCache(docs, nests);
}

// { stem: 'ब्र',  dhatu: 'ब्रूञ्',  gana: 'अदादि',  la: 'लट्',  pada: 'आ.प',  tvar: 1 },
// test: {"form":"दोग्धि","dhatu":"दुह्","gana":"अदादि","la":"लट्","pada":"प.प","tip":"तिप्","dslp.... pa","excep":true}

function parseNest(nest, gana, dhatu) {
    // if (dhatu != 'अक!') return [];
    // log('D', dhatu, JSON.stringify(nest));
    // return [];
    var check = {};
    var lakaras = [];
    var la, prev;
    var lanest;
    var laDocs;
    var tvar;
    var re;
    _.keys(laks).forEach(function(la) {
        lanest = _.select(nest, function(line) { return line.la == la});
        lakaras.push({la: la, nest: lanest});
    });
    // p(lakaras);
    var docs = [];
    var doc;
    lakaras.forEach(function(lakara) {
        if (la_to_test && lakara.la != la_to_test) return; // ================================== LA TO TEST ============
        laDocs = parseLakara(lakara.la, lakara.nest);
        laDocs.forEach(function(laDoc) {
            tvar = parseTvar(gana, lakara.la, laDoc);
            // log('==>>', lakara.la, 'tvar:', tvar, laDoc);
            laDoc.tvar = tvar;
        });
    });
    // log('==>>', laDocs);
    return laDocs;
}

/*
  в parseLakara - разбить на пады. Если стемы равны, то stem, else - par, atm.
  если tips > 1, то через дефис, чтобы было 18=9+9
  если >= 36=18+18, то вычислять stems по первому каноническому tip - law,
  если tip не подходит,
*/

function parseLakara(la, nest) {
    // log('la size:', la, nest.length);
    if (nest.length == 21) {
        // log('ERR', la, nest.length, nest);
        if (debug) {
            // log('ERR', la, nest.length, JSON.stringify(nest));
            debug = false;
        }
        // throw new Error(nest[0]);
        // FIXME: похоже, если четко кратно 9, то разбить на 9 и в цикле FIXME:
        nest = nest.slice(0, 9);
    }
    var pforms = {};
    var aforms = {};
    var docs = [];
    nest.forEach(function(line) {
        // if (inc(pars, line.tip)) pforms.push(line.form);
        // else if (inc(atms, line.tip)) aforms.push(line.form);
        // else log('NO TIP', la, line);
        // var tinForm = {};
        // tinForm[line.tip] = line.form;
        if (inc(pars, line.tip)) {
            if (!pforms[line.tip]) pforms[line.tip] = [];
            pforms[line.tip].push(line.form);
        } else if (inc(atms, line.tip)) {
            if (!aforms[line.tip]) aforms[line.tip] = [];
            aforms[line.tip].push(line.form);
        }
        else log('NO TIP', la, line);
    });
    // var results = {};
    var pada, doc, stem, json;
    [pforms, aforms].forEach(function(forms, idx) {
        if (_.keys(forms).length == 0) return;
        // log('F', forms);
        stem = parseStem(forms);
        // if (stem == '') return;
        pada = (idx == 0) ? 'प' : 'आ'; // FIXME: это не верно, могут быть две или неск. p подряд
        json = parseJSON(stem, forms);
        // json = 'json';
        doc = {stem: stem, pada: pada, json: json};
        docs.push(doc);
        // log('D', doc);
    });
    // [ { stem: 'तप', pada: 'प', json: 'ति,तः,न्ति,सि,थः,थ,ामि,ावः,ामः' } ]
    return docs;
}

function parseJSON(stem, forms) {
    var reStem = new RegExp('^' + stem);
    var tinArr = [];
    var json;
    // { 'तिप्': [ 'ज्योतति' ],
    var ostin = {};
    for (var tip in forms) {
        var strs = forms[tip];
        ostin[tip] = [];
        strs.forEach(function(form, idx) {
            // var tip = idx.toString();
            var stin = form.replace(reStem, '');
            // tinArr.push({tip: tip, tin: stin});
            ostin[tip].push(stin);
        });
        ostin[tip] = _.uniq(ostin[tip]);
        // tinArr.push(ostin);
    }
    // json = tinArr.toString();
    json = JSON.stringify(ostin);
    return json;
}

function parseStem(forms) {
    var column;
    var syms = [];
    var stem;
    var idx = 0;
    // { 'तिप्': [ 'ज्योतति' ],
    var values = _.values(forms); // тут м.б. засада, если разные стемы? => 36 ?
    values = _.flatten(values);
    while(idx < 15) {
        column = values.map(function(form) { return form[idx];});
        var uniq = _.uniq(column);
        if (uniq.length > 1) break;
        syms.push(uniq[0]);
        idx++;
    };
    stem = syms.join('');
    return stem;
}

function parseTvar(gana, la, laDoc) {
    var pada = laDoc.pada;
    var json = laDoc.json;
    var tvar;
    var glpkey = [gana, la, pada].join('-');
    if (!endings[glpkey]) endings[glpkey] = {arr: [], freq: []};
    var index = endings[glpkey].arr.indexOf(json);
    if (index > -1) {
        tvar = index;
        if (!endings[glpkey].freq[index]) endings[glpkey].freq[index] = 0;
        endings[glpkey].freq[index] +=1;
    } else {
        endings[glpkey].arr.push(json);
        tvar = endings[glpkey].arr.indexOf(json);
        if (!endings[glpkey].freq[tvar]) endings[glpkey].freq[tvar] = 0;
        endings[glpkey].freq[tvar] +=1;
    }
    return tvar;
}

formsRun();

// p(endings);


function writeTinCache(endings, canonObj) {
    fs.unlinkSync(tinsCachePath);
    var tin_logger = fs.createWriteStream(tinsCachePath, {
        flags: 'a', // 'a' means appending (old data will be preserved)
        defaultEncoding: 'utf8'
    });

    var check = {};
    var tkey;
    var tincount = 0;
    for (var glpkey in endings) {
        var gana, la, pada;
        [gana, la, pada] = glpkey.split('-');
        if (la != 'लट्') continue; // ========================== LAKARA
        var jsons = endings[glpkey].arr;
        var canons = canonObj[gana][la][pada];
        // log('=====', glpkey, gana, la, pada, jsons);
        // continue;
        jsons.forEach(function(json, tvar) {
            var canon = false;
            if (inc(canons, json)) canon = true;
            // var tins = json.split(',');
            var otins = JSON.parse(json);
            var oTin, tinData;
            var tcan, tinstr;
            for (var tip in otins) {
                var tins = otins[tip];
                tins.forEach(function(tin, idz) {
                    tkey = [tip, tin, gana, la, pada].join('-'); // здесь добавить json не нужно, а нужно в parse - иначе там дубли. А здесь?
                    if (check[tkey]) return;
                    check[tkey] = true;
                    tcan = (canon) ? 1 : 0;
                    tinstr = [tip, tin, tin.length, gana, la, pada, tvar, tcan].join('-');
                    tin_logger.write(tinstr);
                    tin_logger.write('\n');
                    tincount +=1;
                });
            }
        });
    }
    tin_logger.end();
    log('tins:', tincount);
}


// этот cache - только для поиска исключений:
function writeDhatuAnga(docs) {
    fs.unlinkSync(dhatuAngaCachePath);
    var da_logger = fs.createWriteStream(dhatuAngaCachePath, {
        flags: 'a', // 'a' means appending (old data will be preserved)
        defaultEncoding: 'utf8'
    });
    docs.forEach(function(doc) {
        var shamsg = [doc.stem, doc.gana, doc.pada, doc.tvar].join('-');
        var shakey = sha1(shamsg);
        var row = [doc.dhatu, shamsg, shakey].join('-');
        da_logger.write(row);
        da_logger.write('\n');
    });
    da_logger.end();
}

// {"form":"दोग्धि","dhatu":"दुह्","gana":"अदादि","la":"लट्","pada":"प.प","tip":"तिप्","dslp":"duh","lslp":"law","aslp":"prapUraRe","gslp":"adAd
// test = {form: form, dhatu: dhatu, gana: gana, la: la, pada: pada, tip: tip, dslp: dslp, lslp: lslp, aslp: aslp, gslp: gslp, pslp: pslp};


function writeTestsCache(docs, nests) {
    log('Ts:', docs.length, _.keys(nests).length);

    fs.unlinkSync(testsCachePath);
    var test_logger = fs.createWriteStream(testsCachePath, {
        flags: 'a', // 'a' means appending (old data will be preserved)
        defaultEncoding: 'utf8'
    });

    // var tests = [];
    var row;
    var key, doc, keynum, nest, n;
    var size = 0;
    docs.forEach(function(doc, idx) {
        // if (idx > 0) return;
        // log('D', doc);
        // keynum = [doc.gana, doc.num].join('.');
        // key = [doc.dhatu, keynum].join('-');
        var nest = nests[doc.key];
        if (doc.dhatu == 'अच्') log('DD', doc, nest[0], nest.length);
        // log('N', nest[0]);
        // if (!nest) log('NO Test', doc, 'key', key);
        nest.forEach(function(n) {
            if (la_to_test && n.la != la_to_test) return; // ================================== LA TO TEST ============
            row = [n.form, doc.dhatu, doc.gana, n.la, doc.pada, n.tip].join('-');
            test_logger.write(row);
            test_logger.write('\n');
            // tests.push(test);
            size += 1;
        });
    });

    log('Ts:', size);
}
