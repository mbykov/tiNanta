/*
 * stemmer.js - forms queries for Morpheus v.0.4.0
 */

// var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');

var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;

var conjugs = ['लट्', 'लङ्', 'लोट्', 'विधिलिङ्'];

// это в run.js

// var lakaras = ['law', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
// var ctinsPath = path.join(__dirname, './lib/canonical_tins_cache.js');

// var tinsPath = path.join(__dirname, './lib/tins_cache.js');
// var ctins = fs.readFileSync(tinsPath).toString().split('\n');

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
    // var stem, tip, tin, size, gana, la, pada, tvar; // , tvar, canon, periph ;
    // त-ते-2-01-लट्-आ-0-1
    var results = [];
    // var odhatu, ostem, ogana, ola, opada, otvar, otips, osha1;

    ctins.forEach(function(tin) {
        fit = (tin.size == 0) ? '' : query.slice(-tin.size);
        if (fit != tin.tin) return;
        tin.stem = (tin.size == 0) ? query : query.slice(0, -tin.size);

        /*
          passive, desider, freq, causal, etc
          идея такая: здесь исследовать stem, если есть признак сложной формы, создать клон tin и критерий отбора корня
         */

        var dhatu;
        log('PASS', JSON.stringify(tin));
        if (tin.pada == 'आ' && tin.stem.slice(-1) == 'य') {
            log('PASS', tin.stem);
            dhatu = tin.stem.slice(0, -1);
        }


        das.forEach(function(da) {
            // if (tin.pada == 'आ' && tin.stem.slice(-1) == 'य') {
            //     dhatu = tin.stem.slice(0, -1);
            //     if (da.dhatu == dhatu && da.la == tin.la && da.pada == tin.pada && da.tvar == tin.tvar) {
            //         var res = {tip: tin.tip, tin: tin.tin, size: tin.size, gana: da.gana, la: tin.la, pada: tin.pada, tvar: tin.tvar, stem: tin.stem, dhatu: da.dhatu, pass: true};
            //         results.push(res);
            //     }
            // }

            if (da.stem == tin.stem && da.gana == tin.gana && da.la == tin.la && da.pada == tin.pada && da.tvar == tin.tvar) {
                if (da.tips && !inc(da.tips.split(','), tin.tip)) return;
                var res = {tip: tin.tip, tin: tin.tin, size: tin.size, gana: tin.gana, la: tin.la, pada: tin.pada, tvar: tin.tvar, stem: tin.stem, dhatu: da.dhatu};
                results.push(res);
            }
        });
    });

    return results;
}

// ====================================

// stemmer.prototype.query_ = function(query, ctins, das) {
//     // log('tiNanta', query);
//     // 1. выбираю подходящие tins:
//     var fits = [];
//     var fit, oFit;
//     var obj = {};
//     var stem, tip, tin, size, gana, la, pada, tvar; // , tvar, canon, periph ;
//     // त-ते-2-01-लट्-आ-0-1
//     var results = [];
//     var odhatu, ostem, ogana, ola, opada, otvar, otips, osha1;

//     ctins.forEach(function(ctin, idx) {
//         [tip, tin, size, gana, la, pada, tvar] = ctin.split('-');
//         fit = (size == 0) ? '' : query.slice(-size);
//         if (fit != tin) return;

//         stem = (size == 0) ? query : query.slice(0, -size);
//         log('FIT, stem:', stem, JSON.stringify(tin));

//         das.forEach(function(da) {
//             if (da == '') return;
//             [odhatu, ostem, ogana, ola, opada, otvar, otips, osha1] = da.split('-');
//             // var shamsg = [ostem, ogana, ola, opada, otvar].join('-'); // , doc.tips
//             // var shakey = sha1(shamsg);

//             // if (ostem == stem && ola == la && opada == pada && otvar == tvar) { // а gana что ?
//             if (ostem == stem && opada == pada && otvar == tvar) { // а gana что ?
//             // if (osha1 == shakey) { // а gana что ?
//                 if (otips && !inc(otips.split(','), tip)) return;
//                 // log('DA', da);
//                 var res = {tip: tip, tin: tin, size: size, gana: gana, la: la, pada: pada, tvar: tvar, stem: ostem, dhatu: odhatu};
//                 results.push(res);
//             }
//         });
//     });

//     return results;
// }


// function noDaErr(stem, tins) {
//     log('ERR', stem);
//     log('ERR', tins);
// }

// stemmer.prototype.query_ = function(query, ctins, das) {
//     // log('tiNanta', query);
//     // 1. выбираю подходящие tins:
//     var fits = [];
//     var fit, oFit;
//     var obj = {};
//     var tip, tin, size, gana, la, pada, tvar; // , tvar, canon, periph ;
//     // त-ते-2-01-लट्-आ-0-1
//     ctins.forEach(function(ctin) {
//         [tip, tin, size, gana, la, pada, tvar] = ctin.split('-');
//         fit = (size == 0) ? '' : query.slice(-size);
//         if (fit == tin) {
//             oFit = {tip: tip, tin: tin, size: size, gana: gana, la: la, pada: pada, tvar: tvar}; // , tvar: tvar, canon: canon, periph: periph
//             fits.push(oFit);
//         }
//     });

//     // все в один цикл:
//     var results = [];
//     var dhatu, stem, gana, la, pada, tvar, tips, sha1;
//     fits.forEach(function(tin) {
//         tin.stem = (tin.size == 0) ? query : query.slice(0, -tin.size);
//         // log('FIT, stem:', tin.stem, JSON.stringify(tin));

//         das.forEach(function(da) {
//             if (da == '') return;
//             [dhatu, stem, gana, la, pada, tvar, tips, sha1] = da.split('-');
//             if (stem == tin.stem && la == tin.la && pada == tin.pada && tvar == tin.tvar) { //  && tvar == tin.tvar
//                 if (tips && !inc(tips.split(','), tin.tip)) return;
//                 // tin.dhatu = dhatu;
//                 // log('DA', da);
//                 var res = {tip: tin.tip, tin: tin.tin, size: tin.size, gana: tin.gana, la: tin.la, pada: tin.pada, tvar: tvar, stem: tin.stem, dhatu: dhatu};
//                 results.push(res);
//             }
//         });
//     });
//     // if (results.length == 0) noDaErr(query, fits);
//     // log('DAS', results);

//     return results;
// }
