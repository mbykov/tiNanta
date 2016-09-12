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

console.time("queryTime");


let forms = [form];
stemmer.query(forms, function(err, queries) {
    p(queries);
    log('qs size:', queries.length);
    console.timeEnd("queryTime");
});

// ==============
