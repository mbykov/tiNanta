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

var jnu_verbs = './Junk/jnu-tiNanta-values.txt';
var dataPath = path.join(__dirname, '../', jnu_verbs);

// log('RUN ===', dataPath);

var rows = fs.readFileSync(dataPath).toString().split('\n');
log('size', rows.length);


var dhatus = {};
function run(rows) {
    var rowarr = [];
    var head, headarr, dhatu, artha, gana, pada, la;
    var dhatuslp, arthaslp, ganaslp, padaslp, key;
    rows.forEach(function(row, idz) {
        if (row == '') return;
        if (row[0] == '#') return;
        if (idz > 10) return;
        row = row.replace(/\s+/g, ' ');
        rowarr = row.split('\\n');
        head = rowarr.shift();
        dhatu = head.split('(')[0].trim();
        headarr = head.split('(')[1].trim();
        headarr = headarr.replace(')', '');
        headarr = headarr.split(',');
        log(headarr);
        artha = headarr[0].trim();
        gana = headarr[1].trim().replace('गण', '');
        pada = headarr[2].trim();
        la = headarr[3].trim();
        dhatuslp = salita.sa2slp(dhatu);
        arthaslp = salita.sa2slp(artha.replace(/ /g, '_'));
        ganaslp = salita.sa2slp(gana);
        padaslp = salita.sa2slp(pada);
        key = [dhatuslp, arthaslp, ganaslp, padaslp].join('-');
        // var oDhatu = {dhatu: dhatu, artha: artha, pada: pada, la: la};
        if (!dhatus[key]) dhatus[key] = {};
        dhatus[key][la] = {};
        // dhatus.push(oDhatu);
    });
}

run(rows);
log(dhatus);


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
