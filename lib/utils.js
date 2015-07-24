/*
  utils for morpheus
*/

var _ = require('underscore');
var Const = require('./constants');
var util = require('util');

module.exports = utils();

function utils() {
    if (!(this instanceof utils)) return new utils();
    return this;
}

utils.prototype.suffixes = function(flex, gana, module) {
    var that = this;
    var qtype = (gana == 1) ? 'stem' :  'dhatu'; //  || gana == 4
    var qs = (qtype == 'dhatu') ? flex.dhatus : flex.stems; // FIXME: недопоправил
    _.each(qs, function(query) {
        // log('Q', gana, flex)
        var q = {pos: qtype, query: query, la: flex.la, pada: flex.pada, key: flex.key};
        q.gana = (gana == 1) ? refineFirstGana(flex) : gana;
        if (module) q.module = module;
        // log('=query-gana=', query, q);
        that.queries.push(q);
    });
}

function refineFirstGana(flex) {
    if (isIN(Const.yexcs, flex.stem)) return 1;
    var gana = 1;
    var last = flex.stem.slice(-1);
    if (last == 'य') gana = 4;
    return gana;
}

// FIXME: здесь можно убрать массив стемов
utils.prototype.qsForNaman = function(flex, module) {
    var that = this;
    _.each(flex.stems, function(stem) {
        // log('Qq', flex);
        var q = {pos: 'naman', query: stem, gend: flex.gend, key: flex.key};
        if (module) q.var = module;
        // log('QQQ', q);
        that.queries.push(q);
    });
}

// старая
utils.prototype.prefixSuffix = function(flex, gana, qtype) {
    //log('_PrSu_', this.queries.length, this.prefixes.length, flex.stems.length);
    var that = this;
    if (!qtype) qtype = 'dhatu';
    var stems = (qtype == 'dhatu') ? flex.dhatus : flex.stems;
    //log('stems', stems)
    _.each(stems, function(stem) {
        //log('PS stem', stem);
        _.each(that.prefixes, function(prefix) {
            //log('prefix', prefix.upa);
            var q = {pos: qtype, query: stem, la: flex.la, pada: flex.pada, keys: flex.keys, gana: gana};
            if (prefix.upa) {
                var re = new RegExp('^' + prefix.upa);
                var query = stem.replace(re, '');
                if (prefix.vow) query = firstLigaToVow(query);
                else if (prefix.a) query = ['अ', query].join('');
                q.query = query;
                q.upa = prefix.ukey;
                that.queries.push(q);
            }
            //log('PR-q', q.query, q.upa);
        });
    });
}

utils.prototype.firstLigaToVow = function(form) {
    var liga = form[0];
    var idx = Const.vowels.indexOf(liga);
    if (!isIN(Const.vowels, liga)) return form;
    var vow = Const.Vowels[idx];
    var re = new RegExp('^' + liga);
    // это д.б. массив, make upa g=_upa-_upA, д.б. а-краткая и а-долгая, как минимум
    return form.replace(re, vow);
}

function firstLigaToVow_(form) {
    var liga = form[0];
    var idx = Const.vowels.indexOf(liga);
    if (!isIN(Const.vowels, liga)) return form;
    var vow = Const.Vowels[idx];
    var re = new RegExp('^' + liga);
    // это д.б. массив, make upa g=_upa-_upA, д.б. а-краткая и а-долгая, как минимум
    return form.replace(re, vow);
}

utils.prototype.lapada = function(flex) {
    return [flex.la, flex.pada].join('_');
}

utils.prototype.pushUniq = function(arr, other) {
    return _.map(arr, function(object) { return !_.isEqual(object, other)});
}

utils.prototype.deepUniq = function(arr) {
    var strs = _.uniq( _.map( arr, function( obj ){
        return JSON.stringify( obj );
    }));
    return _.map(strs, function(str) { return JSON.parse(str)});
}

function pushUniq(arr, obj) {
    var str = JSON.stringify(obj);
    var exists = false;
    exists = _.find(arr, function(q) { return (JSON.stringify(q) == str) });
    if (!exists) arr.push(obj);
    return arr;
}


utils.prototype.endWith = function(word, query) {
    return endWith(word, query);
}

function endWith(word, query) {
    var re = new RegExp(query+'$');
    return re.test(word);
}

utils.prototype.startWith = function(word, query) {
    return startWith(word, query);
}

function startWith(word, query) {
    var re = new RegExp('^' + query);
    return re.test(word);
}

utils.prototype.replaceEnd = function(str, from, to) {
    if (!to) to = '';
    var re = new RegExp(from + '$');
    return str.replace(re, to);
}

utils.prototype.removeEnd = function(str, from) {
    var re = new RegExp(from + '$');
    return str.replace(re, '');
}

utils.prototype.end_y = function(query) {
    return (query.slice(-1) == 'य') ? true : false;
}

utils.prototype.end_u = function(query) {
    return (query.slice(-1) == 'ु') ? true : false;
}

utils.prototype.end_o = function(query) {
    return (query.slice(-1) == 'ो') ? true : false;
}

utils.prototype.end_A = function(query) {
    return (query.slice(-1) == 'ा') ? true : false;
}

utils.prototype.end_a = function(query) {
    return endWithCons(query);
}

utils.prototype.end_I = function(query) {
    return (query.slice(-1) == 'ी') ? true : false;
}

utils.prototype.endWithCons = function(query) {
    return endWithCons(query);
}

function endWithCons(query) {
    var last = query.slice(-1);
    return isIN(Const.consonants, last);
}

utils.prototype.endWithVowel = function(query) {
    return endWithVowel(query);
}

function endWithVowel(query) {
    var last = query.slice(-1);
    return isIN(Const.vowels, last);
}

utils.prototype.isIN = function(arr, item) {
    return isIN(arr, item);
}

function isIN(arr, item) {
    return (arr.indexOf(item) > -1) ? true : false;
}

utils.prototype.conform = function(arr, str) {
    var ok = false;
    _.each(arr, function(term) {
        if (endWith(str, term)) {
            ok = true;
        }
    });
    return ok;
}

utils.prototype.onlyCons = function(str) {
    var arr = _.difference(str.split(''), Const.vowels.concat(Const.Vowels));
    return _.without(arr, Const.virama);
}

utils.prototype.onlyVowels = function(str) {
    return onlyVowels(str);
}

utils.prototype.firstVowel = function(str) {
    var vowels = onlyVowels(str);
    return vowels[0];
}

utils.prototype.empty = function(arr) {
    return (arr.length == 0) ? true : false;
}

function onlyVowels(str) {
    var arr = _.difference(str.split(''), Const.consonants);
    return _.without(arr, Const.virama);
}

utils.prototype.ultima = function(stem) {
    var clean = stem.replace(/्$/, '');
    return (clean == stem) ? stem.slice(-1) : clean.slice(-1);
}

utils.prototype.weakVow = function(letter) {
    var results = [letter];
    var shrt = Const.longshort[letter];
    if (!shrt) return results;
    results.push(shrt);
    return results;
}

utils.prototype.aguna = function(str) {
    // returns both: source and aguna, if any
    // получается перебор всех вариантов от вриддхи - сначала гуна, потом простая гласная. От гуны - только гласная
    var results = [str];
    var aguna;
    // TODO: - а если заменится не первая гласная? А что, нужна обязательно первая?
    var gunas = _.keys(Const.agunaNEW);
    _.each(gunas, function(g) {
        var agunas = Const.agunaNEW[g];
        _.each(agunas, function(a) {
            aguna = str.replace(g, a);
            if (str == aguna) return;
            results.push(aguna);
        });
    });
    for (var lng in Const.longshort) {
        var shrt = Const.longshort[lng];
        var shrtStr = str.replace(lng, shrt);
        if (str == shrtStr) continue;
        results.push(shrtStr);
    }
    // var longs = _.keys(Const.longshort);
    // _.each(longs, function(l) {
    //     var sh = Const.longshort[l];
    //     var shrt = str.replace(l, sh);
    //     if (str == shrt) return;
    //     results.push(shrt);
    // });
    return results;
}

utils.prototype.sandhilike_n = function(stem) {
    var that = {results: []};
    slike.call(that, stem, 'न्न', 'द्');
    slike.call(that, stem, 'ण्ण', 'द्');
    slike.call(that, stem, 'ण', 'व्');
    slike.call(that, stem, 'ान', 'ा');
    slike.call(that, stem, 'ान', 'ै');
    slike.call(that, stem, 'न', '');
    return that.results;
}

function slike(stem, from, to) {
    var re = new RegExp(from + '$');
    var nstem = stem.replace(re, to);
    //log('slike', stem, nstem)
    if (stem != nstem) this.results.push(nstem);
}

utils.prototype.excepStr = function(str, type) {
    var results = [str];
    var excepstr = null;
    if (type == 'dhatu') {
        excepstr = Const.weakDhatu[str];
    } else {
        excepstr = Const.weakNama[str];
    }
    //log('weak STR', excepstr);
    if (excepstr) {
        var exceps = excepstr.split('-');
        results = results.concat(exceps);
    }
    var excep;
    if (/.ा.+/.test(str)) { // BUG: /.e.+/.test('qwerty') - true ?
        excep = str.replace('ा', '');
        results.push(excep);
    } else if (/ा$/.test(str)) {
        excep = str.replace(/ा$/, 'ै');
        results.push(excep);
    } else if (/यि$/.test(str)) {
        excep = str.replace(/यि$/, Const.virama);
        results.push(excep);
    } else if (/य्$/.test(str)) {
        excep = str.replace(/य्$/, 'ी');
        results.push(excep);
    } else if (/ि$/.test(str)) {
        excep = str.replace(/ि$/, Const.virama);
        results.push(excep);
    } else {
    }
    //िपयि  यि

    // vars of a first letter
    if (/^आ/.test(str)) {
        excep = str.replace(/^आ/, 'अ');
        results.push(excep);
    } else if (/^ध/.test(str)) {
        excep = str.replace(/^ध/, 'द');
        results.push(excep);
    }
    return results;
}

utils.prototype.anit = function(stem) {
    var dhatus = [];
    var anit = stem.replace(/त$/, '');
    var istem = stem.replace(/ित$/, Const.virama);
    var yistem = istem.replace(/य्$/, Const.virama).replace(/य$/, Const.virama);
    dhatus = [anit, istem, yistem];
    return _.uniq(dhatus);
}

utils.prototype.addVirama = function(stem) {
    var result = (endWithCons(stem)) ? [stem, Const.virama].join('') : stem;
    return result;
}

utils.prototype.delFlex = function(flex) {
    var re = new RegExp(flex.flex + '$');
    var stem = flex.query.replace(re, '');
    if (flex.query == stem) return stem;
    // flex with full vowel at the beginning
    if (flex.vow && endWithCons(stem)) {
        stem = [stem, Const.virama].join('');
    } else if (flex.vow && stem.slice(-1) == Const.A) {
        stem = stem.replace(/ा$/,Const.virama);
        // log('Stem-A', stem, flex.key);
    }
    return stem;
}

utils.prototype.sandhi = function(stem, first) {
    if (!stem) return false;
    var stems = [stem];
    var clean = stem.replace(/्$/, ''); // w/o virama
    var last = clean.slice(-1);
    var vars = [];
    var term;
    switch (first) {
    case 'त':
        stems = sandhiStems(stem, Const.sandhi_t);
        break;
    case 'ट':
        stems = sandhiStems(stem, Const.sandhi_w);
        break;
    case 'ध':
        stems = sandhiStems(stem, Const.sandhi_D);
        var stem_asp = aspiratedStems(stem);
        stems = stems.concat(stem_asp);
        break;
    case 'व':
        stems = sandhiStems(stem, Const.sandhi_v);
        break;
    }
    return stems;
}

function aspiratedStems(stem) {
    var stems = [];
    var stem;
    _.each(Const.voiced, function(cons, idx) {
        var consv = [cons, Const.virama].join('');
        if (!endWith(stem, consv)) return;
        //log('S', stem, cons, idx, Const.voiced, Const.voiced_asp)
        var aspv = [Const.voiced_asp[idx], Const.virama].join('');
        //log('S', stem, consv, aspv, idx)
        stem = stem.replace(consv, aspv);
        stems.push(stem);
    });
    return stems;
}

function sandhiStems(stem, sandhi) {
    var term;
    var vars = [];
    var stems = [stem];
    for (var key in sandhi) {
        if (key == '') continue;
        //log('--key--', key, sandhi[key], stem);
        if (!endWith(stem, key)) continue;
        term = key;
        vars = sandhi[key];
    }
    _.each(vars, function(v) {
        stems.push(stem.replace(term, v));
    });
    //log('==', term, vars, stems);
    return stems;
}

// utils.prototype.u = function() {
//     log()
// }

function log() { console.log.apply(console, arguments) }

utils.prototype.u = function() {
    var v = _.values(arguments);
    console.log(util.inspect(v, showHidden=false, depth=null, colorize=true));
}

utils.prototype.p = function(flex, title) {
    var obj;
    if (!title) title = '';
    if (flex.la) {
        obj = {la: flex.la, pada: flex.pada, key: flex.key, keys: flex.keys, flex: flex.flex, flex: flex.flex, aug: flex.aug, inf: flex.inf, stem: flex.stem, dhatu: flex.dhatu, vow: flex.vow, a: flex.a, stems: flex.stems, dhatus: flex.dhatus};
    } else if (flex.gend) {
        obj = {pos: flex.pos, gend: flex.gend, var: flex.var, key: flex.key, flex: flex.flex, stem: flex.stem, stems: flex.stems};
    } else {
        obj = flex;
    }
    console.log(title.toString(), JSON.stringify(obj).split('"').join('').split(',').join(', '));
}

utils.prototype.startWithVowel = function(query) {
    var first = query[0];
    return isIN(Const.Vowels, first);
}

utils.prototype.startWithCons = function(query) {
    var first = query[0];
    return isIN(Const.consonants, first);
}

function ulog (obj) {
    console.log(util.inspect(obj, showHidden=false, depth=null, colorize=true));
}
