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
// var sha1 = require('sha1');
var stemmer = require('../index');

var dataPath = path.join(__dirname, '../uohyd/drpatel/generatedverbforms_deva20062016.csv');

var dhatuPathaCachePath = path.join(__dirname, '../lib/dhatupatha_cache.txt');
var dhpths = fs.readFileSync(dhatuPathaCachePath).toString().split('\n');
// dp: wsvara-wosvara-dhatu-gana-pada-set-num-
var dps = dhpths.map(function(row) {
    if (row == '') return;
    var arr = row.split('-');
    var dp = {ws: arr[0], wo: arr[1], dhatu: arr[2], gana: arr[3], pada: arr[4] , num: arr[6]};
    return dp;
});
dps = _.compact(dps);

// ब॑ल्हँ॑-बल्ह-बल्ह्-चु-आ-सेट्-10-0301
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

var conjugs = ['लट्', 'लङ्', 'लोट्', 'विधिलिङ्'];
var laks = {'लट्': {}, 'लङ्': {}, 'लिट्': {}, 'लुङ्': {}, 'लुट्': {}, 'लृट्': {}, 'लोट्': {}, 'विधिलिङ्': {}, 'आशीर्लिङ्': {}, 'लृङ्': {}}; // लृट् -> ऌट् ;  लृङ् -> ॡङ्

var gana_to_test;
var la_to_test;
// gana_to_test = '01';
// la_to_test = 'लट्'; // लट् ; लङ् ; लोट् ; विधिलिङ् ; लिट् ; लुट् ; लृट् ; आशीर्लिङ् ; लृङ्


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
        gana = nums.split('.')[0];
        num = nums.split('.')[1];
        dhatu = dhatu.trim();
        dhatu = dhatu.replace(/!/g, '');

        if (gana_to_test && gana_to_test != gana) return; // ============================ GANA ==============
        // if (dhatu != 'हिवि') return; // ================ DHATU ====================

        if (inc(pars, tip)) pada = 'प';
        if (inc(atms, tip)) pada = 'आ';

        key = [dhatu, nums].join('-');
        var line = {form: form, la: la, tip: tip, dhatu: dhatu, gana: gana, pada: pada}; // , num: num, key: key


        if (!check[key]) {
            check[key] = true;
            heads[key] = {dhatu: dhatu.trim(), gana: gana, num: num, key: key}; //
            nests[key] = [line];
        } else {
            nests[key].push(line);
        }
    });

    log('N-heads', _.keys(heads).length, 'N-nests', _.keys(nests).length);

    var dicts;
    for (var vkey in heads) {
        var vhead = heads[vkey];
        // log('V HEAD', vhead);
        var vnest = nests[vkey];
        var ndhatus = vnest.map(function(n) { return n.dhatu});
        ndhatus = _.uniq(ndhatus);
        if (ndhatus.length > 1) {
            log(vhead, ndhatus, nest.length);
            log(vnest.slice(-2));
            throw new Error();
        }
        // var fin, re;
        // ws-wo-dhatu-gana-pada-set-num
        // { dhatu: 'हिवि!', gana: '01', num: '0675', key: 'हिवि!-01.0675' }
        dicts = _.select(dps, function(dp) { return dp.gana == vhead.gana && dp.num == vhead.num && (dp.ws == vhead.dhatu || dp.wo == vhead.dhatu || dp.dhatu == vhead.dhatu) });
        if (dicts.length == 0) {
            log('DICT ERR:', vhead);
            // throw new Error();
        }
        // log('DICTS', dicts);
        // return;

        // dicts.forEach(function(dict) {
        laDocs = parseNest(vnest, vhead.gana);
        // log('laDocs', laDocs);
        // return;

        laDocs.forEach(function(ladoc) {
            dicts.forEach(function(dict) {
                // log('============', ladoc.la, dict.la);
                if (ladoc.gana != dict.gana || ladoc.pada != dict.pada || vhead.num != dict.num ) return;
                // if (ladoc.gana != dict.gana || ladoc.la != dict.la || ladoc.pada != dict.pada || vhead.num != dict.num ) return;
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

    log('_doc_:', docs.length);
    // log(docs);
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

    // если conj, то P - parseStrongWeak ?
    // если нет, то всегда parseStem
    // [{la, pada, conj, nest}, ...]
    // а здесь цикл - если conj, то parseSW, нет - parseStem XXX
    //
    var docs = [];
    var doc, stem, sdocs, json;
    lakaras.forEach(function(lakara) {
        if (la_to_test && lakara.la != la_to_test) return; // ================= LA TO TEST ============ <<<
        // log('FF==================', lakara.la); // lakara.nest
        laForms = parseLakara(lakara.nest);
        // log('F', laForms); // lakara.nest
        // XXX
        var la = lakara.la;
        for (var pada in laForms) {
            var forms = laForms[pada];
            if (/ञ्चक/.test(forms['तिप्']) || /ञ्चक/.test(forms['त']) ) sdocs = parsePeriph(forms);
            else if (pada == 'प' && inc(conjugs, la)) sdocs = parseStrongWeak(forms);
            else {
                stem = parseStem(forms);
                // if (!stem) continue;

                // if (la == 'लुट्') stem = u.replaceEnd(stem, 'ता', '');
                // else if (la == 'लृट्') stem = stem.replace('ष्य', '').replace('स्य', '');
                // else if (la == 'आशीर्लिङ्') {
                //     if (pada == 'प') {
                //         // stem = u.replaceEnd(stem, 'या', '');
                //     } else {
                //         // stem = u.replaceEnd(stem, 'सी', '');
                //     }
                // }
                sdocs = [{stem: stem}];
            }
            json = parseJSON(sdocs, forms);
            sdocs.forEach(function(sdoc) {
                doc = {stem: sdoc.stem, gana: gana, la: la, pada: pada, nest: forms};
                // if (json == '{"तिप्":[""],"तस्":[""],"झि":[""],"सिप्":[""],"थस्":[""],"थ":[""],"मिप्":[""],"वस्":[""],"मस्":[""]}' ) log('ERR', doc);
                var glpkey = [gana, lakara.la, pada].join('-');
                doc.tvar = parseTvar(glpkey, json);
                if (sdoc.tips) doc.tips = sdoc.tips;
                // if (la == 'लोट्') log('parse la DOC:', doc);
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
            // if (sdoc.tips && !inc(sdoc.tips, tip)) return;
            if (sdoc.type == 'strong' && !inc(['तिप्', 'सिप्', 'मिप्'], tip)) return;
            if (sdoc.type == 'weak' && !inc(['तस्', 'झि', 'थस्', 'थ', 'वस्', 'मस्'], tip)) return;
            // log('======== TYPE', sdoc.type);
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

function parsePeriph(forms) {
    // log('=LIT Periph=', forms);
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
    // log('LIT periph stems', stems.length, stems);
    var stem;
    if (stems.length == 1) {
        stem = stems[0];
        // var reA = new RegExp(c.A+ '$');
        // stem = stem.replace(reA, ''); // FIXME: но что, если сам stem заканчивается на A? тогда он не перифрастик?
        // не уверен, отбрасывать ли c.A, неясно, как присоединяется kri-tadd-suff. М.б, c.A остается
        return [{stem: stem, periph: true}];
    } else {
        return [{stem: ''}];
    }
}

function parseStrongWeak(forms) {
    // log('STRONG:', forms);
    var strong, weak;
    var form2;
    var sdoc, wdoc;
    var sforms = {};
    var wforms = {};
    for (var tip in forms) {
        form2 = forms[tip];
        form2.forEach(function(form) {
            if (inc(['तिप्', 'सिप्', 'मिप्'], tip)) {
                if (!sforms[tip]) sforms[tip] = [];
                sforms[tip].push(form);
            } else {
                if (!wforms[tip]) wforms[tip] = [];
                wforms[tip].push(form);
            }
        });
    }
    // log('S', sforms);
    // log('W', wforms);
    strong = parseStem(sforms);
    weak = parseStem(wforms);

    // log('S', strong, 'W', weak);
    if (strong.length < 2 || weak.length < 2) return [{stem: ''}];

    sdoc = {stem: strong, type: 'strong'};
    wdoc = {stem: weak, type: 'weak'};
    var docs = [sdoc, wdoc];
    // log('strong Docs:', docs);
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
        jsons.forEach(function(json, tvar) {
            var otins = JSON.parse(json);
            var oTin, tinData;
            var tinrow;
            // var tcan, periph;
            // var rePeriph = new RegExp('ाञ्चक');
            for (var tip in otins) {
                var tins = otins[tip];
                tins.forEach(function(tin, idz) {
                    tkey = [tip, tin, gana, la, pada, tvar].join('-');
                    if (check[tkey]) return;
                    check[tkey] = true;
                    // periph = (rePeriph.test(tin)) ? 1 : 0;
                    tinrow = [tip, tin, tin.length, gana, la, pada, tvar].join('-');
                    // да и periph в TinsCache нужен только для преобразования stem в dhatu, чего в новом index.js нет
                    tinrow = [tinrow, '\n'].join('');
                    tin_logger.write(tinrow);
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
    var key, row;
    docs.forEach(function(doc) {
        // log('DA', doc);
        // может быть, здесь сделать уникальный stem только? а остальное в строку?
        // XXX
        key = [doc.stem, doc.gana, doc.la, doc.pada, doc.tvar, doc.num].join('-'); // , doc.tips
        row = [doc.dhatu, doc.stem, doc.gana, doc.la, doc.pada, doc.tvar, doc.tips].join('-');
        key = row;
        // log('DA ROW', row);

        if (!check[key]) {
            check[key] = true;
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
                    key = [form, doc.dhatu, doc.gana, doc.la, doc.pada, tip, doc.num].join('-');
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

        // if (vhead.key == 'ईङ्-04.0038') vhead.dhatu = 'ई';
        // else if (vhead.key == 'ञिक्ष्विदा!-04.0159') vhead.dhatu = 'क्ष्विद्';
        // else if (vhead.key == 'षूङ्-04.0027') vhead.dhatu = 'सू';
        // else if (vhead.key == 'झॄष्-04.0026') vhead.dhatu = 'झॄ';
        // // else if (vhead.key == 'डीङ्-04.0030') vhead.dhatu = 'डी';
        // else if (vhead.key == 'ञितृष!-04.0141') vhead.dhatu = 'तृष्';
        // else if (vhead.key == 'णभ!-04.0155') continue;
        // else if (vhead.key == 'णश!-04.0091') continue;
        // else if (vhead.key == 'णह!-04.0062') continue;
        // else if (vhead.key == 'षिवु!-04.0002') continue;
        // else if (vhead.key == 'विस!-04.0123') continue;
        // else if (vhead.key == 'ष्णसु!-04.0006') continue;
        // else if (vhead.key == 'बिस!-04.0124') continue;
        // else if (vhead.key == 'षह!-04.0341') continue;
        // else if (vhead.key == 'षिधु!-04.0089') continue;
        // else if (vhead.key == 'षुह!-04.0024') continue;
        // else if (vhead.key == 'षो-04.0042') continue;
        // else if (vhead.key == 'ष्टिम!-04.0019') continue;
        // else if (vhead.key == 'ष्टीम!-04.0020') continue;
        // else if (vhead.key == 'ष्टुप!-04.0190') continue;
        // else if (vhead.key == 'ष्टूप!-04.0191') continue;
        // else if (vhead.key == 'ष्णिह!-04.0055') continue;
        // else if (vhead.key == 'ष्णुसु!-04.0005') continue;
        // else if (vhead.key == 'ष्णुह!-04.0096') continue;
        // else if (vhead.key == 'ष्विदा!-04.0085') continue;
        // else if (vhead.key == '') continue;
        // else if (vhead.key == '') continue;
        // else if (vhead.key == '') continue;
        // else if (vhead.key == '') continue;
        // else if (vhead.key == '') continue;
        // else if (vhead.key == 'ई!शुचि!र्-04.0061') vhead.dhatu = 'शुच्';
        // else if (vhead.key == '') vhead.dhatu = '';
        // else if (vhead.key == '') vhead.dhatu = '';


        // else if (vhead.dhatu.slice(-2) == 'ङ्') vhead.dhatu = vhead.dhatu.slice(0,-2);

        // // else if (vhead.key == 'ई!शुचि!र्-04.0061') vhead.dhatu = 'शुच्';
        // else if (vhead.dhatu.split('!').length > 2) {
        //     // log('V HEAD __', vhead, vhead.dhatu.split('!'));
        //     vhead.dhatu = vhead.dhatu.split('!')[1];
        //     if (u.isVowel(fin)) {
        //         re = new RegExp(fin + '$');
        //         vhead.dhatu = vhead.dhatu.replace(re, c.virama);
        //     }
        // }
        // else if (/!/.test(vhead.dhatu)) {
        //     // log('===========', vhead);
        //     fin = vhead.dhatu.slice(-1);
        //     if (fin == '!') vhead.dhatu = vhead.dhatu.slice(0,-1);
        //     fin = vhead.dhatu.slice(-1);
        //     if (u.isVowel(fin)) {
        //         re = new RegExp(fin + '$');
        //         vhead.dhatu = vhead.dhatu.replace(re, c.virama);
        //     }
        // }


        // // FIXME: это вынести в модуль, или как-то разобраться
        // if (vhead.key == 'भिदि!र्-07.0002') vhead.dhatu = 'भिद्';
        // else if (vhead.key == 'अञ्जू!-07.0316') vhead.dhatu = 'अञ्ज्';
        // else if (vhead.key == 'ञिइन्धी!-07.0011') vhead.dhatu = 'इन्ध्';
        // else if (vhead.key == 'उन्दी!-07.0020') vhead.dhatu = 'उन्द्';
        // else if (vhead.key == 'कृती!-07.0010') vhead.dhatu = 'कृत्';
        // else if (vhead.key == 'क्षुदि!र्-07.0006') vhead.dhatu = 'क्षुद्';
        // else if (vhead.key == 'छिदि!र्-07.0003') vhead.dhatu = 'छिद्';
        // else if (vhead.key == 'उ!छृदि!र्-07.0352') vhead.dhatu = 'छृद्';
        // else if (vhead.key == 'तञ्चू!-07.0022') vhead.dhatu = 'तञ्च्';
        // else if (vhead.key == 'उ!तृदि!र्-07.0009') vhead.dhatu = 'तृद्';
        // else if (vhead.key == 'पिषॢ!-07.0015') vhead.dhatu = 'पिष्';
        // else if (vhead.key == 'पृची!-07.0339') vhead.dhatu = 'पृच्';
        // else if (vhead.key == 'भञ्जो!-07.0290') vhead.dhatu = 'भञ्ज्';
        // else if (vhead.key == 'युजि!र्-07.0338') vhead.dhatu = 'युज्';
        // else if (vhead.key == 'रिचि!र्-07.0348') vhead.dhatu = 'रिच्';
        // else if (vhead.key == 'रुधि!र्-07.0001') vhead.dhatu = 'रुध्';
        // else if (vhead.key == 'विचि!र्-07.0005') vhead.dhatu = 'विच्';
        // else if (vhead.key == 'ओ!विजी!-07.0023') vhead.dhatu = 'विज्';
        // else if (vhead.key == 'वृजी!-07.0344') vhead.dhatu = 'वृज्';
        // else if (vhead.key == 'शिषॢ!-07.0349') vhead.dhatu = 'शिष्';
        // else if (vhead.key == 'हिसि!-07.0366') continue; // нет дхату ?
        // else if (vhead.key == '') vhead.dhatu = '्';
        // else if (vhead.key == '') vhead.dhatu = '्';
        // else if (vhead.key == '') vhead.dhatu = '्';
        // else if (vhead.key == '') vhead.dhatu = '्';
        // else if (vhead.key == '') vhead.dhatu = '्';
        // else if (vhead.key == '') vhead.dhatu = '्';
        // else if (vhead.key == '') vhead.dhatu = '्';
        // else if (vhead.key == '') vhead.dhatu = '्';
        // else if (vhead.key == '') vhead.dhatu = '्';
