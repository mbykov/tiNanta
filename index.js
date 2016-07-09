/*
 * stemmer.js - forms queries for Morpheus v.0.4.0
 */

// var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;
var _ = require('underscore');
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

exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

// samasa to queries array
stemmer.prototype.query = function(query) {
    this.queries = [];
    // если проходит грубый фильтр, то tiNanta ? Или нет смысла?
    this.tiNanta(query);
    return this.queries;
}

stemmer.prototype.tiNanta = function(query) {
    log('tiNanta', query);
    // 1. выбираю подходящие tins:
    var fits = [];
    var test;
    ctins.forEach(function(ctin) {
        test = query.slice(-ctin.size);
        if (test == ctin.tin) fits.push(ctin);
    });
    log('fits', fits);

    // 2. нахожу самый короткий стем: // FIXME: это в одно действие, конечно
    var stins = fits.map(function(tin) { return tin.tin.length });
    var maxtin = _.max(stins);
    var maxtins = _.select(fits, function(tin) { return tin.tin.length == maxtin });
    // log('MAX TINS', maxtins);
    // var stems = maxtins.map(function(mt) { return query.slice(0, -mt.size) });
    // stems = _.uniq(stems);
    // log('stems', stems);

    // 3. поиск dhatu:
    var results = [];
    var res, stem, da;
    fits.forEach(function(tin) {
        stem = query.slice(0, -tin.size);
        // каждому stem соответствует строго один dhatu?
        da = _.find(jnuDhatuAnga, function(da) { return da.tvar == tin.tvar && da.stem == stem && da.la == tin.la}); //  && da.pada == tin.pada
        if (!da) {
            log('==========>>>> no DA stem:', stem, tin);
            var possible_stems = _.select(jnuDhatuAnga, function(da) { return da.stem == stem});
            log('==========>>>> possible stems: ', possible_stems);
            throw new Error();
        }
        res = {dhatu: da.dhatu, stem: stem, tin: tin.tin, la: tin.la, tip: tin.tip };
        results.push(res);
    });
    log('R', results);
    // log(jnuDhatuAnga);

    this.queries.push('QQQ');
    return this.queries;
}
