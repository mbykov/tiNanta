/*
 * stemmer.js - forms queries for Morpheus v.0.4.0
 */

// var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;
var _ = require('underscore');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;
var tins = require('./lib/tins/laN');

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
    log('Tins', tins);

    this.queries.push('QQQ');
    return this.queries;
}
