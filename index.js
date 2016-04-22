/*
 * stemmer.js - forms queries for Morpheus v.2.0
 */

var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;
var _ = require('underscore');

exports = module.exports = stemmer();

function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

// samasa to queries array
stemmer.prototype.query = function(query) {
    this.queries = [];
    sup.nama.call(this, query);
    sup.kriya.call(this, query);
    var qs = this.queries.map(function(q) { return q.query});
    if (!isIN(qs, query)) {
        var plainDict = {pos: 'plain', query: query};
        this.queries.push(plainDict);
    }
    // log('======STEMMER========', this.queries);
    // var tmps = _.select(this.queries, function(q) { return q.var == 'at' || q.var == 't' });
    // return tmps;
    return this.queries;
}


// окончания f</key1>:
// kf tf sf pf Bf Qf vf hf df Df wf gf mf - etc, практически все согласные есть
//
//



function ulog (obj) {
    console.log(util.inspect(obj, showHidden=false, depth=null, colorize=true));
}

function log() { console.log.apply(console, arguments) }

function isIN(arr, item) {
    return (arr.indexOf(item) > -1) ? true : false;
}
