/*
  naman
*/

var _ = require('underscore');
var aff = require('./affixes');
var u = require('./utils');
var c = require('./constants');
var sup = aff.sup;
var tins = aff.tin;
var ganas = require('./gana');
// var debug = (process.env.debug == 'true') ? true : false;

module.exports = naman();

function naman() {
    if (!(this instanceof naman)) return new naman();
}

naman.prototype.kriya = function(query) {
    var that = this;
    tins.forEach(function(flex) {
        var term = flex.flex;
        var tail = query.slice(-term.length);
        if (term != tail) return;
        flex.query = query;
        var stem = query.slice(0, term.length);
        var cflex = _.clone(flex);
        cflex.stem = stem;
        ganas.get.call(that, cflex);
    });
    return;
}

naman.prototype.nama = function(query) {
    var that = this;
    var dict = '';
    var uniqTerm = [];
    var hash = {};
    for (var gend in sup) {
        var nums = sup[gend];
        for (var num in nums) {
            var vars = nums[num];
            for (var v in vars) {

                // if (v != 'a') continue;

                var keys = vars[v];
                for (var key in keys) {
                    if (key == 'dict') {
                        dict = keys[key];
                        continue;
                    }
                    if (dict == '' && v != 'a') continue; // когда эти значения дают лишние морфологии? как их убрать?
                    var term2 = keys[key];
                    // if (term2 == '') continue; // neut_nAman_sg.nom_nAma // FIXME: нету?
                    var terms = term2.split('-');

                    terms.forEach(function(term) {
                        var tail = query.slice(-term.length);
                        if (term != tail) return;
                        var morph = {term: term, dict: dict, gend: gend, num: num, key: key};
                        if (!hash[v]) {
                            hash[v] = [morph];
                        } else {
                            hash[v].push(morph);
                        }
                    });
                } // keys
            }
        }
    } // gend

    var res = {};
    var queries = [];
    for (var v in hash) {
        var ms = hash[v];
        var q;
        ms.forEach(function(m) {
            var size = m.term.length;
            var stem = query.slice(0, -size);
            var last = stem.slice(-1);
            if (m.dict != '' && u.isIN(c.vowels, m.dict) && (u.isIN(c.vowels, last) || u.isIN(c.dirghas, last))) return;
            stem = [stem, m.dict].join('');
            var morph = {gend: m.gend, num: m.num, key: m.key};
            if (!res[stem]) {
                q = {pos: 'name', query: stem, var: v, dict: m.dict, term: m.term, morphs: [morph]};
                res[stem] = key;
                queries.push(q);
            } else {
                q.morphs.push(morph);
            }
        });
    }
    that.queries = that.queries.concat(queries);
    return;
}

function log() { console.log.apply(console, arguments) }
