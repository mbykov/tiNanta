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
// var dru = require('../lib/mahavriksha');
var salita = require('salita-component');
// var sys = require('sys');
var exec = require('child_process').exec;
var async = require('async');


// http://sanskritlibrary.org/Sanskrit/pub/lies_sl.pdf ; p.23 ; p.31 ; p.220


var uohid_links = '../lib/uohyd_dump_links.txt';
var dataPath = path.join(__dirname, uohid_links);

readCycle(dataPath);

// 8 भ्वादिः - बाधृँ॒ - prayoga=कर्तरि - बाध्1_बाधृँ_भ्वादिः लोडने -
//     http://sanskrit.uohyd.ac.in/cgi-bin/scl/skt_gen/verb/verb_gen.cgi?prayoga=कर्तरि&vb=बाध्1_बाधृँ_भ्वादिः लोडने&encoding=Unicode
//     - ( बाध् ) - रोटने - सेट् - आ.प -
function readCycle(dataPath) {
    var rows = fs.readFileSync(dataPath).toString().split('\n');
    var params = [];
    rows.forEach(function(row, idx) {
        if (row.slice(0,4) != 'http') return;
        if (/MISSING/.test(row)) return;
        var url = JSON.stringify(row);
        var pre = rows[idx -1];
        var next = rows[idx +1];
        var prearr = pre.split(' - ');
        var pre0arr = prearr[0].split(' ');
        var idy = pre0arr[0];
        var full = prearr[1];
        // if (!full) full = ['full=', row].join('');
        // full = ['full=', full].join('');
        var gana = pre0arr[1];
        var dhatu = prearr[3];
        dhatu = dhatu.split(/._/)[0];

        var nextarr = next.split(' - ');
        var full_1 = nextarr[0];
        full_1 = full_1.replace('- ( ', '').replace(' )', '');
        var artha = nextarr[1];
        var full_1_slp = salita.sa2slp(full_1);
        var artha_slp = salita.sa2slp(artha);
        var gana_slp = salita.sa2slp(gana);
        var key = [full_1_slp, artha_slp, gana_slp, idy].join('-');
        var iDAgama = nextarr[2];
        var pada = nextarr[3];
        pada = pada.replace('-', '').trim();
        // pada = ['pada=', pada, '<='].join('');

        // var cmd = ['lynx -dump', url, '> ../lib/Dump/'].join(' ');
        // var refull_1 = new RegExp(full_1);
        // if (!refull_1.test(full)) log(idx, pre);
        // if (idy == 1) log('=:', idy, '-', key, full, 'dh:', full_1);
        // log('=:', idy, '-', key, 'gana:', gana, 'pada:', pada, 'full:', full, 'full_1:', full_1, 'dhatu:', dhatu, 'iDAgama:', iDAgama);
        // if (idy == 1) return;
        if (idy != 1625) return;
        var param = {idy: idy, key: key, gana: gana, pada: pada, full: full, full_1: full_1, dhatu: dhatu, artha: artha, iDAgama: iDAgama, http: row};
        params.push(param);
        // saveDump(key, gana, pada, full, full_1, dhatu, iDAgama, row);
    });
    // exec("ls -la", puts);
    async.mapSeries(params, saveDump);
}



// function saveDump(key, gana, pada, full, full_1, dhatu, iDAgama, http) {
function saveDump(param, cb) {
    // log('P', param);
    var key = param.key;
    var gana = param.gana;
    var pada = param.pada;
    var full = param.full;
    var full_1 = param.full_1;
    var dhatu = param.dhatu;
    var artha = param.artha;
    var iDAgama = param.iDAgama;
    var http = param.http;
    var dataPath = path.join(__dirname, '../lib/Dump-uohid/');
    var wpath = [dataPath, key, '.txt'].join('');
    var header = 'gana - pada - full - full_1 - dhatu - artha - iDAgama';
    var content = [gana, pada, full, full_1, dhatu, artha, iDAgama].join(' - ');
    var txt = [key, header, content, http].join('\n');

    log('param:', key);
    dumpHttp(http, function(stdout) {
        txt = [txt, stdout].join('\n');
        dumpFile(wpath, txt, cb);
    });
}

// lynx -dump "http://sanskrit.uohyd.ac.in/cgi-bin/scl/skt_gen/verb/verb_gen.cgi?prayoga=कर्तरि&vb=लाभ1_लाभ_चुरादिः प्रेरणे&encoding=Unicode"
// cmd = "lynx -dump " + url + "> ~/tinanta/%d" % i
function dumpHttp(http, cb) {
    log('HTTP', http);
    var url = JSON.stringify(http);
    var cmd = ["lynx -dump -width=1000", url].join(' ');
    // cmd = "ls -la";
    exec(cmd, function(error, stdout, stderr) {
        // log(111, error, stdout, stderr);
        log('CMD', cmd);
        cb(stdout);
    });
}

function dumpFile(wpath, txt, cb) {
    log('DUMP FILE');
    fs.writeFile(wpath, txt, function(err) {
        if(err) {
            cb(err, true);
            return console.log(err);
        }
        cb(null, true);
        // console.log("saved", wpath);
    });
}

function puts(error, stdout, stderr) { console.log(stdout) }
