//

var fs = require('fs');
var util = require('util');
var _ = require('underscore');
// var slp = require('../sandhi/slp');
var path = require('path');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;
var salita = require('salita-component');

var dataPath = path.join(__dirname, '../uohyd/drpatel/generatedverbforms_deva20062016.csv');
var dhatuPathaCachePath = path.join(__dirname, '../lib/dhatu_list_cache.txt');

var tinsPath = path.join(__dirname, '../lib/uohyd_tins_cache.js');
var dhatuAngaPath = path.join(__dirname, '../lib/uohyd_dhatu_anga_cache.js');
var testsPath = path.join(__dirname, '../test/uohyd_tests_cache.txt');

// fs.unlinkSync(dhatuPathaCachePath);

var list_logger = fs.createWriteStream(dhatuPathaCachePath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});

function formsRun(rows) {
    var listForms = fs.readFileSync(dataPath).toString().split('\n');
    var key;
    var form, dhatu, la, tip, nums;
    var check = {};
    var nests = [];
    var nest, doc, line;
    var gana;
    // आंसयत्,अंस,लङ्,तिप्,10.0460
    listForms.forEach(function(row, idz) {
        if (idz > 200) return;
        [form, dhatu, la, tip, nums] = row.split(',');
        key = [dhatu, nums].join('-');
        line = {form: form, la: la, tip: tip};
        if (!check[key]) {
            check[key] = true;
            gana = nums.split('.')[0];
            log('D', dhatu, 'NUM', nums, gana);
            if (nest) parseNest(nest, gana);
            nest = [line];
        } else {
            nest.push(line);
        }
    });
}

function parseNest(nest, gana) {
    var check = {};
    var las = [];
    var la, prev;
    var lanest;
    nest.forEach(function(line) {
        prev = la;
        la = line.la;
        if (!check[la]) {
            check[la] = true;
            if (lanest) {
                // log('LA====', line.la, prev);
                las.push({la: prev, nest: lanest});
                parseLa(prev, lanest, gana);
            }
            lanest = [line];
            prev = la;
            // log('LA', line.la, lanest);
        } else {
            lanest.push(line);
        }
    });
    // las.push({la: la, nest: lanest});
    parseLa(la, lanest);
    // p(las);
}

function parseLa(la, nest, gana) {
    if (la != 'लट्') return;
    log('la size:', la, nest.length);
    var stem, column, sym, next, next2;
    var syms = [];
    var forms = [];
    nest.forEach(function(line) { forms = forms.concat(line.form.trim().split(' '))});
    var idx = 0;
    while(idx < 15) {
        column = forms.map(function(form) { //
            sym = form[idx];
            next = form[idx+1];
            next2 = form[idx+2];
            return sym;
        });
        var uniq = _.uniq(column);
        if (uniq.length > 1) break;
        syms.push(uniq[0]);
        idx++;
    };
    stem = syms.join('');
    log('la:', la, 'st:', stem, 'g:', gana);
    // nest.forEach(function(line) {
    //     log(line);
    // });
}

formsRun();
