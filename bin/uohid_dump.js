    / /
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
var dru = require('../lib/mahavriksha');
var salita = require('salita-component');
// var sys = require('sys');
var exec = require('child_process').exec;

var uohid_links = '../lib/uohyd_dump_links.txt';
var dataPath = path.join(__dirname, uohid_links);

readCycle(dataPath);

// 8 भ्वादिः - बाधृँ॒ - prayoga=कर्तरि - बाध्1_बाधृँ_भ्वादिः लोडने -
//     http://sanskrit.uohyd.ac.in/cgi-bin/scl/skt_gen/verb/verb_gen.cgi?prayoga=कर्तरि&vb=बाध्1_बाधृँ_भ्वादिः लोडने&encoding=Unicode
//     - ( बाध् ) - रोटने - सेट् - आ.प -
function readCycle(dataPath) {
    var rows = fs.readFileSync(dataPath).toString().split('\n');
    rows.forEach(function(row, idx) {
        if (row.slice(0,4) != 'http') return;
        var url = JSON.stringify(row);
        var pre = rows[idx -1];
        var next = rows[idx +1];
        var prearr = pre.split(' - ');
        var pre0arr = prearr[0].split(' ');
        var idy = pre0arr[0];
        var full = prearr[1];
        var gana = pre0arr[1];
        var dhatu = prearr[3];
        dhatu = dhatu.split(/._/)[0];

        var nextarr = next.split(' - ');
        var full_1 = nextarr[0];
        full_1 = full_1.replace('- ( ', '').replace(' )', '');
        var artha = nextarr[1];
        var full_1_slp = salita.sa2slp(full_1);
        var artha_slp = salita.sa2slp(artha);
        var key = [full_1_slp, artha_slp, idy].join('-');
        var setanit = nextarr[2];
        var pada = nextarr[3];

        var cmd = ['lynx -dump', url, '> ../lib/Dump/'].join(' ');
        // var refull_1 = new RegExp(full_1);
        // if (!refull_1.test(full)) log(idx, pre);
        // if (idy == 1) log('=:', idy, '-', key, full, 'dh:', full_1);
        log('=:', idy, '-', key, 'gana:', gana, 'pada:', pada, 'full:', full, 'full_1:', full_1, 'dhatu:', dhatu, 'set:', setanit);
        // saveDump(key, gana, pada, full, full_1, setanit);
    });
    // exec("ls -la", puts);
}

function puts(error, stdout, stderr) { console.log(stdout) }

// lynx -dump "http://sanskrit.uohyd.ac.in/cgi-bin/scl/skt_gen/verb/verb_gen.cgi?prayoga=कर्तरि&vb=लाभ1_लाभ_चुरादिः प्रेरणे&encoding=Unicode"
// cmd = "lynx -dump " + url + "> ~/tinanta/%d" % i


// var fs = require('fs');
// fs.writeFile("/tmp/test", "Hey there!", function(err) {
//     if(err) {
//         return console.log(err);
//     }

//     console.log("The file was saved!");
// });

function saveDump(key, gana, pada, full, full_1, setanit) {
    var dataPath = path.join(__dirname, '../lib/Dump/');
    var wpath = [dataPath, key, '.txt'].join('');
    var content = key;
    fs.writeFile(wpath, content, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("saved", key);
    });
}
