/*
 * stemmer.js - forms queries for Morpheus v.0.4.0
 */

// var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
// var sha1 = require('sha1');


var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;

// var dbpath = 'http://admin:kjre4317@localhost:5984';
var dbpath = 'http://localhost:5984';
var Relax = require('relax-component');
var relax = new Relax(dbpath);
relax.dbname('sa-tins');

// var conjugs = ['लट्', 'लङ्', 'लोट्', 'विधिलिङ्'];

// exports = module.exports = {
//     stemmer: stemmer,
//     tins: stemmer.tins
// }

exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

// массив: // 'करोति', 'करोत', 'करो', 'कर'
// 1. получаю все возможные tins
// 2. образую stems
// 3. запрос к das

stemmer.prototype.query = function(flakes, cb) {
    // flakes = [ 'करो',  'करोति', 'करोती',  'करोत्येव'];
    // flakes = [ 'करोति'];
    getTins(flakes, function(err, tins) {
        if (err) cb(err, null);
        let stems = [];
        let flake;
        for (flake of flakes) {
            tins.forEach(function(tin) {
                let stem = (tin.size == 0) ? flake : flake.slice(0, -tin.size);
                stems.push(stem);
            });
        }
        stems = _.uniq(stems);
        // stems = ['आकिष्टाम्'];
        // stems = ['आक'];
        // log('ST', stems);
        getDas(stems, function(err, das) {
            // log('DAS', err, das);
            let queries = mapDas2Tins(das, tins, flakes);
            cb(err, queries);
        });
    });
}

function mapDas2Tins(das, tins, flakes) {
    let queries = [];
    // let luns = _.select(tins, function(t) { return t.la == 'लुट्' && t.pada == 'प'; });
    // log('LUNS', luns);
    // log('FLAKES', flakes);
    tins.forEach(function(tin) {
        var ucheck = {};
        var key;
        das.forEach(function(da) {
            key = [tin.tips, tin.tin, tin.size, da.gana, tin.la, tin.pada, da.dhatu, da.tvar].join('-');
            // log('----------------T--------------------', key);
            if (da.gana == tin.gana && da.la == tin.la && da.pada == tin.pada && da.tvar == tin.tvar) {
                if (ucheck[key]) return;
                if (da.tips && !inc(da.tips.split(','), tin.tip)) return;
                let flake = [da.stem, tin.tin].join('');
                if (!inc(flakes, flake)) return;
                // log('----------------T--------------------', tin);
                // log('----------------D--------------------', da);
                let res = {verb: true, tips: tin.tips, tin: tin.tin, size: tin.size, gana: tin.gana, la: tin.la, pada: tin.pada, stem: da.stem, dhatu: da.dhatu};
                res.flake = flake;
                queries.push(res);
                ucheck[key] = true;
            }
        });

    });
    return queries;
}

function getDas(stems, cb) {
    // relax.dbname('sa-das');
    var view = 'sa-tins/byAnga';
    let keys = {keys: stems};
    relax
        .postView(view)
        .send(keys)
        .query({include_docs: true})
        .end(function(err, res) {
            if (err) return cb(err, null);
            var rows = JSON.parse(res.text.trim()).rows;
            if (!rows) cb(err, null);
            var docs = rows.map(function(row) { return row.doc; });
            // log('D', docs);
            cb(err, docs);
        });
}

// err-test: अंस् form: अंसयिता key अंस्-लुट्-प

function getTins(stems, cb) {
    // relax.dbname('sa-tin');
    var view = 'sa-tins/byTin';
    let stem, num, term;
    let qs = [''];
    for (stem of stems) {
        let stop = (stem.length < 10) ? stem.length : 10;
        for (num = 0; num < stop; num++) {
            term = stem.slice(-num);
            qs.push(term);
        }
    }
    qs = _.uniq(qs);
    // log('TERMS', qs);
    let keys = {keys: qs};
    relax
        .postView(view)
        .send(keys)
        .query({include_docs: true})
        .end(function(err, res) {
            if (err) return cb(err, null);
            var rows = JSON.parse(res.text.trim()).rows;
            if (!rows) cb(err, null);
            var docs = rows.map(function(row) { return row.doc; });
            // log('T',docs);
            cb(err, docs);
        });
}




// function stem2dhatu(stems, tins, cb) {
//     log('stems:', stems);
//     // cb(null, []);
//     // return;
//     getDas(stems, function(err, das) {
//         cb(null, das);
//     });
// }


// stemmer.prototype.query_ = function(query, cb) {
//     getTins(query, function(err, tins) {
//         // log('INSIDE TINS', err, res);
//         if (err) cb(err, null);
//         // if (tins) log('TINS:', tins.length);
//         parseQueries(query, tins, function(err, das) {
//             // log('LAST QS - TINS', tins);
//             // log('LAST QS - DAS', das);
//             let queries = mapDas2Tins(das, tins);
//             // log('LAST QS - QS', queries);

//             cb(null, queries);
//         });
//     });

// }


// function parseQueries(query, tins, cb) {
//     // log('Q', query);
//     // log('Q', tins);
//     let stems = [];
//     tins.forEach(function(tin) {
//         let stem = (tin.size == 0) ? query : query.slice(0, -tin.size);
//         stems.push(stem);
//         tin.stem = stem;
//     });
//     stems = _.uniq(stems);
//     // log('stems:', stems);
//     getDas(stems, function(err, das) {
//         cb(null, das);
//     });
// }

// function getTins_(query, cb) {
//     relax.dbname('sa-tin');
//     var view = 'sa-tin/byTin';
//     // let revers = query.split('').reverse();
//     let num, term;
//     let qs = [''];
//     let stop = (query.length < 7) ? query.length : 7;
//     for (num = 0; num < stop; num++) {
//         term = query.slice(-num);
//         qs.push(term);
//     }
//     // log('QS', qs);
//     // var keys = ['keys=', [JSON.stringify(qs)]].join('');
//     let keys = {keys: qs};
//     // var keys = ['keys=', JSON.stringify(['इहैव'])].join('');
//     // log('get Tins =====>> keys:', keys);
//     relax
//         .postView(view)
//         .send(keys)
//         // .view(view)
//         // .query(keys)
//         .query({include_docs: true})
//         .end(function(err, res) {
//             // log('ERR morph getDicts', err, res.text);
//             if (err) return cb(err, null);
//             var rows = JSON.parse(res.text.trim()).rows;
//             if (!rows) cb(err, null);
//             // log('./morph get Dicts: rows', rows);
//             var docs = rows.map(function(row) { return row.doc; });
//             // log('SIZE:', docs);
//             cb(err, docs);
//         });
// }



// здесь взять только обработку pass
// то есть выбор по dhatu

// function parseQueries_(query, tins) {
//     log('Q', query);
//     // log('Q', tins);
//     // var results = [];
//     // let fit;
//     tins.forEach(function(tin) {
//         // fit = (tin.size == 0) ? '' : query.slice(-tin.size);
//         // if (fit != tin.tin) return;
//         tin.stem = (tin.size == 0) ? query : query.slice(0, -tin.size);

//         /*
//           passive, desider, freq, causal, etc
//           идея такая: здесь исследовать stem, если есть признак сложной формы, создать клон tin и критерий отбора корня
//          */

//         // var dhatu;
//         // log('PASS', JSON.stringify(tin));
//         if (tin.pada == 'आ' && tin.stem.slice(-1) == 'य') {
//             // log('PASS', tin.stem);
//             tin.dhatu = tin.stem.slice(0, -1);
//             // log('PASS', tin.stem, tin.dhatu);
//             tin.pass = true;
//         }
//         // log('TIN', tin);
//         // FIXME: ucheck das вынести наружу, делать один раз
//         // здесь нужно найти dhatu по das - по стему
//         // черт побери. Сколько же будет обращений к базе?

//         return;

//         var ucheck = {};
//         var key;
//         das.forEach(function(da) {
//             if (da.dhatu == tin.dhatu) {
//                 key = [tin.tip, tin.tin, tin.size, da.gana, tin.la, tin.pada, tin.tvar, tin.stem, da.dhatu].join('-');
//                 if (!ucheck[key]) {
//                     var res = {tip: tin.tip, tin: tin.tin, size: tin.size, gana: da.gana, la: tin.la, pada: tin.pada, tvar: tin.tvar, stem: tin.stem, dhatu: da.dhatu, pass: true};
//                     results.push(res);
//                     ucheck[key] = true;
//                 }
//             }

//             if (da.stem == tin.stem && da.gana == tin.gana && da.la == tin.la && da.pada == tin.pada && da.tvar == tin.tvar) {
//                 if (da.tips && !inc(da.tips.split(','), tin.tip)) return;
//                 var res = {tip: tin.tip, tin: tin.tin, size: tin.size, gana: tin.gana, la: tin.la, pada: tin.pada, tvar: tin.tvar, stem: tin.stem, dhatu: da.dhatu};
//                 results.push(res);
//             }
//         });
//     });

// }
