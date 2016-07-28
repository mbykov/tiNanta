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

/*

  я вот чего не понимаю. Если здесь нужно искать в dhatu_anga, то какой смысл в parse-find ?
  в exception-find - я ищу все. В том числе исключения по non-canonical
  а в dhatu_anga лежат более-менее регулярные stems
  если в d_a anga короче d, (или нет к-л характерного признака) то строку нужно отбросить
  в d_a - характерные стемы, по характерным окончаниям

  в d_a - сохранить canonical ? А не tvar ? или и то, и то ?

  1. беру canon - tins. Смотрю canonical d-a. Но без gana
  2. если нет, беру все tins, смотрю все d-a - это exceptions, по всем параметрам, включая tvar
  3. если форма образована по правилам, но dhatu-gana-pada нет в DP, она будет обнаружена
  4. если неизвестная Panini форма - исключение, она не будет обнаружена

  tins: tip, tin, tin.length, gana, la, pada, tvar, tcan, periph, tins (для liw)
  da: dhatu, stem, gana, pada, tvar, tins

  == HERE ==
  записать отдельно tins_cache и canonical_tins_cache ?
  это убыстрит?

*/


var lakaras = ['law', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
// var ctinsPath = path.join(__dirname, './lib/canonical_tins_cache.js');
var tinsPath = path.join(__dirname, './lib/tins_cache.js');
var ctins = fs.readFileSync(tinsPath).toString().split('\n');
// для parse есть два путя. Либо читать canonical, либо все tins, но отбрасывать can=0
// log(ctins);

// var jnuTinsEx = require(jnuTinsPath);
var dhatuAngaPath = path.join(__dirname, './lib/dhatu_anga_cache.txt');
var dhatuAnga = fs.readFileSync(dhatuAngaPath).toString().split('\n');

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



// =========================================== QUERY

// переименовать в find, и в run.js тоже
stemmer.prototype.query = function(query) {
    // log('tiNanta', query);
    // 1. выбираю подходящие tins:
    var fits = [];
    var fit, oFit;
    var obj = {};
    var tip, tin, size, gana, la, pada, tvar, canon, periph ;
    // त-ते-2-01-लट्-आ-0-1
    ctins.forEach(function(ctin) {
        [tip, tin, size, gana, la, pada, tvar, canon, periph] = ctin.split('-');
        fit = (size == 0) ? '' : query.slice(-size);
        if (fit == tin) {
            oFit = {tip: tip, tin: tin, size: size, gana: gana, la: la, pada: pada, tvar: tvar, canon: canon, periph: periph};
            log(1, JSON.stringify(oFit));
            fits.push(oFit);
        }
    });
    return [];

    var results = [];
    var res, stem, das;
    log('DAS', dhatuAnga);
    fits.forEach(function(fit) {
        // log('FIT', fit);
        stem = (fit.size == 0) ? query : query.slice(0, -fit.size);
        log('tip', tip, 2, stem);
        return;
        das = _.select(dhatuAnga, function(da) { return da.stem == stem && da.la == tin.la && da.pada == tin.pada && da.tvar == tin.tvar});
        // if (das.length == 0) noDaErr(stem, fits);
        das.forEach(function(da) {
            res = {dhatu: da.dhatu, stem: stem, tip: tin.tip, tin: tin.tin, la: tin.la, pada: tin.pada };
            results.push(res);
        });
    });

    // log('R', results); // ==>>  बुधिर्_buDir aboDizyAma_XN_parasmE_अबोधिष्याम_ॡङ्_tip_मस्:

    return results;
}

// ====================================

function noDaErr(stem, fits) {
    log('ERR', stem);
    log('ERR', fits);
}


// if (debug && results.length == 0) {
//     log('==========>>>> no DA stem:'); // मोदिता
//     log('fits:', fits);
//     var possible_stems = [];
//     var tmp;
//     fits.forEach(function(tin) {
//         stem = (tin.size == 0) ? query : query.slice(0, -tin.size);
//         tmp = _.select(jnuDhatuAnga, function(da) { return da.stem == stem});
//         possible_stems = possible_stems.concat(tmp);
//     });
//     log('==========>>>> possible stems: ');
//     log(possible_stems);
//     // throw new Error('ERR: ==>> no tins - angas');
// }



function vowCount(str) {
    var syms = str.split('');
    var vows = (u.c(c.allvowels, syms[0])) ? 1 : 0;
    syms.forEach(function(s) {
        if (u.c(c.hal, s)) vows+=1;
        else if (c.virama == s) vows-=1;
    });
    return vows;
}

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
