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
var dhatuPathaCachePath = path.join(__dirname, '../lib/dhatu_list_cache.txt');

var tinsCachePath = path.join(__dirname, '../lib/tins_cache.js');
var dhatuAngaCachePath = path.join(__dirname, '../lib/dhatu_anga_cache.txt');
var testsCachePath = path.join(__dirname, '../test/uohyd_tests_cache.txt');

var canonicalTinsPath = path.join(__dirname, '../lib/canonical_tins.js');
var canonObj = require(canonicalTinsPath);


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

// fs.unlinkSync(dhatuPathaCachePath);
// var list_logger = fs.createWriteStream(dhatuPathaCachePath, {
//     flags: 'a', // 'a' means appending (old data will be preserved)
//     defaultEncoding: 'utf8'
// });


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
        // dhatu = dhatu.replace('!', ''); // FIXME: верно-ли убирать "!" ? или м.б. совпадающие после этого? Или c.virama ?
        if (!check[key]) {
            check[key] = true;
            heads[key] = {dhatu: dhatu, gana: gana, num: num}; // , key: key
            nests[key] = [line];
        } else {
            nests[key].push(line);
        }
    });
    // nests.push(nest);
    // nests.shift();

    // log('N', nests['अंस-10.0460']);
    // इक्,लट्,तिप्,02.0042
    log('N', _.keys(heads).length, _.keys(nests).length);
    // log('N', heads[0], nests[0][0]);
    // return;
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
        doc = {dhatu: vhead.dhatu, gana: vhead.gana, num: vhead.num};
        laDocs = parseNest(vnest, vhead.gana, vhead.dhatu);
        laDocs.forEach(function(ladoc) {
            doc.stem = ladoc.stem;
            doc.pada = ladoc.pada;
            doc.tvar = ladoc.tvar;
            });
        docs.push(doc);
    }

    log('d:', docs.length, docs[100]);
    // writeDhatuAnga(docs);
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
        var tinForm = {};
        tinForm[line.tip] = line.form;
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
        // json = parseJSON(stem, forms);
        json = 'json';
        doc = {stem: stem, pada: pada, json: json};
        docs.push(doc);
        // log('D', doc);
    });
    // [ { stem: 'तप', pada: 'प', json: 'ति,तः,न्ति,सि,थः,थ,ामि,ावः,ामः' } ]
    return docs;
}

function parseStem(forms) {
    var column;
    var syms = [];
    var stem;
    var idx = 0;
    var values = _.values(forms); // тут м.б. засада, если разные стемы? => 36 ?
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

function parseJSON(stem, forms) {
    var reStem = new RegExp('^' + stem);
    var tinArr = [];
    var json;
    for (var tip in forms) {
        var strs = forms[tip];
        strs.forEach(function(form, idx) {
            // var tip = idx.toString();
            var stin = form.replace(reStem, '');
            var ostin = {};
            ostin[tip] = stin;
            // tinArr.push({tip: tip, tin: stin});
            tinArr.push(stin); // тут в строке json только сами tin-s. XXX
        });
    }
    json = tinArr.toString();
    return json;
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

p(endings);

// p(canonObj);
writeTinCache(endings, canonObj);

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
            var tins = json.split(',');
            var oTin, tinData;
            var tip;
            tins.forEach(function(tin, idz) {
                tip = tips[pada][idz];
                // if (!tip) log('!!!!!!!!', tips[pada]);
                // XXXX
                // блин, tip-ов-то нет при неравной длинне

                tkey = [tin, gana, la, pada, tip].join('-'); // здесь добавить json не нужно, а нужно в parse - иначе дубли. Но нет ли пропуска в find?
                if (check[tkey]) return;
                check[tkey] = true;
                var tcan = (canon) ? 1 : 0;
                var tinstr = [tin, tip, tin.length, gana, la, pada, tvar, tcan].join('-');
                // oTin = {tin: tin, tip: tip, size: tin.length, gana: gana, la: la, pada: pada, tvar: tvar};
                // if (canon) oTin.canon = true;
                // tinData = util.inspect(oTin,  {depth: null});
                tin_logger.write(tinstr);
                tin_logger.write('\n');
                tincount +=1;
            });
        });
    }
    tin_logger.end();
    log('tins:', tincount);
}


// этот файл - только для поиска исключений:
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
