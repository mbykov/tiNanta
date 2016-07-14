//

// var should = require('should');

var debug = (process.env.debug == 'true') ? true : false;
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var salita = require('salita-component');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;
// var tins = require('./lib/tins/laN');
// var tests = require('../lib/uohyd_dump');
var dataPath = path.join(__dirname, '../lib/uohyd_dump.js');

var tests = require(dataPath);
// p(tests);
var nmap = {'2': 'sg', '1': 'du', '0': 'pl'}; // number

function _Fn(dhatu, pada, lakara, purusha, num, form){
    var dhatu_slp = salita.sa2slp(dhatu);
    var lakara_slp = salita.sa2slp(lakara);
    var form_slp = salita.sa2slp(form);
    var numper = [nmap[num], purusha].join('.');
    describe(dhatu_slp, function(){
        var title = [lakara_slp, pada, numper, form_slp].join('_');
        it(title, function() {
            // log('=== la name ===', laname, la_slp);
            // log('=== test ===', lakara);
            form.should.equal(form);
        });
    });
}

tests.forEach(function(test, idx) {
    // log('T', test.key);
    for (var pada in test.la) {
        // log('PN', pada);
        var lakaras = test.la[pada];
        for (var lakara in lakaras) {
            var purushas = lakaras[lakara];
            // p(purushas);
            for (var purusha in purushas) {
                // p(purusha);
                var forms = purushas[purusha];
                forms.forEach(function(form, idz) {
                    // log(form);
                    // заносить / в список исключений?
                    var check = form.split('/');
                    if (check.length > 1) return;
                    var num = idz.toString();
                    _Fn(test.dhatu, pada, lakara, purusha, num, form);
                });
            }
        }
    }
});

for (var pname in tests) {
    var pada = tests[pname];
    for (var laname in pada) {
        var lakara = pada[laname];
        // _Fn(laname, lakara);
    }
}
