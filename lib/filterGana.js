/*
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

exports = module.exports = filter();

function filter() {
    if (!(this instanceof filter)) return new filter();
}

filter.prototype.gana = function(gana) {
    var _Fn;
    if (gana == 1) {
        _Fn = function(form, gana, la, pada, numper, stem) {
            // log('FN CALL', form, gana, la, pada, numper);
            if ((pada == 'par' && (numper == 'sg.1' || numper == 'du.1' || numper == 'pl.1' )) || (pada == 'atm' && (numper == 'du.1' || numper == 'pl.1' ))) {
                var last = stem[stem.length-1];
                if (last != c.A) return;
                stem = stem.slice(0,-1);
            }
            return stem;
        };
    }
    return _Fn;
}

// filter.prototype.object = function(gana) {
//     log('GANA', gana);
// }
