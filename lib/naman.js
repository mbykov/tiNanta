/*
  naman
*/

var _ = require('underscore');
// var redup = require('./redup');
var krit = require('./kridanta');
var shiva = require('../../shiva');
var sandhi = require('../../sandhi');
var Const = require('./constants');
var u = require('./utils');
var debug = (process.env.debug == 'true') ? true : false;

module.exports = naman();

function naman() {
    if (!(this instanceof naman)) return new naman();
    return this;
}

naman.prototype.get = function(query) {
    var that = this;
    // var stems;
    // var stem;
    // var flex;
    var dict = '';
    for (var gend in Const.namanEnds) {
        var nums = Const.namanEnds[gend];
        for (var num in nums) {
            var vars = nums[num];
            for (var v in vars) {
                if (v == 'T') continue; // FIXME: template - убрать
                var keys = vars[v];
                for (var key in keys) {
                    // stems = [];
                    if (key == 'dict') {
                        dict = keys[key];
                        continue;
                    }
                    if (dict == '' && v != 'a') continue; // когда эти значения дают лишние морфологии? как их убрать?
                    var term2 = keys[key];
                    // if (term2 == '') continue; // neut_nAman_sg.nom_nAma

                    var flex = {query: query, gend: gend, key: key, var: v}; // stem:stem,
                    var terms = term2.split('-');

                    _.each(terms, function(term) {
                        var stop = false;
                        var stem = u.replaceEnd(query, term, dict);
                        // if (dict != term && stem == query) stop = true; // иначе не проходит случай, где term == dict, i.e. _fem - в словаре A - в zeroFlex
                        if (stem == query) stop = true;
                        switch(v) { // это имеет смысл, только если dict пуст
                        case 'a':
                            if (!u.end_a(stem)) stop = true;
                            break;
                        }
                        if (stop) return;
                        // u.p(flex, 'flex');
                        // stems.push(stem);

                        var cflex = _.clone(flex);
                        cflex.stem = stem;
                        cflex.flex = term;
                        cflex.stems = [stem]; // FIXME: убрать
                        u.qsForNaman.call(that, cflex, v);
                        // u.p(cflex, 'N');

                        var kflex = _.clone(flex);
                        var clean = u.replaceEnd(query, term);
                        kflex.stem = clean;
                        krit.check.call(that, kflex);
                    });
                    // if (stems.length == 0) continue;
                    // flex.stems = stems;
                    // u.qsForNaman.call(that, flex, v);
                    // не нужно
                    // _.each(flex.stems, function(stem) {
                    //     var cflex = _.clone(flex);
                    //     cflex.stem = stem;
                    //     // krit.check.call(that, cflex);
                    // });
                } // keys
            }
        }
    }
}

function log() { console.log.apply(console, arguments) }
