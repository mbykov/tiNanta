/*
  node run.js eva
*/

var lat = process.argv.slice(2)[0] || false;
var find = process.argv.slice(3)[0] || false;

var _ = require('underscore');
var util = require('util');
var salita = require('salita-component');

var path = require('path');
var fs = require('fs');

var stemmer = require('./index');
var s = require('sandhi');
// var c = s.const;
var u = s.u;
// var sandhi = s.sandhi;
var log = u.log;
var p = u.p;

if (!lat) return log('?');

var form;
if (/[a-zA-Z0-1]/.test(lat[0])) {
    form = salita.slp2sa(lat);
} else {
    form = lat;
    lat = salita.sa2slp(form);
}

if (find) log('stemmer find:', lat, form); // लोकृ्-लोक् // लोचृ्-लोच्// प्-पा
else log('stemmer parse:', lat, form);

var dhatuAngaPath = path.join(__dirname, './lib/dhatu_anga_cache.txt');
var dhatuAngas = fs.readFileSync(dhatuAngaPath).toString().split('\n');
var das = [];
var odhatu, ostem, ogana, ola, opada, otvar, otips;
dhatuAngas.forEach(function(da) {
    if (da == '') return;
    [odhatu, ostem, ogana, ola, opada, otvar, otips] = da.split('-');
    das.push({dhatu: odhatu, stem: ostem, gana: ogana, la: ola, pada: opada, tvar: otvar, tips:otips});
});

var tinsPath = path.join(__dirname, './lib/tins_cache.js');
var ctins = fs.readFileSync(tinsPath).toString().split('\n');
var tins = [];
var tip, tin, size, gana, la, pada, tvar;
ctins.forEach(function(ctin) {
    if (ctin == '') return;
    [tip, tin, size, gana, la, pada, tvar] = ctin.split('-');
    tins.push({tip: tip, tin: tin, size: size, gana: gana, la: la, pada: pada, tvar: tvar});
});

log('DAS', dhatuAngas.length, _.uniq(dhatuAngas).length);

// log('TINS', stemmer.tins.length);

console.time("queryTime");

var queries;
if (!find) queries = stemmer.query(form, tins, das);
else queries = stemmer.parse(form);

// ==============
p(queries);
log('qs size:', queries.length);

console.timeEnd("queryTime");
