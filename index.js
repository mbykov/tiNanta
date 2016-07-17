/*
 * stemmer.js - forms queries for Morpheus v.0.4.0
 */

// var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;
// var tins = require('./lib/tins/laN');


var lakaras = ['law', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
// var ctinsPath = path.join(__dirname, './lib/canonical_tins_cache.js');
var jnuTinsPath = path.join(__dirname, './lib/jnu_tins_cache.js');
var ctins = require(jnuTinsPath);
var jnuTinsEx = require(jnuTinsPath);
var jnuDhatuAngaPath = path.join(__dirname, './lib/jnu_dhatu_anga_cache.js');
var jnuDhatuAnga = require(jnuDhatuAngaPath);

var dhatuListPath = path.join(__dirname, './lib/dhatu_list_cache.txt');
var dlist = fs.readFileSync(dhatuListPath).toString().split('\n');
// 48-भ्वादि-ह्लादीँ॒-ह्लाद्-अव्यक्ते_शब्दे-सेट्-आ.प
var cdhatus = dlist.map(function(str) {
    var d = str.split('-');
    return {gana: d[1], dhatu: d[3], pada: d[6]};
});


exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

// samasa to queries array
stemmer.prototype.query = function(query) {
    this.queries = [];
    // если проходит грубый фильтр, то tiNanta ? Или нет смысла?
    var res = this.tiNanta(query);
    return res;
    // return this.queries;
}

// переименовать в find, и в run.js тоже
stemmer.prototype.tiNanta = function(query) {
    // log('tiNanta', query);
    // 1. выбираю подходящие tins:
    var fits = [];
    var fit;
    ctins.forEach(function(ctin) {
        fit = (ctin.size == 0) ? '' : query.slice(-ctin.size);
        if (fit == ctin.tin) fits.push(ctin);
    });

    // поск готового dhatu:
    var results = [];
    var res, stem, das;
    fits.forEach(function(tin) {
        stem = (tin.size == 0) ? query : query.slice(0, -tin.size);
        // каждому stem соответствует строго один dhatu?
        das = _.select(jnuDhatuAnga, function(da) { return da.tvar == tin.tvar && da.stem == stem && da.la == tin.la && da.pada == tin.pada});
        if (!das) return;
        das.forEach(function(da) {
            res = {dhatu: da.dhatu, stem: stem, tin: tin.tin, la: tin.la, pada: tin.pada, tip: tin.tip };
            results.push(res);
        });
    });
    if (debug && results.length == 0) {
        log('==========>>>> no DA stem:'); // मोदिता
        log('fits:', fits);
        var possible_stems = [];
        var tmp;
        fits.forEach(function(tin) {
            stem = (tin.size == 0) ? query : query.slice(0, -tin.size);
            tmp = _.select(jnuDhatuAnga, function(da) { return da.stem == stem});
            possible_stems = possible_stems.concat(tmp);
        });
        log('==========>>>> possible stems: ');
        log(possible_stems);
        // throw new Error('ERR: ==>> no tins - angas');
    }
    // log('R', results); // ==>>  बुधिर्_buDir aboDizyAma_XN_parasmE_अबोधिष्याम_ॡङ्_tip_मस्:

    // если dhatu нет, parse
    // results = [];
    // if (results.length == 0) {
    //     // log('parsing...');
    //     results = this.parse(query);
    // }
    return results;
    // this.queries.push('QQQ');
    // return this.queries;
}

stemmer.prototype.parse = function(query) {
    // 1. выбираю подходящие tins:
    // ТОЛЬКО ДЛЯ gana 1 пока
    // и только для law - поскольку stem-tin нужно поправить для остальных
    this.results = [];
    var fits = [];
    var fit;
    ctins.forEach(function(ctin) {
        // if (ctin.la != 'लङ्') return;
        if (!ctin.canon) return;
        // if (ctin.canon) log('CAN:', ctin);
        fit = (ctin.size == 0) ? '' : query.slice(-ctin.size);
        if (fit == ctin.tin) fits.push(ctin);
    });

    // stems:
    fits.forEach(function(tin) {tin.stem = (tin.size == 0) ? query : query.slice(0, -tin.size) });
    // log('parse - stems FITS:', fits);

    // конструирую простейший dhatu:
    // все циклы в parse можно убрать в один
    var that = this;
    fits.forEach(function(tin) {
        if (!dhatuMethods[tin.la]) return;
        dhatuMethods[tin.la].call(that, tin, query);
    });

    // log('RR', this.results);
    return this.results;
}

// The vowel of the root is replaced with its guna vowel (unless it be a, or a long vowel not final, or a short vowel followed by a double consonant) before every termination of the four tenses, and affix a is added to the root thus gunated.
// [ { dhatu: 'वप्', stem: 'वप', tin: 'ति', la: 'लट्', tip: 'तिप्' } ]

var dhatuMethods = {};

dhatuMethods['लट्'] = function(tin, query) {
    if (tin.tin == '') return;
    var dhatu;
    var fin = tin.stem.slice(-1);
    if (!u.isConsonant(fin)) return;
    var syms = tin.stem.split('');
    var beg = syms[0];
    var vow = c.a;
    var weak;
    var wstem;
    var vidx = 0;
    var vows = [];
    // log('S', syms);
    syms.forEach(function(sym) {
        if (u.isVowel(sym)) vows.push(sym);
    });
    if (vows.length > 1) return; // FIXME: всегда только одна гласная ?????????????????? <<<===================
    else if (vows.length == 0) tin.dhatu = addVirama(tin.stem); // vow => c.a
    // else if (vows.length == 0) return; // <<====== COMM // vow => c.a
    else {
        vow = vows[0];
        vidx = syms.indexOf(vow);
        if (inc(c.dirgha_ligas, vow)) tin.dhatu = addVirama(tin.stem); // FIXME: но не последняя в корне - это не про первую гану ?
        else if (syms.length - vidx > 3) tin.dhatu = addVirama(tin.stem); // vowel followed by a double consonant // <<====== COMM
        else {
            weak = aguna(vow); // FIXME: u.aguna()
            if (!weak) return;
            if (vow == beg) weak = u.vowel(weak); // first - full form //    'एजृ्-एज्',
            // но dhatu -ej- сам содержит гуну <<<==============
            wstem = tin.stem.replace(vow, weak);
            tin.dhatu = addVirama(wstem);
            // if (weak) log('WEAK', query, tin, weak);
        };
    }

    // if (!inc(cdhatus, tin.dhatu)) return;
    var found = _.find(cdhatus, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;

    this.results.push(tin);
}

// laN
dhatuMethods['लङ्'] = function(tin, query) {
    // log(JSON.stringify(tin));
    if (tin.tin == '') return;
    var fin = tin.stem.slice(-1);
    var syms = tin.stem.split('');
    var aug = syms.shift();
    if (!inc([c.a, 'ऐ', 'औ'], aug)) return; // AI, AU, AR
    // <<<<<<<<<< ==================== AR осталось
    // м.б. краткая, долгая, или сам дифтонг
    if (aug == 'ऐ') syms.unshift('इ'); // опять, или e- // "औयत","dhatu":"ऊयी्", // "ओ
    else if (aug == 'औ') syms.unshift('उ'); // опять, или e- // "औयत","dhatu":"ऊ यी्", // "ऊह् // "उक्ष्"
    var vows = [];
    // log('S', tin.stem, aug, syms);
    syms.forEach(function(sym) {
        if (u.isVowel(sym)) vows.push(sym);
    });
    if (vows.length > 1) return;
    tin.aug = aug;
    tin.stem = syms.join('');
    tin.dhatu = addVirama(tin.stem);
    var found = _.find(cdhatus, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;
    this.results.push(tin);
}

// low
// खाद् (भक्षणे, भ्वादिगण, परस्मै, लोट्) \n खादतु खादताम् खादन्तु \n खाद खादतम् खादत \n खादानि खादाव खादाम
// स्पर्ध् (सङ्घर्षे, भ्वादिगण, आत्मने, लोट्) \n स्पर्धताम् स्पर्धेताम् स्पर्धन्ताम् \n स्पर्धस्व स्पर्धेथाम् स्पर्धध्वम् \n स्पर्धै स्पर्धावहै स्पर्धामहै
dhatuMethods['लोट्'] = function(tin, query) {
    // log(JSON.stringify(tin));
    // FIXME: точно то же что в law,  вынести в метод
    var dhatu;
    var fin = tin.stem.slice(-1);
    if (!u.isConsonant(fin)) return;
    var syms = tin.stem.split('');
    var beg = syms[0];
    var vow = c.a;
    var weak;
    var wstem;
    var vidx = 0;
    var vows = [];
    // log('S', syms);
    syms.forEach(function(sym) {
        if (u.isVowel(sym)) vows.push(sym);
    });
    if (vows.length > 1) return; // FIXME: всегда только одна гласная ?????????????????? <<<===================
    else if (vows.length == 0) tin.dhatu = addVirama(tin.stem); // vow => c.a
    // else if (vows.length == 0) return; // <<====== COMM // vow => c.a
    else {
        vow = vows[0];
        vidx = syms.indexOf(vow);
        if (inc(c.dirgha_ligas, vow)) tin.dhatu = addVirama(tin.stem); // FIXME: но не последняя в корне - это не про первую гану ?
        else if (syms.length - vidx > 3) tin.dhatu = addVirama(tin.stem); // vowel followed by a double consonant // <<====== COMM
        else {
            weak = aguna(vow); // FIXME: u.aguna()
            if (!weak) return;
            if (vow == beg) weak = u.vowel(weak); // first - full form //    'एजृ्-एज्',
            // но dhatu -ej- сам содержит гуну <<<==============
            wstem = tin.stem.replace(vow, weak);
            tin.dhatu = addVirama(wstem);
            // if (weak) log('WEAK', query, tin, weak);
        };
    }

    // if (!inc(cdhatus, tin.dhatu)) return;
    var found = _.find(cdhatus, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;

    this.results.push(tin);
}

dhatuMethods['विधिलिङ्'] = function(tin, query) {
    // var found = gana_one(tin, query);
    if (gana_one(tin, query)) this.results.push(tin);
}

function gana_one(tin, query) {
    log(JSON.stringify(tin));
    var dhatu;
    var fin = tin.stem.slice(-1);
    if (!u.isConsonant(fin)) return;
    var syms = tin.stem.split('');
    var beg = syms[0];
    var vow = c.a;
    var weak;
    var wstem;
    var vidx = 0;
    var vows = [];
    // log('S', syms);
    syms.forEach(function(sym) {
        if (u.isVowel(sym)) vows.push(sym);
    });
    if (vows.length > 1) return; // FIXME: всегда только одна гласная ?????????????????? <<<===================
    else if (vows.length == 0) tin.dhatu = addVirama(tin.stem); // vow => c.a
    // else if (vows.length == 0) return; // <<====== COMM // vow => c.a
    else {
        vow = vows[0];
        vidx = syms.indexOf(vow);
        if (inc(c.dirgha_ligas, vow)) tin.dhatu = addVirama(tin.stem); // FIXME: но не последняя в корне - это не про первую гану ?
        else if (syms.length - vidx > 3) tin.dhatu = addVirama(tin.stem); // vowel followed by a double consonant // <<====== COMM
        else {
            weak = aguna(vow); // FIXME: u.aguna()
            if (!weak) return;
            if (vow == beg) weak = u.vowel(weak); // first - full form //    'एजृ्-एज्',
            // но dhatu -ej- сам содержит гуну <<<==============
            wstem = tin.stem.replace(vow, weak);
            tin.dhatu = addVirama(wstem);
            // if (weak) log('WEAK', query, tin, weak);
        };
    }

    // if (!inc(cdhatus, tin.dhatu)) return;
    var found = _.find(cdhatus, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    // if (!found) return;
    return found;
}



// это в sandhi.utils, сделать симлинк <<<<<<<<<<< ===========================================


function addVirama(str) {
    return [str, c.virama].join('');
}

// это в sandhi.utils, сделать симлинк <<<<<<<<<<< ===========================================


// semivow, vow, liga, dirgha, dl, guna, gl, vriddhi, vl
var Const = {};
Const.vowtable = [
    '-अ-आा',
    'यइिईीएेऐै',
    'वउुऊूओोऔौ',
    'रऋृॠॄ',
    'लऌॢ--', // dirgha-F? dliga?
];

function aguna(sym) {
    var row = vowrow(sym);
    var idx = row.indexOf(sym);
    if (idx == 5) return row[2];
}

function vowrow(sym) {
    return _.find(Const.vowtable, function(row) {
        return (row.indexOf(sym) > -1);
    }) || '';
}
