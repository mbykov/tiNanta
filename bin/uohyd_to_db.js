// создает один файл dhatus со всеми формами, для тестов и дальнейшей обработки - создания файла dhatu_anga.js

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

var gmap = {'भ्वादिः': 1, 'अदादिः': 2, 'जुहोत्यादिः': 3, 'दिवादिः': 4, 'स्वादिः': 5, 'तुदादिः': 6, 'रुधादिः': 7, 'तनादिः': 8, 'क्रयादिः': 9, 'चुरादिः': 10};
var pmap = {'प्रथमपुरुषः': 3, 'मध्यमपुरुषः': 2, 'उत्तमपुरुषः': 1};
var tipmap = {
    'परस्मैपदी': {
        'प्रथमपुरुषः': {'1': 'तिप्', '2': 'तस्', '3':'झि'}, // sg. du. pl
        'मध्यमपुरुषः': {'1': 'सिप्', '2': 'थस्', '3':'थ'},
        'उत्तमपुरुषः': {'1': 'मिप्', '2': 'वस्', '3':'मस्'}
    },
    'आत्मनेपदी': {
        'प्रथमपुरुषः': {'1': 'त', '2': 'आताम्', '3':'झ'},
        'मध्यमपुरुषः': {'1': 'थास्', '2': 'आथाम्', '3':'ध्वम्'},
        'उत्तमपुरुषः': {'1': 'इट्', '2': 'वहि', '3':'महिङ्'}
    }
};
var tipnames = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];

// to save in db-file:
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
    fns.forEach(function(fn, idx) {
        // log(fn)

        if (fn != 'Baj-sevAyAm-BvAdiH-1534.txt') return;
        // if (fn != 'As-upaveSane-adAdiH-1565.txt') return;
        // if (fn != 'BU-sattAyAm-BvAdiH-1.txt') return;
        // if (fn != 'BU-sattAyAm-BvAdiH-1.txt' && fn != 'As-upaveSane-adAdiH-1565.txt') return;
        // if (idx > 355) return;
        var fpath = [dataPath, fn].join('/');
        // log('F', fpath);
        var doc = parseFile(fpath);
        // p('D', doc);
        log(doc.key);
        var docData = util.inspect(doc,  {depth: null});
        logger.write(docData);
        logger.write(',\n');
    });
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
    var list = {};
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
            doc.gana = gmap[harr[0]];
            doc.artha = harr[5];
            // doc.iDAgama = harr[6];
            doc.set = (harr[6] == 'सेट्') ? true : false; // в файлах нет vet?
        }
        row = row.replace(/-/g, '');
        row = row.replace(/\s+/g, ' ');
        row = row.trim();

        // परस्मै - आत्मने;
        if (pada == 'परस्मैपदी' && row == 'लट्') pada = 'आत्मनेपदी';
        else if (row == 'लट्') pada = 'परस्मैपदी';
        // if (!pada) return;
        // if (!doc[pada]) doc[pada]= {};

        var arr = row.split(' ');
        // var head = arr[0];
        if (arr.length == 1) lakara = row;
        // if (lakara != 'लट्') return;
        if (!list[lakara]) list[lakara] = {};

        var head = arr.shift();
        if (arr.length == 2 && head == 'एकवचनम्') return;
        else if (arr.length == 3) {
            arr.forEach(function(form, idnum) {
                var tip = tipmap[pada][head][(idnum+1).toString()];
                list[lakara][tip] = form;
            });
            doc[lakara] = list[lakara];
        }
    });
    // p(doc);
    return doc;
}


// { key: 'BU-sattAyAm-BvAdiH-1',
//   num: 1,
//   dhatu: 'भू',
//   dp: 'भू',
//   dpc: 'भू',
//   gana: 1,
//   artha: 'सत्तायाम्',
//   set: true,
//   'लट्': {tips ...}


// 'लिट्':
// { 'प्रथमपुरुषः':
//   [ 'विदामास/विदाम्बभूव/विदाञ्चकार/विवेद',    'विदामासतुः/विविदतुः/विदाञ्चक्रतुः/विदाम्बभूवतुः',    'विदामासुः/विदाम्बभूवुः/विदाञ्चक्रुः/विविदुः' ],
//   'मध्यमपुरुषः':
//   [ 'विदामासिथ/विदाञ्चकर्थ/विवेदिथ/विदाम्बभूविथ',    'विदामासथुः/विविदथुः/विदाञ्चक्रथुः/विदाम्बभूवथुः',    'विदामास/विदाम्बभूव/विदाञ्चक्र/विविद' ],
//   'उत्तमपुरुषः':
//   [ 'विदामास/विदाम्बभूव/विदाञ्चकर/विदाञ्चकार/विवेद',    'विदामासिव/विदाञ्चकृव/विविदिव/विदाम्बभूविव',    'विदामासिम/विदाञ्चकृम/विविदिम/विदाम्बभूविम' ] };
