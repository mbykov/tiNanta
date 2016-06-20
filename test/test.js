//

// var should = require('should');

var debug = (process.env.debug == 'true') ? true : false;
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var s = require('sandhi');
var c = s.const;
var u = s.u;
var sandhi = s.sandhi;
var inc = u.include;
var log = u.log;
var p = u.p;
// var tins = require('./lib/tins/laN');
var tests;
// var tests = require('../lib/uohid_dump');
var dataPath = path.join(__dirname, '../lib/uohid_dump.js');

// fs.readFile(dataPath, 'utf8', function (err, data) {
//     if (err) {
//         console.log('Error: ' + err);
//         return;
//     }
//     tests = JSON.parse(data);
//     // log('BEFORE', tests);
// });

var json = fs.readFileSync(dataPath, 'utf8');
var tests = JSON.parse(json);
p(tests);

// describe('tiNanta', function() {
//         before(function(done) {
//             fs.readFile(dataPath, 'utf8', function (err, data) {
//                 if (err) {
//                     console.log('Error: ' + err);
//                     return;
//                 }
//                 tests = JSON.parse(data);
//                 // log('BEFORE', tests);
//                 done();
//                 });
//         });

//     // for (var test in tests) {
//         // log('TESTSS', test);
//     // }
//     describe('#indexOf()', function() {
//         it('should return -1 when the value is not present', function() {
//             log('=== test ===');
//             [1,2,3].indexOf(5).should.equal(-1);
//             [1,2,3].indexOf(0).should.equal(-1);
//         });
//     });


// });

function _Fn(lakara){

    describe('As a dealer, I determine how many cards have been dealt from the deck based on', function(){

        it('should return -1 when the value is not present', function() {
            log('=== test ===', lakara);
            [1,2,3].indexOf(5).should.equal(-1);
            [1,2,3].indexOf(0).should.equal(-1);
        });

    });

}

for (var pada in tests) {
    var lakaras = tests[pada]
    for (var la in lakaras) {
        _Fn(la);
    }
}

// for(var i = 1; i<=5; i++){
//     _Fn(i);
// }
