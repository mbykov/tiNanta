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


var laks = {'लट्': {}, 'लङ्': {}, 'लिट्': {}, 'लुङ्': {}, 'लुट्': {}, 'लृट्': {}, 'लोट्': {}, 'विधिलिङ्': {}, 'आशीर्लिङ्': {}, 'लृङ्': {}}; // लृट् -> ऌट् ;  लृङ् -> ॡङ्
var gana_to_test = '03';
var la_to_test = 'लट्'; // लट् ; लङ् ; लोट् ; विधिलिङ् ; लिट् ; लुट् ; लृट् ; आशीर्लिङ् ; लृङ्


// для 02, 03 нужно писать свой json. Звонкие-глухие, etc
// law - 04, 05, 06, 08, 09, 10 - годится
// laN - 04, 05, 06, 09, 10
// low - 04, 05, 06, 08?, 09, 10
// vidh - 02, 03, 04, 05, 06, 07, 08, 09, 10
// liw - 02, 03, 04, 05, 06, 07, 08, 09, 10
// luw - 02, 03, etc
// lft - 02, etc
// a-lin - etc

/*
  и, наконец.
  кроме dp и dhatu_anga
 */

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
    var gana, num, pada;
    var docs = [];
    var testdocs = [];
    var doc, laDocs, laDoc;
    // आंसयत्,अंस,लङ्,तिप्,10.0460
    listForms.forEach(function(row, idz) {
        // if (idz > 10) return;
        if (row == '') return;
        [form, dhatu, la, tip, nums] = row.split(',');
        key = [dhatu, nums].join('-');
        gana = nums.split('.')[0];
        num = nums.split('.')[1];

        if (gana_to_test && gana_to_test != gana) return; // ============================ GANA ==============
        // if (dhatu != 'ऋ') return; // == DHATU == law अक! =  liw-redup?-ध्मा  // - liw-redup = ध्रज! periph-अय! // red-गज! ;ह्वृ


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
        // dhatus do not exist in dtatupatha_cache && rawcomplete. So, I dont know how to correct:
        // if (inc(['इण्-02.0040', 'राधो!-04.0077', 'दृ-05.0037', 'कृप!-10.0278', 'गद-10.0399', 'श्लिष!-10.0059', 'पिश!-10.0105', 'घृ-10.0152', 'पुण!-10.0133', 'ञिमिदा!-10.0012'], vkey)) continue;
        // можно поправить  राधो!-04.0077 =  राध
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
            // इ॒ण्-इण्-इ-अ-प-अनिट्-02-0041
            // log(4, dps[4]);
            // var dd  = dps[4];
            // log('=', dd.gana == vhead.gana && dd.num == vhead.nem);
            throw new Error();
        }
        // log('DPS', dicts);

        // dicts.forEach(function(dict) {
        laDocs = parseNest(vnest, vhead.gana);
        laDocs.forEach(function(ladoc) {
            dicts.forEach(function(dict) {
                doc = {dhatu: dict.dhatu, gana: vhead.gana, num: vhead.num, las: {}};
                doc.stem = ladoc.stem;
                doc.la = ladoc.la;
                doc.pada = ladoc.pada;
                doc.tvar = ladoc.tvar;
                // doc.key = vkey;
                doc.las[ladoc.la] = ladoc.nest;
                if (ladoc.periph) doc.periph = true;
                if (ladoc.tips) doc.tips = ladoc.tips; // strong, weak tips
                // p('NEST Doc', doc);
                docs.push(doc);
                });
        });
        // });
    }

    log('doc:', docs.length);
    // log(docs[200]);
    // log('nest:', nests['अहि!-01.0722'][0]);

    writeDhatuAnga(docs);
    writeTinCache(endings, canonicals);
    writeTestsCache(docs);
}

function parseNest(nest, gana) {
    // log('D', JSON.stringify(nest));
    // var check = {};
    var lakaras = [];
    var la;
    var lanest;
    var laForms;
    var re;
    _.keys(laks).forEach(function(la) {
        if (la_to_test && la != la_to_test) return; // ================= LA TO TEST ============ <<<
        // log('LA', la);
        lanest = _.select(nest, function(line) { return line.la == la});
        lakaras.push({la: la, nest: lanest});
    });
    // p(lakaras);
    // log(1, laks);
    // log(2, _.keys(laks));
    // return [];

    var docs = [];
    var doc, stem, sdocs, json;
    lakaras.forEach(function(lakara) {
        if (la_to_test && lakara.la != la_to_test) return; // ================= LA TO TEST ============ <<<

        // log('FF==================', lakara.la); // lakara.nest
        laForms = parseLakara(lakara.nest);
        // log('F', laForms); // lakara.nest
        for (var pada in laForms) {
            var forms = laForms[pada];
            // log('F', forms);
            stem = parseStem(forms);
            if (gana == '03' && stem != '') {
                sdocs = parseRedup(forms, pada);
            } else if (lakara.la == 'लिट्') {
                sdocs = parseStemLiwPeriph(forms);
                if (!sdocs && stem != '') sdocs = parseRedup(forms, pada);
            } else {
                // stem = parseStem(forms);
                if (lakara.la == 'लुट्') stem = u.replaceEnd(stem, 'ता', '');
                else if (lakara.la == 'लृट्') {
                    stem = stem.replace('ष्य', '').replace('स्य', '');
                    // stem = u.replaceEnd(stem, 'स्य', '');
                } else if (lakara.la == 'आशीर्लिङ्') {
                    if (pada == 'प') {
                        // stem = u.replaceEnd(stem, 'या', '');
                    } else {
                        // stem = u.replaceEnd(stem, 'सी', '');
                    }
                }
                sdocs = [{stem: stem}];
            }
            // log('SDocs', sdocs);
            json = parseJSON(sdocs, forms);
            // log('JSON', sdocs);
            sdocs.forEach(function(sdoc) {
                doc = {stem: sdoc.stem, gana: gana, la: lakara.la, pada: pada, nest: forms};
                // if (json == '{"तिप्":[""],"तस्":[""],"झि":[""],"सिप्":[""],"थस्":[""],"थ":[""],"मिप्":[""],"वस्":[""],"मस्":[""]}' ) log('ERR', doc);
                var glpkey = [gana, lakara.la, pada].join('-');
                doc.tvar = parseTvar(glpkey, json);
                if (sdoc.tips) doc.tips = sdoc.tips;
                // log('parse la DOC:', doc);
                docs.push(doc);
            });
        }

    });
    // log('==>>', docs); // laDocs;
    return docs;
}

function parseLakara(nest) {
    // log('la nest size:', nest.length);
    var forms = {};
    // var docs = [];
    nest.forEach(function(line) {
        if (inc(pars, line.tip)) {
            if (!forms['प']) forms['प'] = {};
            if (!forms['प'][line.tip]) forms['प'][line.tip] = [];
            forms['प'][line.tip].push(line.form);
        } else if (inc(atms, line.tip)) {
            if (!forms['आ']) forms['आ'] = {};
            if (!forms['आ'][line.tip]) forms['आ'][line.tip] = [];
            forms['आ'][line.tip].push(line.form);
        }
    });
    return forms;
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

function parseJSON(sdocs, forms) {
    // log('SD', sdocs);
    // log('F', forms);
    var json;
    var ostin = {};
    for (var tip in forms) {
        sdocs.forEach(function(sdoc) {
            if (sdoc.tips && !inc(sdoc.tips, tip)) return;
            var form2 = forms[tip];
            ostin[tip] = [];
            form2.forEach(function(form, idx) {
                var reStem = new RegExp('^' + sdoc.stem);
                var stin = form.replace(reStem, '');
                // var size = sdoc.stem.length;
                // var stin
                // log('SSS', tip, 2, stin, form, stin == form);
                // if (stin == form) ostin[tip].push(form); // не тот mip-tin
                // else ostin[tip].push(stin);
                ostin[tip].push(stin);
            });
            ostin[tip] = _.uniq(ostin[tip]);
        });
    }
    json = JSON.stringify(ostin);
    // log('JSON=', json);
    return json;
}


// function parseJSON_(stem, forms) {
//     var reStem = new RegExp('^' + stem);
//     var tinArr = [];
//     var json;
//     // { 'तिप्': [ 'ज्योतति' ],
//     var ostin = {};
//     for (var tip in forms) {
//         var strs = forms[tip];
//         ostin[tip] = [];
//         strs.forEach(function(form, idx) {
//             var stin = form.replace(reStem, '');
//             // tinArr.push({tip: tip, tin: stin});
//             ostin[tip].push(stin);
//         });
//         ostin[tip] = _.uniq(ostin[tip]);
//         // tinArr.push(ostin);
//     }
//     json = JSON.stringify(ostin);
//     return json;
// }

function parseTvar(glpkey, json) {
    // var pada = laDoc.pada;
    // var json = laDoc.json;
    // var glpkey = [gana, la, pada].join('-');
    var tvar = '';
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
    // log('TVAR', tvar);
    return tvar;
}

function parseStemLiwPeriph(forms) {
    // log('=LIT Periph=', nest.length);
    var periph_tin = {'तिप्': 'ञ्चकार', 'तस्': 'ञ्चक्रतुः', 'झि': 'ञ्चक्रुः', 'सिप्': 'ञ्चकर्थ', 'थस्': 'ञ्चक्रथुः', 'थ': 'ञ्चक्र', 'मिप्': 'ञ्चकर-ञ्चकार', 'वस्': 'ञ्चकृव', 'मस्': 'ञ्चकृम', 'त': 'ञ्चक्रे', 'आताम्': 'ञ्चक्राते', 'झ': 'ञ्चक्रिरे', 'थास्': 'ञ्चकृषे', 'आथाम्': 'ञ्चक्राथे', 'ध्वम्': 'ञ्चकृढ्वे', 'इट्': 'ञ्चक्रे', 'वहि': 'ञ्चकृवहे', 'महिङ्': 'ञ्चकृमहे'};
    var stems = [];
    for (var tip in forms) {
        var form2 = forms[tip];
        // log('=LIT=', tip, form2);
        form2.forEach(function(form) {
            var rawstem = form;
            var ends = periph_tin[tip];
            ends.split('-').forEach(function(e) {
                rawstem = rawstem.replace(e, '');
            });
            stems.push(rawstem);
        });
    }
    stems = _.uniq(stems);
    // log('LIT periph stems', stems.length);
    var stem;
    if (stems.length == 1) {
        stem = stems[0];
        var reA = new RegExp(c.A+ '$');
        stem = stem.replace(reA, ''); // FIXME: но что, если сам stem заканчивается на A? тогда он не перифрастик?
        return [{stem: stem, periph: true}];
    }
}

// var tips = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
// var pars = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
// var atms = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
/*
  - strong - tip-форма
  - проверить sip и mip (а м.б. еще и vriddhi-guna разница).
  - сформировать strongs-weaks массивы ? зачем, все stems уже известны и там. Проверить совпадение stems?
  - вернуть {strong: strong, weak: weak};
  - или [{stem: stem, strong: true}, {stem: stem, tips: [tip, sip, mip], {остальные, mip-оба} };
  -
*/
function parseRedup(forms, pada) {
    // log('LIT REDUP:', forms);
    // here stem != ''; i.e. not exception
    var strongs = [];
    var weaks = [];
    var strong, weak, re, rew;
    var form2;
    var sdoc, wdoc, zero;
    var docs = [];
    if (pada == 'प') {
        strong = forms['तिप्'][0];
        weak = forms['झि'][0] ;
        re = new RegExp('ौ' + '$'); // FIXME: всегда au? не всегда.
        strong = strong.replace(re, '');
        re = new RegExp('ति' + '$'); // gana 03
        strong = strong.replace(re, '');
        // log('STRONG', strong);

        rew = new RegExp('ुः' + '$'); // weak
        weak = weak.replace(rew, '');
        rew = new RegExp('ति' + '$'); // gana 03
        weak = weak.replace(rew, '');
        // log('WEAK', weak);

        re = new RegExp('^' + strong);
        rew = new RegExp('^' + weak);
        for (var tip in forms) {
            form2 = forms[tip];
            form2.forEach(function(form) {
                if (re.test(form)) strongs.push(tip);
                if (rew.test(form)) weaks.push(tip);
                else zero = true;
                // log('------------------------------------', tip, form, weaks.length);
            });
        }

        if (zero) docs.push({stem: ''}); // exception
        else {
            // FIXME: очень коряво, поправить
            // хотя работае правильно
            if (strong) sdoc = {stem: strong, tips: strongs};
            wdoc = {stem: weak};
            if (strong) wdoc.tips = weaks;
            if (strong) docs.push(sdoc);
            if (strong != weak) docs.push(wdoc);
        }

    } else {
        // log('======================= AAA');
        weak = forms['झ'][0] ;
        re = new RegExp('िरे' + '$');
        weak = weak.replace(re, '');
        re = new RegExp('रे' + '$');
        weak = weak.replace(re, '');

        re = new RegExp('ते' + '$'); // gana 03
        weak = weak.replace(re, '');
        for (var tip in forms) {
            form2 = forms[tip];
            form2.forEach(function(form) {
                weaks.push(tip);
            });
        }
        wdoc = {stem: weak};
        docs.push(wdoc);
    }
    // log('DDD', docs);
    return docs;
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
    tin_logger.write('tip, tin, size, gana, la, pada \n');

    var check = {};
    var tkey;
    var tincount = 0;
    for (var glpkey in endings) {
        var gana, la, pada;
        [gana, la, pada] = glpkey.split('-');
        if (la_to_test && la != la_to_test) continue; // ========================== LAKARA
        var jsons = endings[glpkey].arr;
        // log('>>>>>>>>>>>>', gana, gana == '02', canonicals[gana])
        // var canons; // это - от заполнения таблицы canonicals
        // if (canonicals[gana] && canonicals[gana][la]) canons = canonicals[gana][la][pada];
        // else canons = [];
        // log('=====', glpkey, gana, la, pada, jsons);
        // continue;
        jsons.forEach(function(json, tvar) {
            // var canon = false;
            // if (inc(canons, json)) canon = true;
            // var tins = json.split(',');
            var otins = JSON.parse(json);
            var oTin, tinData;
            var tinrow;
            // var tcan, periph;
            // var rePeriph = new RegExp('ाञ्चक');
            for (var tip in otins) {
                var tins = otins[tip];
                tins.forEach(function(tin, idz) {
                    tkey = [tip, tin, gana, la, pada].join('-'); // здесь добавить json не нужно, а нужно в parse - иначе там дубли. А здесь?
                    if (check[tkey]) return;
                    check[tkey] = true;
                    // tcan = (canon) ? 1 : 0;
                    // periph = (rePeriph.test(tin)) ? 1 : 0;
                    // ================================= ROW: =====================
                    tinrow = [tip, tin, tin.length, gana, la, pada].join('-');
                    // tvar, tcan -  затираются если ключ совпадает. Periph - всегда уникальный
                    // но в tins мне tvar и canon - не нужны, кажется
                    // да и periph нужен только для преобразования stem в dhatu, чего в новом index.js нет
                    tinrow = [tinrow, '\n'].join('');
                    tin_logger.write(tinrow);
                    // tin_logger.write('\n');
                    tincount +=1;
                });
            }
        });
    }
    tin_logger.end();
    log('tins:', tincount);
}


//
function writeDhatuAnga(docs) {
    fs.unlinkSync(dhatuAngaCachePath);
    var da_logger = fs.createWriteStream(dhatuAngaCachePath, {
        flags: 'a', // 'a' means appending (old data will be preserved)
        defaultEncoding: 'utf8'
    });
    da_logger.write('dhatu, stem, gana, la, pada, tvar, tips, sha1\n');
    var check = {};
    docs.forEach(function(doc) {
        // log('DA', doc);
        var shamsg = [doc.stem, doc.gana, doc.la, doc.pada, doc.tvar, doc.tips].join('-');
        var shakey = sha1(shamsg);
        var row = [doc.dhatu, shamsg, shakey].join('-');
        // log('DA ROW', row);
        if (!check[row]) {
            check[row] = true;
            da_logger.write(row);
            da_logger.write('\n');
        }
    });
    da_logger.end();
}

function writeTestsCache(docs) {
    fs.unlinkSync(testsCachePath);
    var test_logger = fs.createWriteStream(testsCachePath, {
        flags: 'a', // 'a' means appending (old data will be preserved)
        defaultEncoding: 'utf8'
    });

    var row, key;
    var doc, keynum, nest, n;
    var sres, sdhatus;
    var check = {};
    var size = 0;
    docs.forEach(function(doc, idx) {
        // if (idx > 0) return;
        // log('D', doc);
        for (var la in doc.las) {
            if (la_to_test && la != la_to_test) continue;
            var nest = doc.las[la];
            // log('N', nest);
            for (var tip in nest) {
                var forms = nest[tip];
                forms.forEach(function(form) {
                    var excep = 0;
                    key = [form, doc.dhatu, doc.gana, doc.la, doc.pada, tip].join('-');
                    if (check[key]) return;
                    check[key] = true;

                    // sres = stemmer.query(form);
                    // sdhatus = sres.map(function(r) { return r.dhatu});
                    // if (!inc(sdhatus, doc.dhatu)) excep = 1;
                    // // if (n.form == 'व्ययति') log('NN', inc(sdhatus, doc.dhatu), 'doc', doc, 'res', sres, 'n:', n);

                    row = [form, doc.dhatu, doc.gana, doc.la, doc.pada, tip, excep].join('-');
                    // if (n.form == 'व्ययति') log('R', row);
                    // log('ROW', row);
                    test_logger.write(row);
                    test_logger.write('\n');
                    size += 1;
                });
            }
        }
    });
    test_logger.end();
    log('Tests size:', size);
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
