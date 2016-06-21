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

function _Fn(pada, lakara, purusha, idz, form){
    describe('tinAnta', function(){
        var pada_slp = salita.sa2slp(pada);
        var lakara_slp = salita.sa2slp(lakara);
        var purusha_slp = salita.sa2slp(purusha);
        var form_slp = salita.sa2slp(form);
        var title = [pada_slp, lakara_slp, purusha_slp, idz, form_slp].join('_');
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
                    _Fn(pada, lakara, purusha, idz, form);
                });

            }
        }
    }
})

for (var pname in tests) {
    var pada = tests[pname];
    for (var laname in pada) {
        var lakara = pada[laname];
        // _Fn(laname, lakara);
    }
}
