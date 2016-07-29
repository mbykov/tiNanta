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

  tins: tip, tin, tin.length, gana, la, pada, tvar, tcan, p_eriph, tins (для liw)
  da: dhatu, stem, gana, pada, tvar, tins

  == HERE ==
  записать отдельно tins_cache и canonical_tins_cache ?
  это убыстрит?

*/


// var lakaras = ['law', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
// var ctinsPath = path.join(__dirname, './lib/canonical_tins_cache.js');

// var tinsPath = path.join(__dirname, './lib/tins_cache.js');
// var ctins = fs.readFileSync(tinsPath).toString().split('\n');

// // var jnuTinsEx = require(jnuTinsPath);
// var dhatuAngaPath = path.join(__dirname, './lib/dhatu_anga_cache.txt');
// var das = fs.readFileSync(dhatuAngaPath).toString().split('\n');

// var dhatupathaPath = path.join(__dirname, './lib/dhatupatha_cache.txt');
// var dhpths = fs.readFileSync(dhatupathaPath).toString().split('\n');

// var dp, adp;
// var dps = dhpths.map(function(row) {
//     if (!row || row == '') return;
//     adp = row.split('-');
//     dp = {dhatu: adp[2], pada: adp[4], gana: adp[6], num: adp[7]}; // dp: adp[0], raw: adp[1],
//     // if (!dp.raw) log('NN', row, dp);
//     return dp;
// });
// dps = _.compact(dps);


exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}



// =========================================== QUERY

// переименовать в find, и в run.js тоже
stemmer.prototype.query = function(query, ctins, das) {
    // log('tiNanta', query);
    // 1. выбираю подходящие tins:
    var fits = [];
    var fit, oFit;
    var obj = {};
    var tip, tin, size, gana, la, pada, tvar; // , tvar, canon, periph ;
    // त-ते-2-01-लट्-आ-0-1
    ctins.forEach(function(ctin) {
        [tip, tin, size, gana, la, pada, tvar] = ctin.split('-');
        fit = (size == 0) ? '' : query.slice(-size);
        if (fit == tin) {
            oFit = {tip: tip, tin: tin, size: size, gana: gana, la: la, pada: pada, tvar: tvar}; // , tvar: tvar, canon: canon, periph: periph
            fits.push(oFit);
        }
    });

    // все в один цикл:
    var results = [];
    var dhatu, stem, gana, la, pada, tvar, tips, sha1;
    fits.forEach(function(tin) {
        tin.stem = (tin.size == 0) ? query : query.slice(0, -tin.size);
        // log('FIT, stem:', tin.stem, JSON.stringify(tin));

        das.forEach(function(da) {
            if (da == '') return;
            [dhatu, stem, gana, la, pada, tvar, tips, sha1] = da.split('-');
            if (stem == tin.stem && la == tin.la && pada == tin.pada && tvar == tin.tvar) { //  && tvar == tin.tvar
                if (tips && !inc(tips.split(','), tin.tip)) return;
                // tin.dhatu = dhatu;
                // log('DA', da);
                var res = {tip: tin.tip, tin: tin.tin, size: tin.size, gana: tin.gana, la: tin.la, pada: tin.pada, tvar: tvar, stem: tin.stem, dhatu: dhatu};
                results.push(res);
            }
        });
    });
    // if (results.length == 0) noDaErr(query, fits);
    // log('DAS', results);

    return results;
}

// ====================================

function noDaErr(stem, tins) {
    log('ERR', stem);
    log('ERR', tins);
}
