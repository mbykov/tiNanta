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
var tinsPath = path.join(__dirname, './lib/tins_cache.js');
var ctins = fs.readFileSync(tinsPath).toString().split('\n');
// для parse есть два путя. Либо читать canonical, либо все tins, но отбрасывать can=0
// log(ctins);

// var jnuTinsEx = require(jnuTinsPath);
var jnuDhatuAngaPath = path.join(__dirname, './lib/jnu_dhatu_anga_cache.js');
var jnuDhatuAnga = require(jnuDhatuAngaPath);

var dhatupathaPath = path.join(__dirname, './lib/dhatupatha_cache.txt');
var dhpths = fs.readFileSync(dhatupathaPath).toString().split('\n');
// अ॑हिँ॒-अहि-अंह्-भ्वा-आ-सेट्-01-0722
var dp, adp;
var dps = dhpths.map(function(row) {
    if (!row || row == '') return;
    adp = row.split('-');
    dp = {dhatu: adp[2], pada: adp[4], gana: adp[6], num: adp[7]}; // dp: adp[0], raw: adp[1],
    // if (!dp.raw) log('NN', row, dp);
    return dp;
});
dps = _.compact(dps);


exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

stemmer.prototype.parse = function(query) {
    // 1. выбираю подходящие tins:
    // ТОЛЬКО ДЛЯ gana 1 пока
    // и только для law - поскольку stem-tin нужно поправить для остальных
    this.results = [];
    var fits = [];
    var fit;
    var that = this;
    var tip, tin, size, gana, la, pada, tvar, can, periph;
    var otin = {};

    // var stem;
    ctins.forEach(function(ctin) {
        // log('O', ctin);
        [tip, tin, size, gana, la, pada, tvar, can, periph] = ctin.split('-');
        if (can == 0) return; // либо читать canonical
        otin = {tip: tip, tin: tin, size: size, gana: gana, la: la, pada: pada, tvar: tvar, can: can, periph: periph};
        fit = (size == 0) ? '' : query.slice(-size);
        // if (fit == tin) fits.push(ctin);
        if (fit != tin) return;
        // log('O', otin);
        otin.stem = (size == 0) ? query : query.slice(0, -size);
        if (!dhatuMethods[gana][la]) return; // FIXME: это временно, до заполнения DMs ===================
        dhatuMethods[gana][la].call(that, otin);
    });

    // log('RR', this.results);
    return this.results;
}

// The vowel of the root is replaced with its guna vowel (unless it be a, or a long vowel not final, or a short vowel followed by a double consonant) before every termination of the four tenses, and affix a is added to the root thus gunated.

var dhatuMethods = {'01': {}, '02': {}};

// gana 01 one Bvadi ======================= ::::

function gana_one_guna(tin, query) {
    var syms = tin.stem.split('');
    var beg = syms[0];
    var vow = c.a;
    var weak;
    var wstem;
    var vidx = 0;
    var vows = [];
    syms.forEach(function(sym) {
        if (u.isVowel(sym)) vows.push(sym);
    });
    // log('S', syms, vows);
    if (vows.length > 1) return;
    else if (vows.length == 0) tin.dhatu = addVirama(tin.stem); // vow => c.a
    else {
        vow = vows[0];
        // log('HERE', vow);
        vidx = syms.indexOf(vow);
        if (inc(c.dirgha_ligas, vow)) tin.dhatu = addVirama(tin.stem); // FIXME: но не последняя в корне - это не про первую гану ?
        else if (syms.length - vidx > 3) tin.dhatu = addVirama(tin.stem); // vowel followed by a double consonant // <<====== COMM
        else {
            // log('WEAK');
            if (vow == c.a) tin.dhatu = addVirama(tin.stem);
            else {
                weak = aguna(vow); // FIXME: u.aguna()
                if (!weak) return;
                if (vow == beg) weak = u.vowel(weak); // first - full form //    'एजृ्-एज्',
                // но dhatu -ej- сам содержит гуну <<<==============
                wstem = tin.stem.replace(vow, weak);
                tin.dhatu = addVirama(wstem);
                // if (weak) log('WEAK', query, tin, weak);
            }
        };
    }
    // if (!inc(cdhatus, tin.dhatu)) return;
    var found = _.find(dps, function(d) { return tin.dhatu == d.dhatu && tin.gana == d.gana && tin.pada == d.pada});
    // log('FOUND', found);
    return found;
} // gana_one_guna

dhatuMethods['01']['लट्'] = function(tin, query) {
    if (tin.tin == '') return;
    // log(JSON.stringify(tin));
    var fin = tin.stem.slice(-1);
    if (!u.isConsonant(fin)) return;
    if (gana_one_guna(tin, query)) this.results.push(tin);
}

// laN
dhatuMethods['01']['लङ्'] = function(tin) {
    if (tin.tin == '') return;
    // log(JSON.stringify(tin));
    // var fin = tin.stem.slice(-1);
    var syms = tin.stem.split('');
    var aug = syms.shift();

    if (!inc([c.a, 'आ', 'ऐ', 'औ'], aug)) return; // AI, AU, AR
    var vows = [];
    syms.forEach(function(sym) {
        if (u.isVowel(sym)) vows.push(sym);
    });
    // if (vows.length > 1) log('MORE 1', tin.stem, aug, syms, vows);
    if (vows.length > 1) return;
    // log('S', tin.stem, aug, syms, vows);

    // var csyms = JSON.parse(JSON.stringify(syms)); // आर्घत्-अर्घ्
    // csyms.unshift(aug);
    // var ctin = JSON.parse(JSON.stringify(tin));
    // pushFound.call(this, ctin, csyms, aug);

    // м.б. краткая, долгая, или сам дифтонг - так и не решено, много вариантов.
    // например, Ar -> ar; A->A

    if (aug == 'ऐ') syms.unshift('इ'); // опять, или e- // "औयत","dhatu":"ऊयी्", // "ओ // आञ्छम्-आञ्छ्-
    else if (aug == 'औ') syms.unshift('उ'); // опять, или e- // "औयत","dhatu":"ऊ यी्", // "ऊह् // "उक्ष्"
    else if (aug == 'आ') {
        if (syms.slice(0,2).join('') == 'र्') { // आर्जेताम् -ऋज्
            syms = syms.slice(2);
            syms.unshift('ऋ');
        } else {
            syms.unshift('अ');
        }
    }
    pushFound.call(this, tin, syms, aug);
}

function pushFound(tin, syms, aug) {
    tin.stem = syms.join('');
    if (aug) tin.aug = aug;
    tin.dhatu = addVirama(tin.stem); // FIXME: TODO: а fin на гласную как ?
    // tin.dhatu = tin.stem;
    var found = _.find(dps, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;
    this.results.push(tin);
}

// low
dhatuMethods['01']['लोट्'] = function(tin, query) {
    if (tin.tin == '' && tin.tip != 'तात्') return;
    // log(JSON.stringify(tin));
    var fin = tin.stem.slice(-1);
    if (!u.isConsonant(fin)) return;
    if (gana_one_guna(tin, query)) this.results.push(tin);
}

// v-liN
dhatuMethods['01']['विधिलिङ्'] = function(tin, query) {
    var fin = tin.stem.slice(-1);
    if (fin == c.e) tin.stem = tin.stem.slice(0, -1);
    // log('HERE', tin)

    // var found = gana_one_guna(tin, query);
    if (gana_one_guna(tin, query)) this.results.push(tin);
}

// liw - perfect
/*

  я вот чего не понимаю. Если здесь нужно искать в dhatu_anga, то какой смысл в parse-find ?
  в exception-find - лежат все. В том числе исключения по non-canonical
  а в dhatu_anga лежат более-менее регулярные stems
  если в d_a anga короче d, (или нет к-л характерного признака) то строку нужно отбросить
  в d_a - характерные стемы, по характерным окончаниям

  в d_a - сохранить canonical ? А не tvar ? или и то, и то ?

  1. беру canon - tins. Смотрю canonical d-a. Но без gana
  2. если нет, беру все tins, смотрю все d-a - это exceptions, по всем параметрам, включая tvar
  3. если форма образована по правилам, но dhatu-gana нет в DP, она будет обнаружена
  4. если неизвестная Panini форма - исключение, она не будет обнаружена


  == HERE ==
  записать отдельно tins_cache и canonical_tins_cache ?
  это убыстрит?

*/

dhatuMethods['01']['लिट्'] = function(tin, query) {
    /*
      - грязно
      - гласная в конце корня
      - из-за "" - как быть?
      -
    */
    // if (tin.tin == '' && tin.pada == 'प' &! (tin.tip == 'तात्' || tin.tip == 'थ')) return; // дает ошибку в тесте - अक्-लिट्-प-तिप् [ 'अक्-लिट्-प-थ' ]
    // хотя это верное ограничение
    if (tin.tin == '' && tin.pada == 'प' && tin.tip != 'तात्') return;
    if (tin.tin == '' && tin.pada == 'आ') return;
    // log(JSON.stringify(tin));
    var dhatu, hrasva;
    var beg = tin.stem[0];
    // log('VOW', tin.stem, vowCount(tin.stem));
    var vc = vowCount(tin.stem);
    var rePeriph = new RegExp('ाञ्चक्');
    if (tin.periph == '1') {
        // log('PERIPH');
        // log(tin);
        tin.dhatu = addVirama(tin.stem);

    } else if (vc == 2 && u.isDirgha(beg)) {
        // log(JSON.stringify(tin));
        // log('STEM', tin.stem, 'pada:', tin.pada);
        // log(1, u.hrasva(beg));
        hrasva = u.hrasva(beg);
        dhatu = tin.stem.replace(beg, hrasva);
        tin.dhatu = addVirama(dhatu);
    } else if (vc == 3) {
        var stem = addVirama(tin.stem);
        if (u.isVowel(stem[1])) dhatu = stem.slice(2);
        else dhatu = stem.slice(1);
        // log('DH', dhatu);
        tin.dhatu = dhatu;
    } else return;

    // log(JSON.stringify(tin));
    // log('D', dhatu, 'pada:', tin.pada); // ध्राघ्  = ध्राघृ-घ्राघ्-
    var found = _.find(dps, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;
    this.results.push(tin);
}


// luw
dhatuMethods['01']['लुट्'] = function(tin, query) {
    // log(JSON.stringify(tin));
    var dhatu = u.replaceEnd(tin.stem, 'ि', '');
    tin.dhatu = addVirama(dhatu);
    // log('D', tin.dhatu, 'pada:', tin.pada);
    var found = _.find(dps, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;
    this.results.push(tin);
}


// lfw
dhatuMethods['01']['लृट्'] = function(tin, query) {
    // Qlog(JSON.stringify(tin));
    var dhatu = u.replaceEnd(tin.stem, 'ि', '');
    tin.dhatu = addVirama(dhatu);
    // log('D', tin.dhatu, 'pada:', tin.pada);
    var found = _.find(dps, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;
    this.results.push(tin);
}

// = ASIrliN
dhatuMethods['01']['आशीर्लिङ्'] = function(tin, query) {
    // log(JSON.stringify(tin));
    var dhatu;
    if (tin.pada == 'प') {
        dhatu = u.replaceEnd(tin.stem, 'या', '');
    } else {
        dhatu = u.replaceEnd(tin.stem, 'िषी', c.virama);

    }
    // var fin = dhatu.slice(-1);
    // tin.dhatu = addVirama(dhatu);
    tin.dhatu = dhatu;
    // log('D', tin.dhatu, 'pada:', tin.pada);
    var found = _.find(dps, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;
    this.results.push(tin);
}


// = lfN = benedictive mood
dhatuMethods['01']['लृङ्'] = function(tin, query) {
    // log(JSON.stringify(tin)); // आंहिष्यत - आकिष्य
    var dhatu;
    if (tin.pada == 'प') {
        dhatu = u.replaceEnd(tin.stem, 'िष्य', c.virama);
    } else {
        dhatu = u.replaceEnd(tin.stem, 'िष्य', c.virama);
    }
    var beg = tin.stem[0];
    if (beg == c.a) dhatu = dhatu.slice(1);
    else if (beg == 'आ') {
        dhatu = dhatu.slice(1);
        dhatu = ['अ', dhatu].join('');
    }
    /*
      FIXME: здесь кроме того гласная-не-начальная - краткая слабая
    */

    // var fin = dhatu.slice(-1);
    // tin.dhatu = addVirama(dhatu);
    tin.dhatu = dhatu;
    // log('D', tin.dhatu, 'pada:', tin.pada, 'S', tin.stem);

    var found = _.find(dps, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;
    this.results.push(tin);
}

// = luN =
dhatuMethods['01']['लुङ्'] = function(tin, query) {
    // log(JSON.stringify(tin)); // आंहिष्यत - आकिष्य
    var dhatu = u.replaceEnd(tin.stem, 'ि', '');
    if (tin.pada == 'प') {
        // dhatu = u.replaceEnd(tin.stem, 'िष्य', c.virama);
    } else {
        // dhatu = u.replaceEnd(tin.stem, 'िष्य', c.virama);
    }
    var beg = tin.stem[0];
    if (beg == c.a) dhatu = dhatu.slice(1);
    else if (beg == 'आ') {
        dhatu = dhatu.slice(1);
        dhatu = ['अ', dhatu].join('');
    }
    /*
      FIXME: слабая гласная
     */


    // var fin = dhatu.slice(-1);
    tin.dhatu = addVirama(dhatu);
    // log('D', tin.dhatu, 'pada:', tin.pada, 'S', tin.stem);

    var found = _.find(dps, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    // log(111, tin, found);
    if (!found) return;
    this.results.push(tin);
}



// ======================== SECOND GANA ===========================
// adAdi !!!
dhatuMethods['02']['लट्_'] = function(tin, query) {
    if (tin.tin == '') return;
    // log(JSON.stringify(tin));
    var dhatu;
    var fin = tin.stem.slice(-1);
    var syms = tin.stem.split('');
    // log('SSyms:', syms);
    if (u.isConsonant(fin) && u.isVowel(tin.tin[0])) {
        syms.push(c.virama); // FIXME: это пока примерка
        tin.stem = syms.join('');
    }
    // log('SSyms:', syms);
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
    // FIXME: can_non_be_gunated
    // FIXME: или weakStem ?
    // несколько вариантов FIXME:
    var found;
    if (vows.length > 1) return;
    else if (tin.pada == 'आ.प') tin.dhatu = tin.stem;
    else if (vows.length == 0) tin.dhatu = tin.stem; // c.a
    else {
        vow = vows[0];
        vidx = syms.indexOf(vow);
        // log('HERE', vow);
        if (inc(c.dirgha_ligas, vow)) tin.dhatu = tin.stem; // FIXME: но не последняя в корне
        else if (syms.length - vidx > 3) tin.dhatu = tin.stem; // vowel followed by a double consonant // <<====== COMM
        else {
            // log('HERE');
            var ctin = JSON.parse(JSON.stringify(tin));
            ctin.dhatu = ctin.stem;
            found = _.find(cdhatus, function(d) { return ctin.dhatu == d.dhatu && ctin.pada == d.pada});
            if (found) this.results.push(ctin);
            weak = aguna(vow); // FIXME: u.aguna()
            if (!weak) return;
            if (vow == beg) weak = u.vowel(weak); // first - full form //    'एजृ्-एज्',
            // но dhatu -ej- сам содержит гуну <<<==============, нужны несколько ответов
            wstem = tin.stem.replace(vow, weak);
            tin.dhatu = wstem;
            // if (weak) log('WEAK', query, tin, weak);
        };
    }
    found = _.find(cdhatus, function(d) { return tin.dhatu == d.dhatu && tin.pada == d.pada});
    if (found) this.results.push(tin);
    // FIXME:
    this.results.push(tin);
}



// это в sandhi.utils, сделать симлинк <<<<<<<<<<< ===========================================


function addVirama(str) {
    return [str, c.virama].join('');
}

// FIXME: FIXME: это в sandhi.utils, сделать симлинк <<<<<<<<<<< ===========================================
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

// FIXME: тут u.isViga
function isLiga(sym) {
    return inc(c.allligas, sym);
}



// =========================================== QUERY

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
    var obj = {};
    var tip, tin, size, gana, la, pada, tvar, tcan;
    // त-ते-2-01-लट्-आ-0-1
    ctins.forEach(function(ctin) {
        [tip, tin, size, gana, la, pada, tvar, tcan] = ctin.split('-');
        fit = (size == 0) ? '' : query.slice(-size);
        if (fit == tin) fits.push(ctin);
    });
    // здесь я прервал переход на строку ctin - пока parse

    // поиск готового dhatu:
    var results = [];
    var res, stem, das;
    fits.forEach(function(tin) {
        stem = (tin.size == 0) ? query : query.slice(0, -tin.size);
        // каждому stem соответствует строго один dhatu?
        das = _.select(jnuDhatuAnga, function(da) { return da.tvar == tin.tvar && da.stem == stem && da.la == tin.la && da.pada == tin.pada});
        if (!das) return; // FIXME: select!
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

function vowCount(str) {
    var syms = str.split('');
    var vows = (u.c(c.allvowels, syms[0])) ? 1 : 0;
    syms.forEach(function(s) {
        if (u.c(c.hal, s)) vows+=1;
        else if (c.virama == s) vows-=1;
    });
    return vows;
}
