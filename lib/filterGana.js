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
    var Fn = {};
    var tipnames = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
    Fn[1] = function(dhatu, form, gana, la, tip, stem, term) {
        // log('FN CALL', form, gana, la, pada, numper);
        var last, dlast;
        if (la == 'लट्') {
            if (tip == 'झ' && term != 'न्ते') return; //  atm. pl.3
            else if (tip == 'झि' && term != 'न्ति') return; // par. pl.3
            // tip = par.sg.1, par.du.1, par.pl.1, atm.du.1, atm.pl1
            if (tip == 'मिप्' || tip == 'वस्' || tip == 'मस्'  || tip == 'वहि' || tip == 'महिङ्' ) {
                last = stem[stem.length-1];
                if (last != c.A) return stem; // laN, sg.1 - term is only -m, but not -ma,va // FIXME: написать эту проверку? а не просто != ?
                dlast = dhatu[dhatu.length-1];
                if (dlast != c.A) stem = stem.slice(0,-1); // dhatu ends with c.A, SrA, etc
            }
        } else if (la == 'लङ्') {
            // tip = par.du.1, par.pl.1, atm.du.1, atm.pl1
            if (tip == 'वस्' || tip == 'मस्'  || tip == 'वहि' || tip == 'महिङ्' ) {
                last = stem[stem.length-1];
                if (last != c.A) return stem; // laN, sg.1 - term is only -m, but not -ma,va // FIXME: написать эту проверку? а не просто != ?
                dlast = dhatu[dhatu.length-1];
                if (dlast != c.A) stem = stem.slice(0,-1); // dhatu ends with c.A, SrA, etc
            }
        }
        return stem;
    };
    return Fn[gana];
}
