/*
  determination of a gana for the flex
  flex.stem - всегда единственный - flex клонируется. Здесь формируется массив flex.dhatus
*/

var _ = require('underscore');
var redup = require('./redup');
var sandhi = require('../../sandhi/sandhi.js');
var Const = require('./constants');
var u = require('./utils');
var debug = (process.env.debug == 'true') ? true : false;

module.exports = gana();

function gana() {
    if (!(this instanceof gana)) return new gana();
    return this;
}

// gana.prototype.zeroFlex = function(flex) {
//     flex.stem = [flex.query, 'ति'].join('');
//     flex.stems = [flex.stem];
//     flex.queries = [];
//     u.queries(flex, 1, 'stem');
// }

function filterPas(flex) {
    var ends = {
        'lat_atm': {'sg.3': 'यते', 'sg.2': 'यसे', 'sg.1': 'ये', 'du.3': 'येते', 'du.2': 'येथे', 'du.1': 'यावहे', 'pl.3': 'यन्ते', 'pl.2': 'यध्वे', 'pl.1': 'यामहे'},
        'lan_atm': {'sg.3': 'यत', 'sg.2': 'यथाः', 'sg.1': 'ये', 'du.3': 'येताम्', 'du.2': 'येथाम्', 'du.1': 'यावहि', 'pl.3': 'यन्त', 'pl.2': 'यध्वम्', 'pl.1': 'यामहि'},
        'lot_atm': {'sg.3': 'यताम्', 'sg.2': 'यस्व', 'sg.1': 'यै', 'du.3': 'येताम्', 'du.2': 'येथाम्', 'du.1': 'यावहै', 'pl.3': 'यन्ताम्', 'pl.2': 'यध्वम्', 'pl.1': 'यामहै'},
        'lin_atm': {'sg.3': 'येत', 'sg.2': 'येथाः', 'sg.1': 'येय', 'du.3': 'येयाताम्', 'du.2': 'येयाथाम्', 'du.1': 'येवहि', 'pl.3': 'येरन्', 'pl.2': 'येध्वम्', 'pl.1': 'येमहि'},
    }
    var term = ends[flex.lapada][flex.key];
    if (term.length == 0) return; // FIXME: это временно, для настройки ends
    if (!u.endWith(flex.query, term)) return;

    var that = this;
    var cflex = _.clone(flex);
    cflex.pada = 'pas';
    var re = new RegExp(term+'$');
    var stem = cflex.query.replace(re, '');
    cflex.stem = stem;
    // TODO: ?  ========================= guna-vriddhi, short-long, etc, see karmani ?

    var longvow = false;
    var last = stem.slice(-1);
    var longs = _.keys(Const.longshort);
    var aLong;
    if (u.isIN(longs, last)) aLong = u.replaceEnd(stem, last, Const.A);

    var dhatus = _.compact([stem, aLong]);
    var agunas = u.aguna(stem);
    // log('=pas=', stem, dhatus, agunas);
    cflex.dhatus = _.uniq(dhatus.concat(agunas));
    // u.p(cflex, 'pas');
    u.suffixes.call(that, cflex, false); // false means no gana
}

gana.prototype.get = function(flex) {
    if (flex.la == 'lit') return; // dup отдельно - // где, что за wtf?
    var that = this;
    if (flex.la == 'lan' && !that.lan) return;
    if (flex.pada == 'pas') return;
    flex.lapada = u.lapada(flex);
    filterOne.call(that, flex);
    filterFive.call(that, flex);
    filterNine.call(that, flex);
    filterSeven.call(that, flex);
    filterTwo.call(that, flex);
    redup.check.call(that, flex);
    if (flex.pada == 'atm') filterPas.call(that, flex);
}

function filterOne(flex) { // W.734
    var ends = { // lot_par_sg.2=null
        'lat_par': {'sg.3': 'ति', 'sg.2': 'सि', 'sg.1': 'ामि', 'du.3': 'तः', 'du.2': 'थः', 'du.1': 'ावः', 'pl.3': 'न्ति', 'pl.2': 'थ', 'pl.1': 'ामः'},
        'lat_atm': {'sg.3': 'ते', 'sg.2': 'से', 'sg.1': 'े', 'du.3': 'ेते', 'du.2': 'ेथे', 'du.1': 'ावहे', 'pl.3': 'न्ते', 'pl.2': 'ध्वे', 'pl.1': 'ामहे'},
        'lan_par': {'sg.3': 'त्', 'sg.2': 'ः', 'sg.1': 'म्', 'du.3': 'ताम्', 'du.2': 'तम्', 'du.1': 'ाव', 'pl.3': 'न्', 'pl.2': 'त', 'pl.1': 'ाम'},
        'lan_atm': {'sg.3': 'त', 'sg.2': 'थाः', 'sg.1': 'े', 'du.3': 'ेताम्', 'du.2': 'ेथाम्', 'du.1': 'ावहि', 'pl.3': 'न्त', 'pl.2': 'ध्वम्', 'pl.1': 'ामहि'},
        'lot_par': {'sg.3': 'तु', 'sg.2': '', 'sg.1': 'ानि-ाणि', 'du.3': 'ताम्', 'du.2': 'तम्', 'du.1': 'ाव', 'pl.3': 'न्तु', 'pl.2': 'त', 'pl.1': 'ाम'},
        'lot_atm': {'sg.3': 'ताम्', 'sg.2': 'स्व', 'sg.1': 'ै', 'du.3': 'ेताम्', 'du.2': 'ेथाम्', 'du.1': 'ावहै', 'pl.3': 'न्ताम्', 'pl.2': 'ध्वम्', 'pl.1': 'ामहै'},
        'lin_par': {'sg.3': 'ेत्', 'sg.2': 'ेः', 'sg.1': 'ेयम्', 'du.3': 'ेताम्', 'du.2': 'ेतम्', 'du.1': 'ेव', 'pl.3': 'ेयुः', 'pl.2': 'ेत', 'pl.1': 'ेम'},
        'lin_atm': {'sg.3': 'ेत', 'sg.2': 'ेथाः', 'sg.1': 'ेय', 'du.3': 'ेयाताम्', 'du.2': 'ेयाथाम्', 'du.1': 'ेवहि', 'pl.3': 'ेरन्', 'pl.2': 'ेध्वम्', 'pl.1': 'ेमहि'},
    }
    var that = this;
    var terms = ends[flex.lapada][flex.key].split('-');
    _.each(terms, function(term) {
        if (term.length > flex.flex.length) return; // -ti, -nti - lat_par
        if (u.endWith(flex.query, term)) first.call(that, flex, term);
    });
}

function first(flex, term) {
    var that = this;
    var re = new RegExp(term + '$');
    var stem = flex.query.replace(re, '');
    var stemti = [stem, 'ति'].join(''); // nI, vfD - в тесте -ti, в словаре -te
    var stemte = [stem, 'ते'].join('');
    // FIXME: после того, как разберусь со словарем, можно добавлять -ti,-te - но не здесь, а общий метод в more_results..., перед CouchDB
    var cflex = _.clone(flex);
    cflex.flex = term;
    cflex.stem = stem;
    cflex.stems = [];
    cflex.stems.push(stemti);
    cflex.stems.push(stemte);
    // if (flex.pada == 'par') {
    //     flex.stems.push(stemti);
    // } else if (flex.pada == 'atm') {
    //     flex.stems.push(stemte);
    // }
    // u.p(cflex, '1');
    u.suffixes.call(that, cflex, 1);
}

// var ends_templ = {
//     'lat_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lat_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lan_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lan_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lot_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lot_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lit_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lit_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lin_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
//     'lin_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
// }

function filterTwo(flex) {
    // u.p(flex);
    var that = this;
    var stem = flex.stem;
    var stem_I = stem.replace(/ि$/,Const.virama); // .replace(/ी$/, Const.virama); //
    var dhatus;
    if (stem == stem_I) {
        var query = [stem, flex.flex].join('');
        dhatus = sandhi.del(query, flex.flex, flex.cflex);
    } else {
        dhatus = [stem_I];
    }
    var agunas = [stem];
    _.each(dhatus, function(dhatu) {
        agunas.push(u.aguna(dhatu));
    });
    agunas = _.uniq(_.flatten(agunas));
    // log('=two-dhatus=', agunas, flex.key);
    var cflex = _.clone(flex);
    cflex.dhatus = agunas;
    u.suffixes.call(that, cflex, 2);
}

// function gostop(flex, terminations) {
//     var restricted = true;
//     _.each(terminations, function(s) {
//         if (flex.query.substr(-s.length) === s) restricted = false;
//     });
//     //log('R', flex.lapada, flex.key, 'term', terminations, terminations.length, flex.query.substr(-terminations.length),  'q', flex.query,  restricted);
//     return restricted;
// }

function filterFive(flex) {
    // dhatu; no-nu; su-class, W.697.A
    var ends = {
        'lat_par': {'sg.3': 'ोति', 'sg.2': 'ोषि', 'sg.1': 'ोमि', 'du.3': 'ुतः', 'du.2': 'ुथः', 'du.1': '्वः-ुवः', 'pl.3': '्वन्ति-ुवन्ति', 'pl.2': 'ुथ', 'pl.1': '्मः-ुमः'},
        'lat_atm': {'sg.3': 'ुते', 'sg.2': 'ुषे', 'sg.1': '्वे-ुवे', 'du.3': '्वाते-ुवाते', 'du.2': '्वाथे-ुवाथे', 'du.1': '्वहे-ुवहे', 'pl.3': '्वते-ुवते', 'pl.2': 'ुध्वे', 'pl.1': '्महे-ुमहे'},
        'lan_par': {'sg.3': 'ोत्', 'sg.2': 'ोः', 'sg.1': 'वम्', 'du.3': 'ुताम्', 'du.2': 'ुतम्', 'du.1': '्व-ुव', 'pl.3': '्वन्-ुवन्', 'pl.2': 'ुत', 'pl.1': '्म-ुम'},
        'lan_atm': {'sg.3': 'ुत', 'sg.2': 'ुथाः', 'sg.1': '्वि-ुवि', 'du.3': '्वाताम्-ुवाताम्', 'du.2': '्वाथाम्-ुवाथाम्', 'du.1': '्वहि-ुवहि', 'pl.3': '्वत-ुवत', 'pl.2': 'ुध्वम्', 'pl.1': '्महि-ुमहि'},
        'lot_par': {'sg.3': '', 'sg.2': 'नुहि-धि', 'sg.1': 'वानि', 'du.3': 'ुताम्', 'du.2': 'ुतम्', 'du.1': 'वाव', 'pl.3': '्वन्तु-ुवन्तु', 'pl.2': 'ुत', 'pl.1': 'वाम'},
        'lot_atm': {'sg.3': 'ुताम्', 'sg.2': 'ुष्व', 'sg.1': 'वै', 'du.3': '्वाताम्-ुवाताम्', 'du.2': '्वाथाम्-ुवाथाम्', 'du.1': 'वावहै', 'pl.3': '्वताम्-ुवताम्', 'pl.2': 'ुध्वम्', 'pl.1': 'वामहै'},
        'lin_par': {'sg.3': 'ुयात्', 'sg.2': 'ुयाः', 'sg.1': 'ुयाम्', 'du.3': 'ुयाताम्', 'du.2': 'ुयातम्', 'du.1': 'ुयाव', 'pl.3': 'ुयुः', 'pl.2': 'ुयात', 'pl.1': 'ुयाम'},
        'lin_atm': {'sg.3': '्वीत-ुवीत', 'sg.2': '्वीथाः-ुवीथाः', 'sg.1': '्वीय-ुवीय', 'du.3': '्वीयाताम्-ुवीयाताम्', 'du.2': '्वीयाथाम्-ुवीयाथाम्', 'du.1': '्वीवहि-ुवीवहि', 'pl.3': '्वीरन्-ुवीरन्', 'pl.2': '्वीध्वम्-ुवीध्वम्', 'pl.1': '्वीमहि-ुवीमहि'},
    }
    var that = this;
    var terms = ends[flex.lapada][flex.key].split('-');
    _.each(terms, function(term) {
        if (u.endWith(flex.query, term)) five.call(that, flex, term);
    });

}

function five(flex, term) {
    var that = this;
    var dhatus = [];

    var stem = u.replaceEnd(flex.query, term);
    if (stem == flex.query) return;
    var last, excep;
    var cflex = _.clone(flex);
    cflex.flex = term;
    cflex.stem = stem;
    var stem8 = u.addVirama(stem);

    if (u.isIN(Const.eightExcep, stem8)) {
        eight.call(that, cflex, stem8);
        return;
    }

    last = stem.slice(-1);
    dhatus = sandhi.del(stem, last, 'न');
    cflex.dhatus = [];
    _.each(dhatus, function(dhatu) {
        cflex.dhatus.push(dhatu);
        excep = Const.redupExcep[dhatu];
        if (excep) cflex.dhatus.push(excep);
        // log('=excep=', cflex.key, 'stem', stem, 'ex', excep);
    });
    // log('=five-dhatus=', cflex.dhatus, cflex.key, 'stem', stem, 'ex', excep);
    u.suffixes.call(that, cflex, 5);
}

function eight(flex, stem) {
    // u.p(flex, 8);
    var cflex = _.clone(flex);
    cflex.stem = stem;
    var dhatus = [stem];
    excep = Const.redupExcep[stem];
    if (excep) dhatus.push(excep);
    cflex.dhatus = dhatus;
    u.suffixes.call(this, cflex, 8);
}

function filterSeven(flex) {
    // CVनC or CVन्C; seventh or ruD-class. W.683
    var ends = {
        'lat_par': {'sg.3': 'धि-ति-ढि-टि', 'sg.2': 'सि-षि', 'sg.1': 'मि', 'du.3': 'धः-तः-टः-ढः', 'du.2': 'धः-थः-ठः-ढः', 'du.1': 'वः', 'pl.3': 'न्ति', 'pl.2': 'ध-थ-ठ-ढ', 'pl.1': 'मः'},
        'lat_atm': {'sg.3': 'धे-ते-ढे', 'sg.2': 'से-षे', 'sg.1': 'े', 'du.3': 'ाते', 'du.2': 'ाथे', 'du.1': 'वहे', 'pl.3': 'ते', 'pl.2': 'ध्वे', 'pl.1': 'महे'},

        'lan_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
        'lan_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
        'lot_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
        'lot_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
        'lit_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
        'lit_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
        'lin_par': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
        'lin_atm': {'sg.3': '', 'sg.2': '', 'sg.1': '', 'du.3': '', 'du.2': '', 'du.1': '', 'pl.3': '', 'pl.2': '', 'pl.1': ''},
    }
    var terms = ends[flex.lapada][flex.key].split('-');
    // if (gostop(flex, terms)) return;
    var that = this;
    // тут красота, lat_atm_pl.3 добавляет вираму по flex.vow и тем отличается от sg.1, хотя фильтр совпадает ruD - runDate
    _.each(terms, function(term) {
        if (u.endWith(flex.query, term)) seven.call(that, flex, term);
    });

}

function seven(flex, term) {
    var that = this;
    var cflex = _.clone(flex);
    cflex.flex = term;
    cflex.stem = u.replaceEnd(flex.query, term);

    var stems = sandhi.del(cflex.query, cflex.flex, cflex.cflex);
    // var dhatus = _.map(stems, function(stem) { return stem.replace(/न्?(..?)/, '$1').replace(/ङ्?(..?)/, '$1').replace(/ण्?(..?)/, '$1').replace(/ञ्?(..?)/, '$1').replace(/ं(..?)/, '$1') });
    var dhatus = _.map(stems, function(stem) { return stem.replace(/न्?(..?)$/, '$1').replace(/ङ्?(..?)$/, '$1').replace(/ण्?(..?)$/, '$1').replace(/ञ्?(..?)$/, '$1').replace(/ं(..?)$/, '$1') });
    if (cflex.vow) dhatus = _.compact(_.map(dhatus, function(dhatu) { return u.addVirama(dhatu)}));

    cflex.dhatus = dhatus;
    u.suffixes.call(that, cflex, 7);
}

// g.9 - // var dhatu = dhatuFromFilter(flex, terms);
// function dhatuFromFilter(flex, terminations) {
//     var dhatu = flex.query;
//     _.each(terminations, function(stp) {
//         var re = new RegExp(stp + '$');
//         dhatu = dhatu.replace(re, '');
//     });
//     return dhatu;
// }

function filterNine(flex) {
    // nA-nI; ninth or krI-class
    var ends = {
        'lat_par': {'sg.3': 'ाति', 'sg.2': 'ासि', 'sg.1': 'ामि', 'du.3': 'ीतः', 'du.2': 'ीथः', 'du.1': 'ीवः', 'pl.3': 'न्ति', 'pl.2': 'ीथ', 'pl.1': 'ीमः'},
        'lat_atm': {'sg.3': 'ीते', 'sg.2': 'ीषे', 'sg.1': 'े', 'du.3': 'ाते', 'du.2': 'ाथे', 'du.1': 'ीवहे', 'pl.3': 'ते', 'pl.2': 'ीध्वे', 'pl.1': 'ीमहे'},
        'lan_par': {'sg.3': 'ात्', 'sg.2': 'ाः', 'sg.1': 'ाम्', 'du.3': 'ीताम्', 'du.2': 'ीतम्', 'du.1': 'ीव', 'pl.3': 'न्', 'pl.2': 'ीत', 'pl.1': 'ीम'},
        'lan_atm': {'sg.3': 'ीत', 'sg.2': 'ीथाः', 'sg.1': 'ि', 'du.3': 'ाताम्', 'du.2': 'ाथाम्', 'du.1': 'ीवहि', 'pl.3': 'त', 'pl.2': 'ीध्वम्', 'pl.1': 'ीमहि'},
        'lot_par': {'sg.3': 'ातु', 'sg.2': 'ीहि', 'sg.1': 'ानि', 'du.3': 'ीताम्', 'du.2': 'ीतम्', 'du.1': 'ाव', 'pl.3': 'न्तु', 'pl.2': 'ीत', 'pl.1': 'ाम'},
        'lot_atm': {'sg.3': 'ीताम्', 'sg.2': 'ीष्व', 'sg.1': 'ै', 'du.3': 'ाताम्', 'du.2': 'ाथाम्', 'du.1': 'ावहै', 'pl.3': 'ताम्', 'pl.2': 'ीध्वम्', 'pl.1': 'ामहै'},
        'lin_par': {'sg.3': 'ीयात्', 'sg.2': 'ीयाः', 'sg.1': 'ीयाम्', 'du.3': 'ीयाताम्', 'du.2': 'ीयातम्', 'du.1': 'ीयाव', 'pl.3': 'ीयुः', 'pl.2': 'ीयात', 'pl.1': 'ीयाम'},
        'lin_atm': {'sg.3': 'ीत', 'sg.2': 'ीथाः', 'sg.1': 'ीय', 'du.3': 'ीयाताम्', 'du.2': 'ीयाथाम्', 'du.1': 'ीवहि', 'pl.3': 'ीरन्', 'pl.2': 'ीध्वम्', 'pl.1': 'ीमहि'},
    }
    var terms = ends[flex.lapada][flex.key].split('-');
    var that = this;
    _.each(terms, function(term) {
        if (u.endWith(flex.query, term)) nine.call(that, flex, term);
    });
}

function nine(flex, term) {
    // u.p(flex, 9);
    var that = this;
    var stem = u.replaceEnd(flex.query, term);
    var dhatu = stem.replace(/न$|ण$/,'');
    if (dhatu == stem) return;

    flex.dhatus = [dhatu];
    if (/ु/.test(dhatu)) { // nine_lat_atm_pU_sg.3 -> punIte
        flex.dhatus.push(dhatu.replace('ु','ू'));
    }
    u.suffixes.call(that, flex, 9);
}

// function log() { console.log.apply(console, arguments) }

// function isNumber(str) {
//     return (/[०-९]/.test(str)) ? true : false;
// }


/*
  lat - present
  lan - imperfect
  lot - imperative
  lit - perfect

  lin - potential
  rut - 2 future
  lut - 1 future
  lun - aorist

*/
