// преобразование файла tins-окончаний в readable form

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

// FIXME: унести в util
var npmap = {'0': 'sg.3', '1': 'du.3', '2': 'pl.3', '3': 'sg.2', '4': 'du.2', '5': 'pl.2', '6': 'sg.1', '7': 'du.1', '8': 'pl.1' }; // num-per

var dirtyTins = '../lib/tins';
var dataPath = path.join(__dirname, dirtyTins);

var lakaras = require(dataPath);

var terms = [];
var term;


for (var la in lakaras) {
    log(la);
    var padas = lakaras[la];
    for (var pada in padas) {
        var tins = padas[pada];
        log(pada, tins);
        tins.forEach(function(tin2, idx) {
            var tarr = tin2.split('-');
            tarr.forEach(function(tin) {
                var term = {};
                term[tin] = {la: la, pada: pada, np: npmap[idx]};
                log(term);
            });
        });

    }
}

//{'त्': { gana, pada, thema, } }
