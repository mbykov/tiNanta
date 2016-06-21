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

// var uohyd_dumps = '../Junk';
var uohyd_dumps = '../lib/Dump-uohyd';
var dataPath = path.join(__dirname, uohyd_dumps);
var dumpPath = path.join(__dirname, '../lib/uohyd_dump.js');

// to save in db:
var docs = {};

fs.unlinkSync(dumpPath);
var logger = fs.createWriteStream(dumpPath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});

readDir(logger);

function readDir(logger) {
    // logger.write('some data  2 === \n');
    writeHeader(logger);
    var fns  = fs.readdirSync(dataPath);
    fns.forEach(function(fn) {
        // if (fn != 'vid-jYAne-adAdiH-1625.txt') return;
        if (fn != 'BU-sattAyAm-BvAdiH-1.txt' && fn != 'BU-prAptO-curAdiH-2748.txt') return;
        var fpath = [dataPath, fn].join('/');
        // log('F', fpath);
        var doc = parseFile(fpath);
        // p('D', doc);
        log(doc.key);
        var docData = util.inspect(doc,  {depth: null});
        logger.write(docData);
        // fs.writeFileSync(dumpPath, util.inspect(doc,  {depth: null}) , 'utf-8');
        // writeDump(doc);
        logger.write(',\n');
    });
    // logger.write('some data 2');
    writeFooter(logger);
    logger.end();
}

function writeHeader(logger) {
    var data = 'var dump = [\n';
    logger.write(data);
}

function writeFooter(logger) {
    var data = ']\nexports = module.exports = dump;';
    logger.write(data);
}

function parseFile(dataPath) {
    var rows = fs.readFileSync(dataPath).toString().split('\n');
    var params = [];
    var pada;
    var doc = {};
    var body = {};
    var lakara;
    rows.forEach(function(row, idx) {
        // if (idx > 15) return;
        row = row.trim();
        if (row == '') return;
        row = row.replace(/\s+/g, ' ');
        row = row.trim();
        if (row == '') return;
        // распарсить хидер
        // BU-sattAyAm-BvAdiH-1
        // gana - pada - full - full_1 - dhatu - artha - iDAgama
        // भ्वादिः - प.प - भू - भू - भू - सत्तायाम् - सेट्
        // http://sanskrit.uohyd.ac.in/cgi-bin/scl/skt_gen/verb/verb_gen.cgi?prayoga=कर्तरि&vb=भू1_भू_भ्वादिः सत्तायाम्&encoding=Unicode
        if (idx == 0) {
            var karr = row.split('-');
            doc.key = row;
            doc.num = karr[3]*1;
        };
        if (idx == 2) {
            var harr = row.split(' - ');
            doc.dhatu = harr[4];
            doc.dp = harr[2]; // dp - dhatu-pada-full
            doc.dpc = harr[3]; // dp - dhatu-pada-clean, full_1
            doc.gana = harr[0];
            doc.artha = harr[5];
            doc.iDAgama = harr[6];
        }
        row = row.replace(/-/g, '');
        row = row.replace(/\s+/g, ' ');
        row = row.trim();

        if (pada == 'परस्मै' && row == 'लट्') pada = 'आत्मने';
        else if (row == 'लट्') pada = 'परस्मै';
        if (!pada) return;
        if (!body[pada]) body[pada]= {};

        var arr = row.split(' ');
        // var head = arr[0];
        if (arr.length == 1) lakara = row;

        var head = arr.shift();
        if (arr.length == 2 && head == 'एकवचनम्') return;
        else if (arr.length == 3) {
            if (!body[pada][lakara]) body[pada][lakara] = {};
            body[pada][lakara][head] = arr;
        }
        doc.la = body;
        // if (idx < 35) log('R', idx, row);
    });
    return doc;
}


// function writeDump(body) {
//     var json = JSON.stringify(body);
//     fs.writeFile(dumpPath, json, function(err) {
//         if(err) {
//             // cb(err, true);
//             return console.log(err);
//         }
//         // cb(null, true);
//         console.log("saved", json.length);
//     });
// }

//

// 'लिट्':
// { 'प्रथमपुरुषः':
//   [ 'विदामास/विदाम्बभूव/विदाञ्चकार/विवेद',    'विदामासतुः/विविदतुः/विदाञ्चक्रतुः/विदाम्बभूवतुः',    'विदामासुः/विदाम्बभूवुः/विदाञ्चक्रुः/विविदुः' ],
//   'मध्यमपुरुषः':
//   [ 'विदामासिथ/विदाञ्चकर्थ/विवेदिथ/विदाम्बभूविथ',    'विदामासथुः/विविदथुः/विदाञ्चक्रथुः/विदाम्बभूवथुः',    'विदामास/विदाम्बभूव/विदाञ्चक्र/विविद' ],
//   'उत्तमपुरुषः':
//   [ 'विदामास/विदाम्बभूव/विदाञ्चकर/विदाञ्चकार/विवेद',    'विदामासिव/विदाञ्चकृव/विविदिव/विदाम्बभूविव',    'विदामासिम/विदाञ्चकृम/विविदिम/विदाम्बभूविम' ] };
