// одноразовый файл
// читает /lib/uohyd_dump.js, создает /lib/dhatu_anga.js - файл всех dhatu cо всеми стемами
// в зависимости от gana - образует stem или пару strong-weak

var fs = require('fs');
var util = require('util');
var _ = require('underscore');
// var slp = require('../sandhi/slp');
var path = require('path');
var salita = require('salita-component');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;

var dumpPath = path.join(__dirname, '../lib/uohyd_dump.js');
var dhatuPath = path.join(__dirname, '../lib/dhatu_anga.js');
var tinsPath = path.join(__dirname, '../lib/tins_cache.js');

var verbs = require(dumpPath);
var tins = require(tinsPath);
var nmap = {'0': 'sg', '1': 'du', '2': 'pl'};
var filter = require('../lib/filterGana');

// вычитаю -tins, собираю stems - д.б. ровно один stem для gana=1, la=law
// нужно прогнать все глаголы для всех gana-lakara


if (tins.length == 0) {
    log('/lib/tins_cache should have some values !');
    return;
}

var angas = [];

verbs.forEach(function(verb) {
    var gana = verb.gana;
    if (gana != 1) return;
    // p(verb.dhatu);
    var aaa = filter.gana(gana);
    // angas[verb.dhatu] = {strong: [], weak: []};
    for (var pada in verb.la) {
        log('pada:', pada);
        var lakaras = verb.la[pada];
        for (var la in lakaras) {
            if (la != 'लट्') continue;
            var numbers = lakaras[la];
            log('la:', la);

            var stems = []; // это для A:
            var strongs = [];
            var weaks = [];
            for (var number in numbers) {
                // log('N', number);
                var forms = numbers[number];
                forms.forEach(function(form, idx) {
                    var purusha = nmap[idx.toString()];
                    // log('P', purusha);
                    var numper = [purusha, number].join('.');
                    // log(pada, numper, form);

                    var oStem = stemForForm(form, gana, la, pada, numper);
                    var stem = oStem.stem;
                    // FIXME:
                    if (gana == 1) stems.push(stem);
                    else //;
                    if (number == '1') strongs.push(stem);
                    else weaks.push(stem);
                });
            }
            var ustem = _.uniq(stems);
            var ustrong = _.uniq(strongs);
            var uweak = _.uniq(weaks);
            var errStem = ['stems:', verb.dhatu, pada, la, number, JSON.stringify(ustem)].join(' - ');
            var errStrong = ['stems:', verb.dhatu, pada, la, number, JSON.stringify(ustrong)].join(' - ');
            var errWeak = ['strong:', verb.dhatu, pada, la, number, JSON.stringify(uweak)].join(' - ');
            if (ustem.length > 1) throw new Error(errStem);
            if (ustrong.length > 1) throw new Error(errStrong);
            if (uweak.length > 1) throw new Error(errWeak);

            var result = {dhatu: verb.dhatu, gana: gana};
            if (ustem.length == 1) {
                result.stem = ustem[0];
            } else {
                result.strong = ustrong[0];
                result.weak = uweak[0];
            }
            result.key = verb.key;
            angas.push(result);
        }
    }
});

// log(tins);
log('===========');
p(angas);

// это la-pada-number из цикла, а в tins - свои
function stemForForm(form, gana, la, pada, numper) {
    var key, val;
    // tins для данных параметров - можно зафризить
    var thema = (inc([1,4,6,10], gana)) ? 'a' : 'b';
    var stins = _.select(tins, function(tin) {
        key = Object.keys(tin)[0];
        val = tin[key];
        // log('T1', val.thema, 'T2', thema);
        if (val.thema) return val.la == la && val.pada == pada && val.np == numper && val.thema == thema;
        else return val.la == la && val.pada == pada && val.np == numper;
    });
    var oStems = [];
    stins.forEach(function(tin) {
        // log(222, tin);
        var term = Object.keys(tin)[0];
        // фильтры terms, специфичные для gana-lakara - иначе придется писать всю строку дважды-многажды
        if (gana == 1) {
            if (la == 'लट्' && pada == 'atm' && numper == 'pl.3' && term != 'न्ते') return;
            else if (la == 'लट्' && pada == 'par' && numper == 'pl.3' && term != 'न्ति') return;
        }

        var re = new RegExp(term + '$');
        var stem = form.replace(re, '');
        // log('F=S', form, stem, stin);
        if (form == stem) return;

        // фильтры angas, по numper, или по -va-ma для первой ганы
        // добавить gana:
        // filter.gana(gana);
        stem = filter.gana(gana).call(this, form, gana, la, pada, numper, stem, term);
        // if ((pada == 'par' && (numper == 'sg.1' || numper == 'du.1' || numper == 'pl.1' )) || (pada == 'atm' && (numper == 'du.1' || numper == 'pl.1' ))) {
        //     var last = stem[stem.length-1];
        //     if (last != c.A) return;
        //     stem = stem.slice(0,-1);
        // }
        var oStem = {stem: stem, term: term, la: la, pada: pada, numper: numper};
        oStems.push(oStem);
    });
    var errTooMoreStems = ['too more stins:', form, pada, la, numper].join(' - ');
    if (oStems.length > 1 || oStems.length == 0) {
        log('ERR: form:', form);
        p('stins', stins);
        p('oStems', oStems);
        throw new Error(errTooMoreStems);
    }
    // log(111, oStems);
    return oStems[0];
}


/*
  нужно же вычитать tins - а это sandhi, да еще внутренние.
  в результате должно быть :
  dhatu: [{gana: 1, stem: 'xxx'}, {gana: 2, strong: 'xxx', weak: 'yyy'}]
  и так для всех dhatu
*/

// log(verbs);

// log(tins)
