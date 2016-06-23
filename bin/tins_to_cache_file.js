// преобразование файла tins-окончаний в удобную плоскую readable form - tins-cache,
// окончания для всех gana - вместе, обработка по каждой gana - в фильтрах
// файл /lib/tins.js создан вручную

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

// FIXME: унести в util
var npmap = {'0': 'sg.3', '1': 'du.3', '2': 'pl.3', '3': 'sg.2', '4': 'du.2', '5': 'pl.2', '6': 'sg.1', '7': 'du.1', '8': 'pl.1' }; // num-per

var dirtyTins = '../lib/tins';
var dataPath = path.join(__dirname, dirtyTins);
var tinsCache = '../lib/tins_cache.js';
var dumpPath = path.join(__dirname, tinsCache);

fs.unlinkSync(dumpPath);
var logger = fs.createWriteStream(dumpPath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});

writeHeader(logger);

var lakaras = require(dataPath);
var terms = [];
var term;

for (var la in lakaras) {
    log(la);
    if (la == 'la') continue;
    var padas = lakaras[la];
    for (var pada in padas) {
        var tins = padas[pada];
        log(pada, tins);
        tins.forEach(function(tin2, idx) {
            var tarr = tin2.split('-');
            tarr.forEach(function(tin) {
                var term = {};
                term[tin] = {la: la, pada: pada, np: npmap[idx]};
                log(term);
                var docData = util.inspect(term,  {depth: null});
                logger.write(docData);
                logger.write(',');
            });
        });

    }
}

writeFooter(logger);
logger.end();

function writeDoc() {

}

function writeHeader(logger) {
    var data = 'var tins = [\n';
    logger.write(data);
}

function writeFooter(logger) {
    var data = ']\nexports = module.exports = tins;';
    logger.write(data);
}

// results :
// laN
// p [ 'त्-द्', 'ताम्', 'न्-उः', 'स्', 'तम्', 'त', 'म्', 'व', 'म' ]
