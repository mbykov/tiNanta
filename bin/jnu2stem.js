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
var dru = require('../lib/mahavriksha');
var salita = require('salita-component');

// log('DRU', dru);

var jnu_verbs = './jnu/jnu-tiNanta-values.txt';
var dataPath = path.join(__dirname, '../', jnu_verbs);

var tinsForLuN = {'तिप्': [], 'तस्': [], 'झि': [], 'सिप्': [], 'थस्': [], 'थ': [], 'मिप्': [], 'वस्': [], 'मस्': [], 'त': [], 'आताम्': [], 'झ': [], 'थास्': [], 'आथाम्': [], 'ध्वम्': [], 'इट्': [], 'वहि': [], 'महिङ्': []};
// var tins = {};
var tins = {'लट्': [], 'लोट्': [], 'लङ्': [], 'विधिलिङ्': [], 'लिट्': [], 'लुट्': [], 'ऌट्': [], 'आशीर्लिङ्': [], 'लुङ्': [], 'ॡङ्': []};

// a=  { 'लट्': [ '{"0":["ते"],"1":["ेते"],"2":["न्ते"],"3":["से"],"4":["ेथे"],"5":["ध्वे"],"6":["े"],"7":["ावहे"],"8":["ामहे"]}' ],
//   'लोट्': [ '{"0":["ताम्"],"1":["ेताम्"],"2":["न्ताम्"],"3":["स्व"],"4":["ेथाम्"],"5":["ध्वम्"],"6":["ै"],"7":["ावहै"],"8":["ामहै"]}' ],
//   'लङ्': [ '{"0":["त"],"1":["ेताम्"],"2":["न्त"],"3":["थाः"],"4":["ेथाम्"],"5":["ध्वम्"],"6":["े"],"7":["ावहि"],"8":["ामहि"]}' ],
//   'विधिलिङ्': [ '{"0":["त"],"1":["याताम्"],"2":["रन्"],"3":["थाः"],"4":["याथाम्"],"5":["ध्वम्"],"6":["य"],"7":["वहि"],"8":["महि"]}' ],
//   'लिट्': [ '{"0":["्रे"],"1":["्राते"],"2":["्रिरे"],"3":["ृषे"],"4":["्राथे"],"5":["ृढ्वे"],"6":["्रे"],"7":["ृवहे"],"8":["ृमहे"]}' ],
//   'लुट्': [ '{"0":[""],"1":["रौ"],"2":["रः"],"3":["से"],"4":["साथे"],"5":["ध्वे"],"6":["हे"],"7":["स्वहे"],"8":["स्महे"]}' ],
//   'ऌट्': [ '{"0":["ते"],"1":["ेते"],"2":["न्ते"],"3":["से"],"4":["ेथे"],"5":["ध्वे"],"6":["े"],"7":["ावहे"],"8":["ामहे"]}' ],
//   'आशीर्लिङ्': [ '{"0":["ष्ट"],"1":["यास्ताम्"],"2":["रन्"],"3":["ष्ठाः"],"4":["यास्थाम्"],"5":["ध्वम्"],"6":["य"],"7":["वहि"],"8":["महि"]}' ],
//   'लुङ्': [ '{"0":["त"],"1":["ेताम्"],"2":["न्त"],"3":["थाः"],"4":["ेथाम्"],"5":["ध्वम्"],"6":["े"],"7":["ावहि"],"8":["ामहि"]}' ],
//   'ॡङ्': [ '{"0":["त"],"1":["ेताम्"],"2":["न्त"],"3":["थाः"],"4":["ेथाम्"],"5":["ध्वम्"],"6":["े"],"7":["ावहि"],"8":["ामहि"]}' ] }


// log('RUN ===', dataPath);

var rows = fs.readFileSync(dataPath).toString().split('\n');
log('size', rows.length);


var dhatus = {};
function run(rows) {
    var rowarr, rowforms = [];
    var head, headarr, dhatu, artha, gana, pada, la;
    var dhatuslp, arthaslp, ganaslp, padaslp, key;
    var stem;
    rows.forEach(function(row, idz) {
        row = row.trim();
        if (row == '') return;
        if (row[0] == '#') return;
        // if (idz > 100) return;
        row = row.replace(/\s+/g, ' ');
        rowarr = row.split('\\n');
        head = rowarr.shift();
        rowforms = row.split(1);
        dhatu = head.split('(')[0].trim();
        headarr = head.split('(')[1].trim();
        headarr = headarr.replace(')', '');
        headarr = headarr.split(',');
        // log(rowarr);
        if (!headarr[2]) log('E', row);
        artha = headarr[0].trim();
        gana = headarr[1].trim().replace('गण', '');
        pada = headarr[2].trim();
        la = headarr[3].trim();
        dhatuslp = salita.sa2slp(dhatu);
        arthaslp = salita.sa2slp(artha.replace(/ /g, '_'));
        ganaslp = salita.sa2slp(gana);
        padaslp = salita.sa2slp(pada);

        if (padaslp == 'Atmane') return;

        key = [dhatuslp, arthaslp, ganaslp, padaslp].join('-');
        // var oDhatu = {dhatu: dhatu, artha: artha, pada: pada, la: la};
        if (!dhatus[key]) dhatus[key] = {};
        // dhatus.push(oDhatu);
        stem = stemForLa(rowarr, la, dhatu);
        dhatus[key][la] = {stem: stem};
    });
}

function stemForLa(rowarr, la, dhatu) {
    // log(111, rowarr);
    var stem, column, sym, next, next2, soft;
    var syms = [];
    var forms = [];
    rowarr.forEach(function(r) { forms = forms.concat(r.trim().split(' '))});
    if (forms.length != 9) {
        log('ERR: ', la, forms);
        throw new Error('forms length is not 9 ' + la + ' - ' +dhatu);
    }
    var idx = 0;
    while(idx < 15) {
        column = forms.map(function(form) { //
            sym = form[idx];
            next = form[idx+1];
            next2 = form[idx+2];
            // разобраться, что меняет звонкость - всегда dha, или что-то еще? Это luN
            // var old  = sym;
            if (next && next == c.virama && next2 == 'ध') {
                soft = sym;
                sym = u.soft2hard(sym) || sym;
            }
            // if (old != sym) log('HARD SYM', old, sym);
            return sym;
        });
        var uniq = _.uniq(column);
        if (uniq.length > 1) break;
        syms.push(uniq[0]);
        idx++;
    };
    stem = syms.join('');
    var softStem, reSoft;
    if (soft) {
        softStem = stem.slice(0, -2);
        softStem = [softStem, soft, c.virama].join('');
        reSoft = new RegExp('^' + softStem);
    }
    var reStem = new RegExp('^' + stem);
    var tinStr = {};
    var json;
    forms.forEach(function(form, idx) {
        var tip = idx.toString();
        if (!tinStr[tip]) tinStr[tip] = [];
        var stin = form.replace(reStem, '');
        if (soft) stin = stin.replace(reSoft, '');
        tinStr[tip].push(stin);
        // log('================', json);
    });
    json = JSON.stringify(tinStr);
    if (!inc(tins[la], json)) tins[la].push(json);

    return stem;
}

// यामः "्यामः" "्यतः"

run(rows);
log('dhanus', _.keys(dhatus).length);
log('TINS', tins['लट्']);


 // भू (सत्तायाम्, भ्वादिगण, परस्मै, लट्) \n भवति भवतः भवन्ति \n भवसि भवथः भवथ \n भवामि भवावः भवामः
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, लोट्) \n भवतु भवताम् भवन्तु \n भव भवतम् भवत \n भवानि भवाव भवाम
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, लङ्) \n अभवत् अभवताम् अभवन् \n अभवः अभवतम् अभवत \n अभवम् अभवाव अभवाम
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, विधिलिङ्) \n भवेत् भवेताम् भवेयुः \n भवेः भवेतम् भवेत \n भवेयम् भवेव भवेम
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, लिट्) \n बभूव बभूवतुः बभूवुः \n बभूविथ बभुवथुः बभूव \n बभूव बभुविव बभूविम
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, लुट्) \n भविता भवितारौ भवितारः \n भवितासि भवितास्थः भवितास्थ \n भवितास्मि भवितास्वः भवितास्मः
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, ऌट्) \n भविष्यति भविष्यतः भविष्यन्ति \n भविष्यसि भविष्यथः भविष्यथ \n भविष्यामि भविष्यावः भविष्यामः
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, आशीर्लिङ्) \n भूयात् भूयास्ताम् भूयासुः \n भूयाः भूयास्तम् भूयास्त \n भूयासम् भूयास्व भूयास्म
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, लुङ्) \n अभूत् अभूताम् अभूवन् \n अभूः अभूतम् अभूत \n अभूवम् अभूव अभूम
 // भू (सत्तायाम्, भ्वादिगण, परस्मै, ॡङ्) \n अभविष्यत् अभविष्यताम् अभविष्यन् \n अभविष्यः अभविष्यतम् अभविष्यत \n अभविष्यम् अभविष्याव अभविष्याम
