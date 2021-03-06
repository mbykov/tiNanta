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

var push = process.argv.slice(2)[0];

var dbpath = 'http://admin:kjre4317@localhost:5984';
// var dbpath = 'http://localhost:5984';
var Relax = require('relax-component');
var relax = new Relax(dbpath);
relax.dbname('sa-tins');

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

// var canonicalTinsPath = path.join(__dirname, '../lib/canonical_tins.js');
// var canonicals = require(canonicalTinsPath);

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
// gana_to_test = '05';
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
        // if (dhatu != 'अक') return; // ================ DHATU ====================
        // if (form != 'आकिष्टाम्') return;
        // UUU आकिष्टाम्,अक!,लुङ्,तस्,01.0901

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
        var vnest = nests[vkey];
        var ndhatus = vnest.map(function(n) { return n.dhatu; });
        ndhatus = _.uniq(ndhatus);

        // if (vhead.key == 'अक-01.0901') log('V HEAD', vhead, vnest);

        if (ndhatus.length > 1) {
            log(vhead, ndhatus, nest.length);
            log(vnest.slice(-2));
            throw new Error();
        }
        // var fin, re;
        // ws-wo-dhatu-gana-pada-set-num
        // { dhatu: 'हिवि!', gana: '01', num: '0675', key: 'हिवि!-01.0675' }
        dicts = _.select(dps, function(dp) { return dp.gana == vhead.gana && dp.num == vhead.num && (dp.ws == vhead.dhatu || dp.wo == vhead.dhatu || dp.dhatu == vhead.dhatu); });
        if (dicts.length == 0) {
            log('DICT ERR:', vhead);
            // throw new Error();
        }
        // log('DICTS', dicts);
        // return;
        // let my = _.select(vnest, function(n) { return n.form == 'आकिष्टाम्'});
        // if (my.length > 0) log('MY:', my);
        // if (vnest.form == 'आकिष्टाम्') log('HERE IT IS', vnest);

        // dicts.forEach(function(dict) {
        laDocs = parseNest(vnest, vhead.gana);

        // let my2 = _.select(laDocs, function(d) { return d.stem == 'आकिष्टाम्'; });
        // if (my2.length > 0) p('MY laDocs 2', laDocs);
        // p('laDocs', laDocs);
        // return;

        laDocs.forEach(function(ladoc) {
            dicts.forEach(function(dict) {
                // log('============', ladoc.la, vhead.num, dict.num);
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
                // if (doc.stem == 'आकिष्टाम्') p('NEST Doc', doc);
                docs.push(doc);
                });
        });
        // });
    }

    log('_doc_:', docs.length);
    // log(docs);
    // log('nest:', nests['अहि!-01.0722'][0]);

    // writeDhatuAnga(docs);
    // writeTinCache(endings);

    log('_______pushing tins, das, tests... _______');
    writeTestsCache(docs);
    pushTinCache(endings);
    pushDhatuAnga(docs);
}

function parseNest(nest, gana) {
    // log('D', JSON.stringify(nest));
    // var check = {};
    let lakaras = [];
    let la;
    let lanest;
    let laForms;
    let re;
    _.keys(laks).forEach(function(la) {
        if (la_to_test && la != la_to_test) return; // ================= LA TO TEST ============ <<<
        lanest = _.select(nest, function(line) { return line.la == la; });
        // if (la == 'लुङ्' && lanest[0].form == 'आकिष्टाम्') log('LANEST', lanest);
        lakaras.push({la: la, nest: lanest});
    });

    // если conj, то P - parseStrongWeak ?
    // если нет, то всегда parseStem
    // [{la, pada, conj, nest}, ...]
    // а здесь цикл - если conj, то parseSW, нет - parseStem
    //
    var docs = [];
    // var doc, sdocs, json;
    lakaras.forEach(function(lakara) {
        if (la_to_test && lakara.la != la_to_test) return; // ================= LA TO TEST ============ <<<
        // log('FF==================', lakara.la, lakara.nest); // lakara.nest

        // let myLA = _.select(lakara.nest, function(d) { return d.form == 'आकिष्टाम्'; });
        // if (myLA.length > 0) p('MY myLA', myLA);

        laForms = parseLakara(lakara.nest);
        // log('laF', lakara.la, laForms); // lakara.nest
        // { 'प': { 'तस्': [ 'आकिष्टाम्' ] } }
        // if (lakara.la == 'लुङ्' && laForms['प']['तस्'] == 'आकिष्टाम्') log('HERE');
        //
        // let myLAFORMS = _.select(lakara.nest, function(d) { return d.form == 'आकिष्टाम्'; });
        // if (myLAFORMS.length > 0) p('myLAFORMS', myLAFORMS);

        var la = lakara.la;
        for (var pada in laForms) {
            let forms = laForms[pada];
            let sdocs;
            if (/ञ्चक/.test(forms['तिप्']) || /ञ्चक/.test(forms['त']) ) sdocs = parsePeriph(forms);
            else if (pada == 'प' && inc(conjugs, la)) sdocs = parseStrongWeak(forms);
            else {
                // log('ELSE FORMS', lakara.la, pada, forms, gana);
                // ELSE FORMS लुङ् प { 'तस्': [ 'आकिष्टाम्' ] }
                // if (gana == '01', lakara.la == 'लुङ्', pada == 'प', forms['तस्'] == 'आकिष्टाम्') log('====================== BEFORE STEM', forms);
                let stem = parseStem(forms);
                // if (!stem) continue;
                // if (gana == '01', lakara.la == 'लुङ्', pada == 'प', forms['तस्'] == 'आकिष्टाम्') log('====================== BEFORE STEM =>', stem);

                // if (stem == 'आकिष्टाम्') log('STEM==========>', stem);
                sdocs = [{stem: stem}];
            }
            let json = parseJSON(sdocs, forms);
            sdocs.forEach(function(sdoc) {
                let doc = {stem: sdoc.stem, gana: gana, la: la, pada: pada, nest: forms};
                // if (json == '{"तिप्":[""],"तस्":[""],"झि":[""],"सिप्":[""],"थस्":[""],"थ":[""],"मिप्":[""],"वस्":[""],"मस्":[""]}' ) log('ERR', doc);
                var glpkey = [gana, lakara.la, pada].join('-');
                doc.tvar = parseTvar(glpkey, json);
                if (sdoc.tips) doc.tips = sdoc.tips;
                // if (la == 'लोट्') log('parse la DOC:', doc);
                if (doc.stem == 'आकिष्टाम्') p('=====>> NEST Doc', doc);
                docs.push(doc);
            });
        }

    });
    // log('==>>', docs); // laDocs;
    return docs;
}


function parseLakara(nest) {
    // log('la nest size:', nest.length);
    let forms = {};
    // var docs = [];
    nest.forEach(function(line) {
        // if (line.form == 'आकिष्टाम्') log('LINE', line);
        // if (line.form == 'आकिष्टाम्') log('INPAR', inc(pars, line.tip));
        if (inc(pars, line.tip)) {
            if (!forms['प']) forms['प'] = {};
            if (!forms['प'][line.tip]) forms['प'][line.tip] = [];
            forms['प'][line.tip].push(line.form);
        } else if (inc(atms, line.tip)) {
            if (!forms['आ']) forms['आ'] = {};
            if (!forms['आ'][line.tip]) forms['आ'][line.tip] = [];
            forms['आ'][line.tip].push(line.form);
        }
        // if (line.form == 'आकिष्टाम्') log('=FORMS=', forms);
        // if (line.form == 'आकिष्टाम्') log('=FORMS PA=', forms['प']);
        // if (line.form == 'आकिष्टाम्') log('=FORMS PA TAS=', forms['प']['तस्']);
    });
    // log('FORMS', forms);
    // FORMS { 'प': { 'तस्': [ 'आकिष्टाम्' ] } }
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

// ENDINGS ==========================
// p(endings);


function pushTinCache(endings) {
    var docs = [];
    // var doc;
    // var check = {};
    var tkey;
    for (var glpkey in endings) {
        // if (glpkey != '03-लिट्-आ') continue;
        var gana, la, pada;
        [gana, la, pada] = glpkey.split('-');
        // if (la_to_test && la != la_to_test) continue; // ========================== LAKARA
        var jsons = endings[glpkey].arr;
        jsons.forEach(function(json, tvar) {
            let otips = JSON.parse(json);
            // var oTin, tinData;
            // var tinrow;
            // var tcan, periph;
            // var rePeriph = new RegExp('ाञ्चक');
            // XXX

            // log(otips);
            let idy = 0;
            let odocs = {};
            for (var tip in otips) { // 'आताम्': [ 'ाते' ]; tip: [tins]
                var tins = otips[tip];
                tins.forEach(function(tin, idz) {
                    let tinkey = [idy, tip, tin, idz, tvar, gana, la, pada].join('-');
                    if (!odocs[tinkey]) odocs[tinkey] = {tin: tin, gana: gana, la: la, pada: pada, tvar: tvar, tips: [], key: tinkey};
                    odocs[tinkey].tips.push(tip);

                    // if (tin == '' && gana == '01' && la == 'लुङ्' && pada == 'प' && tvar == 0 && tip == 'तस्') {
                    //     log('HERE WE ARE');
                    // }

                    // tkey = [tip, tin, gana, la, pada, tvar].join('-');
                    // if (check[tkey]) return;
                    // check[tkey] = true;

                    // periph = (rePeriph.test(tin)) ? 1 : 0;
                    // tinrow = [tip, tin, tin.length, gana, la, pada, tvar].join('-');
                    // let doc = {tip: tip, tin: tin, size: tin.length, gana: gana, la: la, pada: pada, tvar: tvar};
                    // docs.push(doc);
                });
                idy += 1;
            }
            // log('====>', odocs);
            let tinkey;
            for (tinkey in odocs) {
                let odoc = odocs[tinkey];
                let doc = {tin: odoc.tin, size: odoc.tin.length, gana: odoc.gana, la: odoc.la, pada: odoc.pada, tvar: odoc.tvar, tips: odoc.tips};
                // log(doc);
                docs.push(doc);
            }
        });
    }
    // log('DOCS', docs);
    log('DOCS', docs.length);
    if (push) {
        // relax.dbname('sa-tin');
        pushDocs(docs);
        log('tins pushed', docs.length);
    } else {
        p('tins to be pushed:', docs.length);
        p('first two:', docs.slice(0, 2));
        log('=== to push add true ===');
    }
}

function pushDhatuAnga(docs) {
    var check = {};
    var key, da;
    var das = [];
    docs.forEach(function(doc) {
        key = [doc.stem, doc.gana, doc.la, doc.pada, doc.tvar, doc.num, doc.tips].join('-'); // , doc.tips
        // row = [doc.dhatu, doc.stem, doc.gana, doc.la, doc.pada, doc.tvar, doc.tips].join('-');
        // key = row;
        // log('DA ROW', row);
        da = {dhatu: doc.dhatu, stem: doc.stem, gana: doc.gana, la: doc.la, pada: doc.pada, tvar: doc.tvar};
        if (doc.tips) da.tips = doc.tips;

        if (!check[key]) {
            das.push(da);
            check[key] = true;
        }
    });
    // log('DOCS', docs);
    // log('DAS', das.length);
    if (push) {
        // relax.dbname('sa-das');
        pushDocs(das);
        log('das pushed', das.length);
    } else {
        p('das to be pushed. . .', docs.length);
        p('sample:', das.slice(0, 1));
        log('=== to push to sa-das add true ===');
    }
}

function pushDocs(docs) {
    relax
        .bulk(docs)
        .end(function(err, res) {
            // log(res.text);
            log('ok', docs.length);
        });
}


// ============ OLD but tests =========


function writeTinCache(endings) {
    fs.unlinkSync(tinsCachePath);
    var tin_logger = fs.createWriteStream(tinsCachePath, {
        flags: 'a', // 'a' means appending (old data will be preserved)
        defaultEncoding: 'utf8'
    });
    tin_logger.write('tip, tin, size, gana, la, pada, tvar \n');

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
        //
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
