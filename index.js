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


exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

stemmer.prototype.query = function(flakes, cb) {
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
        getDas(stems, function(err, das) {
            let queries = mapDas2Tins(das, tins, flakes);
            cb(err, queries);
        });
    });
}

function mapDas2Tins(das, tins, flakes) {
    let queries = [];
    tins.forEach(function(tin) {
        var ucheck = {};
        var key;
        das.forEach(function(da) {
            key = [tin.tips, tin.tin, tin.size, da.gana, tin.la, tin.pada, da.dhatu, da.tvar].join('-');
            if (da.gana == tin.gana && da.la == tin.la && da.pada == tin.pada && da.tvar == tin.tvar) {
                if (ucheck[key]) return;
                if (da.tips && !inc(da.tips.split(','), tin.tip)) return;
                let flake = [da.stem, tin.tin].join('');
                if (!inc(flakes, flake)) return;
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
            cb(err, docs);
        });
}

function getTins(stems, cb) {
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
            cb(err, docs);
        });
}
