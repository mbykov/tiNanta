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
var stemmer = require('../index');

var dataPath = path.join(__dirname, '../uohyd/drpatel/generatedverbforms_deva20062016.csv');

var dhatuPathaCachePath = path.join(__dirname, '../lib/dhatupatha_cache.txt');
var dhpths = fs.readFileSync(dhatuPathaCachePath).toString().split('\n');
// अं॑सँ॑-अंस-अंस्-चु-प-सेट्-10-0460
var dp, adp;
var dps = dhpths.map(function(row) {
    if (!row || row == '') return;
    adp = row.split('-');
    dp = {raw: adp[1], dhatu: adp[2], pada: adp[4], gana: adp[6], num: adp[7]};
    return dp;
});
dps = _.compact(dps);

// non-monosyllabic:
// dps.forEach(function(d) {
//     var vc = vowCount(d.dhatu);
//     if (vc != 1) log(vc, salita.sa2slp(d.dhatu), d.dhatu, d.gana, d.pada);
// });
// return;


var tinsCachePath = path.join(__dirname, '../lib/tins_cache.js');
var dhatuAngaCachePath = path.join(__dirname, '../lib/dhatu_anga_cache.txt');
var testsCachePath = path.join(__dirname, '../test/tests_cache.txt');

var canonicalTinsPath = path.join(__dirname, '../lib/canonical_tins.js');
var canonicals = require(canonicalTinsPath);

// var tips = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
// var tips = {
//     'प': ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'],
//     'आ': ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ'] // 'महिङ्' ? что правильно?
// }


var pars = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
var atms = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var endings = {};

var laks = {'लट्': {}, 'लङ्': {}, 'लिट्': {}, 'लुङ्': {}, 'लुट्': {}, 'ऌट्': {}, 'लोट्': {}, 'विधिलिङ्': {}, 'आशीर्लिङ्': {}, 'ॡङ्': {}};
var la_to_test = 'लिट्'; // लट् ; लङ् ; लोट् ; विधिलिङ् ;
// p(canonicals['01'][la_to_test]);
// return;

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
    var testdocs = [];
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
        if (dhatu != 'ध्रज!') return; // =============================== DHATU =========== ध्मा        var pada;
        if (inc(pars, tip)) pada = 'प';
        if (inc(atms, tip)) pada = 'आ';
        var line = {form: form, la: la, tip: tip, dhatu: dhatu, gana: gana, pada: pada}; // , num: num, key: key
        // dhatu = dhatu.replace('!', '');
        // FIXME: верно-ли убирать "!" ? или м.б. совпадающие после этого? Или c.virama ?

        if (!check[key]) {
            check[key] = true;
            heads[key] = {dhatu: dhatu, gana: gana, num: num, key: key}; //
            nests[key] = [line];
        } else {
            nests[key].push(line);
        }
    });

    log('N-heads', _.keys(heads).length, 'N-nests', _.keys(nests).length);

    var dicts;
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
        dicts = _.select(dps, function(dp) { return dp.gana == vhead.gana && dp.num == vhead.num && (dp.raw == vhead.dhatu || dp.raw.replace(/!/g, '') == vhead.dhatu.replace(/!/g, '')) });
        if (dicts.length == 0) {
            log('doc head:', vkey, vhead);
            log('dicts:', dicts);
            // log(4, dps[4]);
            // var dd  = dps[4];
            // log('=', dd.gana == vhead.gana && dd.num == vhead.nem);
            throw new Error();
        }
        dicts.forEach(function(dict) {
            laDocs = parseNest(vnest, vhead.gana, dict.dhatu);
            laDocs.forEach(function(ladoc) {
                doc = {dhatu: dict.dhatu, gana: vhead.gana, num: vhead.num, las: {}};
                doc.stem = ladoc.stem;
                doc.pada = ladoc.pada;
                doc.tvar = ladoc.tvar;
                // doc.key = vkey;
                doc.las[ladoc.la] = ladoc.nest;
                docs.push(doc);
            });
            // if (dict.dhatu == 'व्यय्') log('DHATU:', vkey, 'vh', vhead, 'dict', dict, 'doc');
        });

        // vnest.forEach(function(n) { n.dhatu = cleandhatu});
    }

    log('doc:', docs.length);
    // log(docs[200]);
    // log('nest:', nests['अहि!-01.0722'][0]);

    writeDhatuAnga(docs);
    writeTinCache(endings, canonicals);
    writeTestsCache(docs);
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

        if (lakara.la == 'लिट्') laDocs = parseLakaraLiw(lakara.nest);
        laDocs = parseLakara(lakara.la, lakara.nest);

        laDocs.forEach(function(laDoc) {
            tvar = parseTvar(gana, lakara.la, laDoc);
            // log('==>>', lakara.la, 'tvar:', tvar, laDoc);
            laDoc.tvar = tvar;
            laDoc.la = lakara.la;
            laDoc.nest = lakara.nest;
        });
    });
    // log('==>>', laDocs);
    return laDocs;
}

function parseLakaraLiw(nest) {
    // log('=LIT=', nest);
    var periph_tin = {'तिप्': 'ञ्चकार', 'तस्': 'ञ्चक्रतुः', 'झि': 'ञ्चक्रुः', 'सिप्': 'ञ्चकर्थ', 'थस्': 'ञ्चक्रथुः', 'थ': 'ञ्चक्र', 'मिप्': 'ञ्चकर-ञ्चकार', 'वस्': 'ञ्चकृव', 'मस्': 'ञ्चकृम', 'त': 'ञ्चक्रे', 'आताम्': 'ञ्चक्राते', 'झ': 'ञ्चक्रिरे', 'थास्': 'ञ्चकृषे', 'आथाम्': 'ञ्चक्राथे', 'ध्वम्': 'ञ्चकृढ्वे', 'इट्': 'ञ्चक्रे', 'वहि': 'ञ्चकृवहे', 'महिङ्': 'ञ्चकृमहे'};
    var stems = [];
    nest.forEach(function(line) {
        var rawstem = line.form;
        var tip = line.tip;
        var ends = periph_tin[tip];
        ends.split('-').forEach(function(e) {
            rawstem = rawstem.replace(e, '');
        });
        stems.push(rawstem);
    });
    stems = _.uniq(stems);
    log('LIT periph stems', stems.length);
    var stem;
    if (stems.length == 1) stem = stems[0];
    // else throw new Error('periphrastic stem: ' + stems);
    else stem = parseRedup(nest);
    // if (!stem) return;
    // else return; // то есть не periphrastic, идем обычныи путем
    // FIXME: нужно также где-то проверить признаки periphrastic - долгота гласной, моносиллабик, etc
    var reA = new RegExp(c.A+ '$');
    stem = stem.replace(reA, ''); // FIXME: но что, если сам stem заканчивается на A? тогда он не перифрастик?
    return stem;

}


function parseRedup(nest) {
    log('LIT REDUP:');
    var docs = [];
    var strongs = {};
    var weaks = {};
    // var tips = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
    // var pars = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
    // var atms = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
    nest.forEach(function(line) {
        if (line.tip == 'तिप्') {
            if (!strongs[line.tip]) strongs[line.tip] = [];
            strongs[line.tip].push(line.form);
        } else {
            if (!weaks[line.tip]) weaks[line.tip] = [];
            weaks[line.tip].push(line.form);
        }

    });

    var pada, doc, stem, json;
    [strongs, weaks].forEach(function(forms, idx) {
        if (_.keys(forms).length == 0) return;
        // log('FORMS', forms);
        stem = parseStem(forms); // if (!stem)
        if (!stem) return;
        json = parseJSON(stem, forms);
        pada =  (forms['तिप्']) ? 'प' : 'आ';
        doc = {stem: stem, pada: pada, json: json};
        docs.push(doc);
        log('D', doc);
    });
    return 'docs';
}

function parseLakara(la, nest) {
    // log('la size:', la, nest.length);
    var pforms = {};
    var aforms = {};
    var docs = [];
    nest.forEach(function(line) {
        if (inc(pars, line.tip)) {
            if (!pforms[line.tip]) pforms[line.tip] = [];
            pforms[line.tip].push(line.form);
        } else if (inc(atms, line.tip)) {
            if (!aforms[line.tip]) aforms[line.tip] = [];
            aforms[line.tip].push(line.form);
        }
        else log('NO TIP', la, line);
    });

    var pada, doc, stem, json;
    [pforms, aforms].forEach(function(forms, idx) {
        if (_.keys(forms).length == 0) return;
        // log('F', forms);
        // if (la == 'लिट्') stem = parseStemLiw(forms);
        // if (la == 'लिट्' && !stem) stem = parseRedup(forms);
        stem = parseStem(forms); // if (!stem)
        if (!stem) return;
        json = parseJSON(stem, forms);
        pada = (idx == 0) ? 'प' : 'आ';
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

// ===================================================================
p(endings);


function writeTinCache(endings, canonicals) {
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
        if (la_to_test && la != la_to_test) continue; // ========================== LAKARA
        var jsons = endings[glpkey].arr;
        var canons = canonicals[gana][la][pada];
        // log('=====', glpkey, gana, la, pada, jsons);
        // continue;
        jsons.forEach(function(json, tvar) {
            var canon = false;
            if (inc(canons, json)) canon = true;
            // var tins = json.split(',');
            var otins = JSON.parse(json);
            var oTin, tinData;
            var tcan, tinrow;
            for (var tip in otins) {
                var tins = otins[tip];
                tins.forEach(function(tin, idz) {
                    tkey = [tip, tin, gana, la, pada].join('-'); // здесь добавить json не нужно, а нужно в parse - иначе там дубли. А здесь?
                    if (check[tkey]) return;
                    check[tkey] = true;
                    tcan = (canon) ? 1 : 0;
                    tinrow = [tip, tin, tin.length, gana, la, pada, tvar, tcan].join('-');
                    tin_logger.write(tinrow);
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
    var check = {};
    docs.forEach(function(doc) {
        var shamsg = [doc.stem, doc.gana, doc.pada, doc.tvar].join('-');
        var shakey = sha1(shamsg);
        var row = [doc.dhatu, shamsg, shakey].join('-');
        if (!check[row]) {
            check[row] = true;
            da_logger.write(row);
            da_logger.write('\n');
        }
    });
    da_logger.end();
}

// {"form":"दोग्धि","dhatu":"दुह्","gana":"अदादि","la":"लट्","pada":"प.प","tip":"तिप्","dslp":"duh","lslp":"law","aslp":"prapUraRe","gslp":"adAd
// test = {form: form, dhatu: dhatu, gana: gana, la: la, pada: pada, tip: tip, dslp: dslp, lslp: lslp, aslp: aslp, gslp: gslp, pslp: pslp};
function writeTestsCache(docs) {
    fs.unlinkSync(testsCachePath);
    var test_logger = fs.createWriteStream(testsCachePath, {
        flags: 'a', // 'a' means appending (old data will be preserved)
        defaultEncoding: 'utf8'
    });

    // var tests = [];
    var row, key;
    var doc, keynum, nest, n;
    var size = 0;
    var sres, sdhatus;
    var check = {};
    docs.forEach(function(doc, idx) {
        // if (idx > 0) return;
        // log('D', doc);
        for (var la in doc.las) {
            if (la_to_test && la != la_to_test) continue;
            var nest = doc.las[la];
            nest.forEach(function(n) {
                var excep = 0;
                key = [n.form, doc.dhatu, n.gana, n.la, n.pada, n.tip].join('-');
                if (check[key]) return;
                check[key] = true;

                sres = stemmer.parse(n.form);
                sdhatus = sres.map(function(r) { return r.dhatu});
                if (!inc(sdhatus, doc.dhatu)) excep = 1;
                // if (n.form == 'व्ययति') log('NN', inc(sdhatus, doc.dhatu), 'doc', doc, 'res', sres, 'n:', n);

                row = [n.form, doc.dhatu, n.gana, n.la, n.pada, n.tip, excep].join('-');
                // if (n.form == 'व्ययति') log('R', row);
                // log('R', row);
                test_logger.write(row);
                test_logger.write('\n');
                size += 1;
            });
        }
    });
    test_logger.end();
    log('Tsize:', size);
}

function vowCount(str) {
    var syms = str.split('');
    var vows = (u.c(c.allvowels, syms[0])) ? 1 : 0;
    syms.forEach(function(s) {
        if (u.c(c.hal, s)) vows+=1;
        else if (c.virama == s) vows-=1;
    });
    return vows;
}
