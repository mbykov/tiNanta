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

// вычитаю -tins, собираю stems - д.б. ровно один stem для gana=1, la=law
// нужно прогнать все глаголы для всех gana-lakara

var stems = {};

verbs.forEach(function(verb) {
    if (verb.gana != 1) return;
    // p(verb.dhatu);
    stems[verb.dhatu] = {strong: [], weak: []}; // <<===
    for (var pada in verb.la) {
        log(pada);
        var lakaras = verb.la[pada];
        for (var la in lakaras) {
            if (la != 'लट्') continue;
            var numbers = lakaras[la];
            log(la);
            var strongs = [];
            var weaks = [];
            for (var number in numbers) {
                // log('N', number);
                var forms = numbers[number];
                forms.forEach(function(form, idx) {
                    var purusha = nmap[idx.toString()];
                    log('P', purusha);
                    var numper = [purusha, number].join('.');
                    // log(numper, form);
                    // log(la, pada);
                    var stins = selectTins(la, pada, numper); // можно заранне tin_for_numper
                    // log('CTINS', stins.length, stins);
                    var errTooMore = ['too more stins:', verb.dhatu, pada, la, number, numper, stins].join(' - ');
                    var stin;
                    if (stins.length > 1) throw new Error(errTooMore); // тут чудовищно:
                    else stin = stins[0];
                    // log('STIN', stin);
                    // log('TERM', Object.keys(stin));
                    var term = Object.keys(stin)[0];
                    var errNoStem = ['no stem:', verb.dhatu, pada, la, number, numper, term].join(' - ');
                    var re = new RegExp(term + '$');
                    var stem = form.replace(re, '');
                    // log('F=S', form, stem, stin);
                    if (form == stem) throw new Error(errNoStem);
                    if (number == '1') strongs.push(stem);
                    else weaks.push(stem);
                    // var result = {};
                    // result[numper] = [stem, term];
                    // stems[verb.dhatu].push(result);
                });
            }
            var errStrong = ['strong:', verb.dhatu, pada, la, number].join(' - ');
            var errWeak = ['strong:', verb.dhatu, pada, la, number].join(' - ');
            var ustrong = _.uniq(strongs);
            var uweak = _.uniq(weaks);
            if (ustrong.length > 1) throw new Error(errStrong);
            if (uweak.length > 1) throw new Error(errWeak);
            stems[verb.dhatu] = {strong: ustrong[0], weak: uweak[0]};
        }
    }
});

// log(tins);
log('===========');
p(stems);

function selectTins(la, pada, numper) {
    var key, val;
    return _.select(tins, function(tin) {
        key = Object.keys(tin)[0];
        val = tin[key];
        return val.la == la && val.pada == pada && val.np == numper;
    });
}


/*
  нужно же вычитать tins - а это sandhi, да еще внутренние.
  в результате должно быть :
  dhatu: [{gana: 1, stem: 'xxx'}, {gana: 2, strong: 'xxx', weak: 'yyy'}]
  и так для всех dhatu
  чудовищно: нужно вычесть все tins, образовать stem
  stems - сгруппировать по numper,
  в группе выбрать min, остальные отбросить
*/

// log(verbs);
