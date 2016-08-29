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
relax.dbname('sa-tin');

// var conjugs = ['लट्', 'लङ्', 'लोट्', 'विधिलिङ्'];

// exports = module.exports = {
//     stemmer: stemmer,
//     tins: stemmer.tins
// }

exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

stemmer.prototype.query = function(query, cb) {
    getTins(query, function(err, tins) {
        // log('INSIDE TINS', err, res);
        if (err) cb(err, null);
        // if (tins) log('TINS:', tins.length);
        parseQueries(query, tins, function(err, das) {
            // log('LAST QS - TINS', tins);
            // log('LAST QS - DAS', das);
            let queries = mapDas2Tins(das, tins);
            // log('LAST QS - QS', queries);

            cb(null, queries);
        });
    });

}

function mapDas2Tins(das, tins) {
    let queries = [];
    // log('DAS', das.length);
    tins.forEach(function(tin) {
        var ucheck = {};
        var key;
        das.forEach(function(da) {
            // почему здесь неуникальность?
            // if (da.dhatu == tin.dhatu) {
            //     key = [tin.tips, tin.tin, tin.size, da.gana, tin.la, tin.pada, tin.tvar, tin.stem, da.dhatu].join('-');
            //     if (!ucheck[key]) {
            //         let res = {tips: tin.tips, tin: tin.tin, size: tin.size, gana: da.gana, la: tin.la, pada: tin.pada, tvar: tin.tvar, stem: tin.stem, dhatu: da.dhatu, pass: true};
            //         queries.push(res);
            //         ucheck[key] = true;
            //     }
            // }

            key = [tin.tips, tin.tin, tin.size, da.gana, tin.la, tin.pada, tin.stem, da.dhatu, da.tvar].join('-');
            if (da.stem == tin.stem && da.gana == tin.gana && da.la == tin.la && da.pada == tin.pada && da.tvar == tin.tvar) {
                // log('TIN', tin);
                if (ucheck[key]) return;
                if (da.tips && !inc(da.tips.split(','), tin.tip)) return;
                let res = {tips: tin.tips, tin: tin.tin, size: tin.size, gana: tin.gana, la: tin.la, pada: tin.pada, stem: tin.stem, dhatu: da.dhatu};
                queries.push(res);
                ucheck[key] = true;
            }
        });

    });
    return queries;
}


function parseQueries(query, tins, cb) {
    // log('Q', query);
    // log('Q', tins);
    let stems = [];
    tins.forEach(function(tin) {
        let stem = (tin.size == 0) ? query : query.slice(0, -tin.size);
        stems.push(stem);
        tin.stem = stem;
    });
    stems = _.uniq(stems);
    // log('stems:', stems);
    getDas(stems, function(err, das) {
        cb(null, das);
    });
}

function getTins(query, cb) {
    relax.dbname('sa-tin');
    var view = 'sa-tin/byTin';
    // let revers = query.split('').reverse();
    let num, term;
    let qs = [''];
    let stop = (query.length < 7) ? query.length : 7;
    for (num = 0; num < stop; num++) {
        term = query.slice(-num);
        qs.push(term);
    }
    // log('QS', qs);
    // var keys = ['keys=', [JSON.stringify(qs)]].join('');
    let keys = {keys: qs};
    // var keys = ['keys=', JSON.stringify(['इहैव'])].join('');
    // log('get Tins =====>> keys:', keys);
    relax
        .postView(view)
        .send(keys)
        // .view(view)
        // .query(keys)
        .query({include_docs: true})
        .end(function(err, res) {
            // log('ERR morph getDicts', err, res.text);
            if (err) return cb(err, null);
            var rows = JSON.parse(res.text.trim()).rows;
            if (!rows) cb(err, null);
            // log('./morph get Dicts: rows', rows);
            var docs = rows.map(function(row) { return row.doc; });
            // log('SIZE:', docs);
            cb(err, docs);
        });
}

function getDas(stems, cb) {
    relax.dbname('sa-das');
    // log('GET DAS', stems);
    var view = 'sa-das/byStem';
    let keys = {keys: stems};
    // log('get Das =====>> keys:', keys);
    relax
        .postView(view)
        .send(keys)
        // .view(view)
        // .query(keys)
        .query({include_docs: true})
        .end(function(err, res) {
            // log('ERR morph getDicts', err, res.text);
            if (err) return cb(err, null);
            var rows = JSON.parse(res.text.trim()).rows;
            if (!rows) cb(err, null);
            // log('./morph get Dicts: rows', rows);
            var docs = rows.map(function(row) { return row.doc; });
            // log('SIZE DAS:', docs.length);
            cb(err, docs);
        });
}



// здесь взять только обработку pass
// то есть выбор по dhatu

function parseQueries_(query, tins) {
    log('Q', query);
    // log('Q', tins);
    // var results = [];
    // let fit;
    tins.forEach(function(tin) {
        // fit = (tin.size == 0) ? '' : query.slice(-tin.size);
        // if (fit != tin.tin) return;
        tin.stem = (tin.size == 0) ? query : query.slice(0, -tin.size);

        /*
          passive, desider, freq, causal, etc
          идея такая: здесь исследовать stem, если есть признак сложной формы, создать клон tin и критерий отбора корня
         */

        // var dhatu;
        // log('PASS', JSON.stringify(tin));
        if (tin.pada == 'आ' && tin.stem.slice(-1) == 'य') {
            // log('PASS', tin.stem);
            tin.dhatu = tin.stem.slice(0, -1);
            // log('PASS', tin.stem, tin.dhatu);
            tin.pass = true;
        }
        // log('TIN', tin);
        // FIXME: ucheck das вынести наружу, делать один раз
        // здесь нужно найти dhatu по das - по стему
        // черт побери. Сколько же будет обращений к базе?

        return;

        var ucheck = {};
        var key;
        das.forEach(function(da) {
            if (da.dhatu == tin.dhatu) {
                key = [tin.tip, tin.tin, tin.size, da.gana, tin.la, tin.pada, tin.tvar, tin.stem, da.dhatu].join('-');
                if (!ucheck[key]) {
                    var res = {tip: tin.tip, tin: tin.tin, size: tin.size, gana: da.gana, la: tin.la, pada: tin.pada, tvar: tin.tvar, stem: tin.stem, dhatu: da.dhatu, pass: true};
                    results.push(res);
                    ucheck[key] = true;
                }
            }

            if (da.stem == tin.stem && da.gana == tin.gana && da.la == tin.la && da.pada == tin.pada && da.tvar == tin.tvar) {
                if (da.tips && !inc(da.tips.split(','), tin.tip)) return;
                var res = {tip: tin.tip, tin: tin.tin, size: tin.size, gana: tin.gana, la: tin.la, pada: tin.pada, tvar: tin.tvar, stem: tin.stem, dhatu: da.dhatu};
                results.push(res);
            }
        });
    });

}
