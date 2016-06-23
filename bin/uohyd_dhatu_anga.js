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

verbs.forEach(function(verb) {
    if (verb.gana != 1) return;
    // p(verb.dhatu);
    for (var pada in verb.la) {
        log(pada);
        var lakaras = verb.la[pada];
        for (var la in lakaras) {
            if (la != 'लट्') continue;
            var numbers = lakaras[la];
            log(la);
            for (var number in numbers) {
                var forms = numbers[number];
                forms.forEach(function(form, idx) {
                    var purusha = nmap[idx.toString()];
                    var numper = [number, purusha].join('.');
                    log(numper, form);
                });
            }
        }
    }
});

// log(tins);
function selectTins(la, pada) {
    //
}


/*
  нужно же вычитать tins - а это sandhi, да еще внутренние.
  в результате должно быть :
  dhatu: [{gana: 1, stem: 'xxx'}, {gana: 2, strong: 'xxx', weak: 'yyy'}]
  и так для всех dhatu
*/

// log(verbs);
