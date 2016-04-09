/*
  node morph.js eva
*/

var lat = process.argv.slice(2)[0] || false;

var _ = require('underscore');
var util = require('util');
var salita = require('salita-component');

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

log('morpheus querying...', lat, form);

var queries = stemmer.query(form);

log('============= RESULT-STEMS: ============');
p(queries);
log('qs size:', queries.length);
