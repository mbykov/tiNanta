/*
  tinsup
*/

var _ = require('underscore');
var aff = require('./affixes');
// var u = require('./utils');
// var c = require('./constants');
var sup = aff.sup;
var tins = aff.tin;
var ganas = require('./gana');
// var debug = (process.env.debug == 'true') ? true : false;
var s = require('sandhi');
var c = s.const;
var u = s.u;
var inc = u.include;
var log = u.log;
var p = u.p;


module.exports = tinsup();

function tinsup() {
    if (!(this instanceof tinsup)) return new tinsup();
}

tinsup.prototype.kriya = function(query) {
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

tinsup.prototype.nama = function(query) {
    var that = this;
    var dict = '';
    var uniqTerm = [];
    var hash = {};
    for (var gend in sup) {
        // log('G', gend)
        var nums = sup[gend];
        for (var num in nums) {
            // log('NUM', num)
            var vars = nums[num];
            for (var v in vars) {
                // if (v != 'a') continue;
                var keys = vars[v];
                dict = keys.dict;
                for (var key in keys) {
                    if (key == 'dict') continue;
                    // if (dict == '' && v != 'a') continue; // когда эти значения дают лишние морфологии? как их убрать?
                    var term2 = keys[key];
                    // if (term2 == '') continue; // neut_nAman_sg.nom_nAma // FIXME: нету?
                    var terms = term2.split('-');

                    terms.forEach(function(term, idx) {
                        var tail = query.slice(-term.length);
                        // if (gend == 'masc' && num == 'sg' && v == 'a') log('KEY', key, 'TS', terms, 'T', term);
                        if (term != '' && term != tail) return;
                        var morph = {term: term, dict: dict, gend: gend, num: num, key: key};
                        if (!hash[v]) {
                            hash[v] = [morph];
                        } else {
                            hash[v].push(morph);
                        }
                        // if (gend == 'masc' && num == 'sg' && v == 'at') log('HASH', hash);
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
            var stem = (size == 0) ? query : query.slice(0, -size);
            // var stem = query.slice(0, -size);
            var fin = u.last(stem);
            // смысл: нет двух гласных или гласной после вирамы:
            if (m.dict != '' && u.isVowel(m.dict) && (u.isVowel(fin)) || u.isVirama(fin)) return;
            // смысл: если var=a, то fin - консонант only
            if (m.dict == '' && !u.isConsonant(fin)) return;
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
    // p(queries)
    that.queries = that.queries.concat(queries);
    return;
}

function log() { console.log.apply(console, arguments) }
