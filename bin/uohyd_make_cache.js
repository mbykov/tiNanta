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

var dataPath = path.join(__dirname, '../uohyd/drpatel/generatedverbforms_deva20062016.csv');
var dhatuPathaCachePath = path.join(__dirname, '../lib/dhatu_list_cache.txt');

var tinsPath = path.join(__dirname, '../lib/uohyd_tins_cache.js');
var dhatuAngaPath = path.join(__dirname, '../lib/uohyd_dhatu_anga_cache.js');
var testsPath = path.join(__dirname, '../test/uohyd_tests_cache.txt');

var laks = {'लट्': {}, 'लङ्': {}, 'लिट्': {}, 'लुङ्': {}, 'लुट्': {}, 'ऌट्': {}, 'लोट्': {}, 'विधिलिङ्': {}, 'आशीर्लिङ्': {}, 'ॡङ्': {}};
var tips = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var pars = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
var atms = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var endings = {};
var la_to_test = 'लट्'; // लृङ्

// fs.unlinkSync(dhatuPathaCachePath);

var list_logger = fs.createWriteStream(dhatuPathaCachePath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});

function formsRun(rows) {
    var listForms = fs.readFileSync(dataPath).toString().split('\n');
    var key;
    var form, dhatu, la, tip, nums;
    var check = {};
    // var nests = [];
    var nest, line;
    var gana;
    var docs = [];
    var doc, laDocs, laDoc;
    // आंसयत्,अंस,लङ्,तिप्,10.0460
    listForms.forEach(function(row, idz) {
        // if (idz > 10000) return;
        if (row == '') return;
        [form, dhatu, la, tip, nums] = row.split(',');
        key = [dhatu, nums].join('-');
        line = {form: form, la: la, tip: tip};
        gana = nums.split('.')[0];
        if (gana != '01') return; // ============================================ GANA ============
        if (!check[key]) {
            check[key] = true;
            doc = {dhatu: dhatu, gana: gana, la: la}; // key: key,
            // log('D', dhatu, 'NUM', nums, gana);
            if (nest) {
                laDocs = parseNest(nest, gana, dhatu);
                laDocs.forEach(function(ladoc) {
                    doc.stem = ladoc.stem;
                    doc.pada = ladoc.pada;
                    doc.tvar = ladoc.tvar;
                });
                docs.push(doc);
                // FIXME: или здесь сделать коррекцию stem по gana? где ее делать?
            }
            nest = [line];
        } else {
            nest.push(line);
        }
    });
    log('d:', docs.length, docs.slice(0,5));
}

// { stem: 'ब्र',  dhatu: 'ब्रूञ्',  gana: 'अदादि',  la: 'लट्',  pada: 'आ.प',  tvar: 1 },
// test: {"form":"दोग्धि","dhatu":"दुह्","gana":"अदादि","la":"लट्","pada":"प.प","tip":"तिप्","dslp.... pa","excep":true}

function parseNest(nest, gana, dhatu) {
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

/*
  в parseLakara - разбить на пады. Если стемы равны, то stem, else - par, atm.
  если tips > 1, то через дефис, чтобы было 18=9+9
  если >= 36=18+18, то вычислять stems по первому каноническому tip - law,
  если tip не подходит,
*/

function parseLakara(la, nest) {
    // log('la size:', la, nest.length);
    if (nest.length > 18) {
        log('ERR', la, nest.length);
        // throw new Error(nest[0]);
        // FIXME: похоже, если четко кратно 9, то разбить на 9 и в цикле FIXME:
        nest = nest.slice(0, 8);
    }
    var pforms = [];
    var aforms = [];
    var docs = [];
    nest.forEach(function(line) {
        if (inc(pars, line.tip)) pforms.push(line.form);
        else if (inc(atms, line.tip)) aforms.push(line.form);
        else log('NO TIP', la, line);
    });
    var results = {};
    var pada, doc, stem, json;
    [pforms, aforms].forEach(function(forms, idx) {
        if (forms.length == 0) return;
        stem = parseStem(forms);
        // if (stem == '') return;
        pada = (idx == 0) ? 'प' : 'आ'; // FIXME: это не верно, могут быть две или неск. p подряд
        json = parseJSON(stem, forms);
        doc = {stem: stem, pada: pada, json: json};
        docs.push(doc);
    });
    // [ { stem: 'तप', pada: 'प', json: 'ति,तः,न्ति,सि,थः,थ,ामि,ावः,ामः' } ]
    return docs;
}

function parseStem(forms) {
    var column;
    var syms = [];
    var stem;
    var idx = 0;
    while(idx < 15) {
        column = forms.map(function(form) { return  form[idx];});
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
    forms.forEach(function(form, idx) {
        // var tip = idx.toString();
        var stin = form.replace(reStem, '');
        tinArr.push(stin);
    });
    json = tinArr.toString();
    return json;
}

formsRun();


// log('E:', endings);
