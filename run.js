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
if (/[a-zA-Z]/.test(lat[0])) {
    form = salita.slp2sa(lat);
} else {
    form = lat;
    lat = salita.sa2slp(form);
}

if (find) log('stemmer find:', lat, form); // लोकृ्-लोक् // लोचृ्-लोच्// प्-पा
else log('stemmer parse:', lat, form);

var dhatuAngaPath = path.join(__dirname, './lib/dhatu_anga_cache.txt');
var das = fs.readFileSync(dhatuAngaPath).toString().split('\n');

var tinsPath = path.join(__dirname, './lib/tins_cache.js');
var ctins = fs.readFileSync(tinsPath).toString().split('\n');

// var dhatupathaPath = path.join(__dirname, './lib/dhatupatha_cache.txt');
// var dhpths = fs.readFileSync(dhatupathaPath).toString().split('\n');
// // अ॑हिँ॒-अहि-अंह्-भ्वा-आ-सेट्-01-0722
// var dp, adp;
// var dps = dhpths.map(function(row) {
//     if (!row || row == '') return;
//     adp = row.split('-');
//     dp = {dhatu: adp[2], pada: adp[4], gana: adp[6], num: adp[7]}; // dp: adp[0], raw: adp[1],
//     // if (!dp.raw) log('NN', row, dp);
//     return dp;
// });
// dps = _.compact(dps);



var queries;
if (!find) queries = stemmer.query(form, ctins, das);
else queries = stemmer.parse(form);

// log('============= RESULT-STEMS: ============');
p(queries);
log('qs size:', queries.length);
