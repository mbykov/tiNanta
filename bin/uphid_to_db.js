//
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

// var uohid_dumps = '../Junk';
var uohid_dumps = '../lib/Dump-uohid';
var dataPath = path.join(__dirname, uohid_dumps);

// to save in db:
var docs = {};

readDir(dataPath);

function readDir(dataPath) {
    var fns  = fs.readdirSync(dataPath);
    fns.forEach(function(fn) {
        if (fn != 'vid-jYAne-adAdiH-1625.txt') return;
        var fpath = [dataPath, fn].join('/');
        log('F', fpath);
        var doc = parseFile(fpath);
    });
}

function parseFile(dataPath) {
    var rows = fs.readFileSync(dataPath).toString().split('\n');
    var params = [];
    var pada;
    var doc = {};
    // var docs = [];
    var lakara;
    rows.forEach(function(row, idx) {
        // if (idx > 15) return;
        // распарсить хидер
        row = row.trim();
        if (row == '') return;
        row = row.replace(/-/g, '');
        row = row.replace(/\s+/g, ' ');
        row = row.trim();
        if (row == '') return;

        if (pada == 'परस्मै' && row == 'लट्') pada = 'आत्मने';
        else if (row == 'लट्') pada = 'परस्मै';
        if (!pada) return;
        if (!doc[pada]) doc[pada]= {};

        var arr = row.split(' ');
        // var head = arr[0];
        if (arr.length == 1) lakara = row;

        var head = arr.shift();
        if (arr.length == 2 && head == 'एकवचनम्') return;
        else if (arr.length == 3) {
            if (!doc[pada][lakara]) doc[pada][lakara] = {};
            doc[pada][lakara][head] = arr;
        }

        if (idx < 35) log('R', idx, row);
    });
    p('D', doc);
}
