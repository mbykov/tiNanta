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
    //                 P:  sg.3  du.3  pl.3 sg.2   du.2  du.1 sg.1 du.1 pl.1 A:sg.3 du.3  pl.3 sg.2   du.2      pl.2    sg.1  du.1  pl.1
    var tipnames = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
    Fn[1] = function(dhatu, form, gana, set, la, tip, stem, term) {
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
        } else if (la == 'लिट्') {
            // tip = par.sg.3, par.sg.1, par.pl.3
            if (tip == 'तिप्' || tip == 'थ'  || tip == 'मिप्') {
                return stem;
            } if (set) {
                // throw new Error('SET: ' + dhatu);

                if (term == 'थ' || term == 'व' || term == 'म' || term == 'वहे' || term == 'महे' || term == 'ध्वे' || term == 'ढ्वे'  || term == 'से'  || term == 'षे') {
                    stem = stem.replace(/ि$/, '');
                }
            }
        } else if (la == 'लुङ्') {
            // 'लुङ्': {'तिप्': 'त्-सीत्-ईत्-सत्', 'तस्': 'ताम्-स्ताम्-इष्टाम्-सिष्टाम्-सताम्', 'झि': 'अन्-सुः-इषुः-सिषुः-सन्', 'सिप्': 'ः-सीः-ईः-सः', 'थस्': 'तम्-स्तम्-इष्टम्-सिष्टम्-सतम्', 'थ': 'त-स्त-इष्ट-सिष्ट-सत', 'मिप्': 'अम्-सम्-इषम्-सिषम्-सम्', 'वस्': 'व-स्व-इष्व-सिष्व-साव', 'मस्': 'म-स्म-इष्म-सिष्म-साम', 'त': 'त-स्त-इष्ट-सत', 'आताम्': 'इताम्-साताम्-इषाताम्-साताम्', 'झ': 'अन्त-सत-इषत-सन्त', 'थास्': 'थाः-स्थाः-इष्ठाः-सथाः', 'आथाम्': 'इथाम्-साथाम्-इषाथाम्', 'ध्वम्': 'ध्वम्-इध्वम्-सध्वम्', 'इट्': 'इ-सि-इषि', 'वहि': 'वहि-स्वहि-इष्वहि-सावहि', 'महिङ्': 'महि-स्महि-इष्महि-सामहि'}
            //
            // если dhatu на s,ш - то не отбрасывать s-окончания, etc
            //
            if (tip == 'तिप्') { // त्-सीत्-ईत्-सत्
                stem = stem.replace(/सी$/, '').replace(/ि$/, '').replace(/स$/, '');
            } else if (tip == 'तस्') { // 'तस्': 'ताम्-स्ताम्-इष्टाम्-सिष्टाम्-सताम्'
                stem = stem.replace(/स्$/, '').replace(/िस्$/, '').replace(/स$/, '');
            } else if (tip == 'झि') { // 'झि': 'अन्-सुः-इषुः-सिषुः-सन्',
                stem = stem.replace(/स$/, '');
            } else if (tip == 'सिप्') { // 'सिप्': 'ः-सीः-ईः-सः'
                // log('TTT', stem);
                stem = stem.replace(/ि$/, '').replace(/सी$/, '').replace(/स$/, '').replace(/ष$/, '').replace(/षी$/, '');
                // log('TTT2', stem);
            } else if (tip == 'मिप्') { // 'मिप्': 'अम्-सम्-इषम्-सिषम्', // अध्मासिषम्
                // BUz-alaNkAre-BvAdiH-1032 - на Ш. И отбрасывать - не надо. Как быть?
                stem = stem.replace(/िष$/, '').replace(/ष$/, '').replace(/स$/, '').replace(/ि$/, '');
            } else if (tip == 'वस्') { // 'वस्': 'व-स्व-इष्व-सिष्व-साव',
                stem = stem.replace(/स्$/, '').replace(/िष्$/, '').replace(/सिष्$/, '').replace(/सा$/, '');
            } else if (tip == 'मस्') { // 'मस्': 'म-स्म-इष्म-सिष्म-साम'
                stem = stem.replace(/स्$/, '').replace(/िष्$/, '').replace(/सिष्$/, '').replace(/सा$/, '');
            } else if (tip == 'थस्') { // 'थस्': 'तम्-स्तम्-इष्टम्-सिष्टम्-सतम्'
                stem = stem.replace(/स्$/, '').replace(/स$/, '').replace(/ि$/, '');
            } else if (tip == 'थ') { // 'थ': 'त-स्त-इष्ट-सिष्ट-सत'
                stem = stem.replace(/स्$/, '').replace(/स$/, '').replace(/ि$/, '');

            } else if (tip == 'ध्वम्') { // 'ध्वम्': 'ध्वम्-इध्वम्-सध्वम्',
                stem = stem.replace(/ि$/, '').replace(/स$/, '');
            } else if (tip == 'इट्') { // 'इट्': 'इ-सि-इसि-षि-इषि'
                stem = stem.replace(/िस$/, '').replace(/िष$/, '').replace(/स$/, ''); // sa, isa // अभामिष
            } else if (tip == 'वहि') { // 'वहि': 'वहि-स्वहि-इष्वहि-सावहि'
                stem = stem.replace(/स्$/, '').replace(/िष्$/, '').replace(/सा$/, '');
            } else if (tip == 'महिङ्') { // 'महिङ्': 'महि-स्महि-इष्महि-सामहि'
                stem = stem.replace(/स्$/, '').replace(/िष्$/, '').replace(/सा$/, '');
            }
        }


        return stem;
    };
    return Fn[gana];
}
