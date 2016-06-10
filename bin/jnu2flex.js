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

log(dru);

var jnu_verbs = './Junk/jnu-tiNanta-values.txt';
var dataPath = path.join(__dirname, '../', jnu_verbs);

// log('RUN ===', dataPath);

var rows = fs.readFileSync(dataPath).toString().split('\n');

for (var gana in dru) {
    log('GANA', gana);
    var lakara = dru[gana];
    for (var la in lakara) {
        log('LA', la);
        var padas = lakara[la];
        for (var pada in padas) {
            log('P', pada);
            var flexes = padas[pada];
            for (var key in flexes) {
                var terms = flexes[key];
                var size = terms.shift();
                // log('size-terms', size, terms);
                var cterms = getTerms(gana, la, pada, key, size, terms);
                // cterms.shift();
                // log('C', cterms);
            }
        }
    }
}


function getTerms(gana, la, pada, key, size, cterms) {
    // log('G', gana, la, pada, key, size);
    var terms = [];
    var num, per;
    [num, per] = key.split('.');
    // log('P', per, num);

    rows.forEach(function(row, idx) {
        row = row.trim();
        if (row[0] == '#') return;
        if (row == '') return;
        var re_la = new RegExp(', ' + la);
        if (!re_la.test(row)) return;
        var re_pada = new RegExp(pada);
        if (!re_pada.test(row)) return;
        var re_gana = new RegExp(gana);
        if (!re_gana.test(row)) return;
        var arr = row.split('\\n');

        var triplet;
        if (per == 3) triplet = arr.slice(-3, -2)[0];
        else if (per == 2) triplet = arr.slice(-2, -1)[0];
        else if (per == 1) triplet = arr.slice(-1)[0];

        if (!triplet) log('NO TRIPLET', idx, row);
        triplet = triplet.trim();

        var forms = triplet.split(' ');
        var form;
        if (num == 'sg') form = forms[0];
        else if (num == 'du') form = forms[1];
        else if (num == 'pl') form = forms[2];
        if (!form) log('NO FORM', idx, row);


        // if (idx != 100) return;
        // log('per', per);
        // log('num', num);
        // log('A', row);
        // log('B', triplet);

        var last2syms;
        if (size > 0) last2syms = form.slice(-size);
        else last2syms = '';
        // log('last2syms:', idx, form, '-', last2syms); //
        // if (last2syms == 'ुवः') log(idx, row); // 'ाव', 'ुव'
        // 'िथ', '्थ', 'रथ', 'ेथ', 'ोथ', 'ाथ'
        // l-i-w => 5 значений. Или прописать гласную букву и ее гуну, соответствующую каждой гласной перед Тха, или - что?
        // или пропускать все, в надежде, что отрежет словарь
        // первое - целое исследование //  च क ा श ि ध ्  व    ै
        // то есть - второе. А в словаре - пометка для liw и, наверное, она же для gana-3
        if (la == 'लिट्' && per == 2 && num == 'pl' && last2syms == 'ध्वै' ) log('==>>', idx, row);
        // terms.push(size);
        terms.push(last2syms);
    });
    var uniqs = _.uniq(terms);

    if (JSON.stringify(uniqs) == JSON.stringify(cterms)) return;
    log('=================', uniqs, 2, cterms);
    log('=================', gana, '-', la, '-', pada, '-', key);

    throw new Error();

    return uniqs;
}

return;

var ganas = ['भ्वादिगण'];
var lakaras_slp = ['law', 'low', 'laN', 'viDiliN', 'liw', 'luw', 'xw', 'ASIrliN', 'luN', 'XN'];
var lakaras = ['लट्', 'लोट्', 'लङ्', 'विधिलिङ्', 'लिट्', 'लुट्', 'ऌट्', 'आशीर्लिङ्', 'लुङ्', 'ॡङ्'];
var lakara_en = ['pres', 'imperat', 'imperf.past', 'potential', 'perf.past', '1 fut', '2 fut', 'benedict', 'aorist', 'cond'];
var padas_slp = ['par', 'atm', 'ubh'];
var padas = ['परस्मै', 'आत्मने']; // , 'उभय', 'कर्मणि' - как лучше?
var numbers = ['sg', 'du', 'pl'];
var persons = [3, 2, 1];



var flexes = {};

lakaras.forEach(function(la) {
    if (la != 'लट्') return;
    flexes[la] = {};
    padas.forEach(function(pada) {
        // if (pada != 'par') return;
        flexes[la][pada] = {};
        var numper = '';
        var result, terms, length;
        numbers.forEach(function(num) {
            // if (num != 'sg') return;
            persons.forEach(function(per) {
                // if (per != 3) return;
                numper = [num, per].join('.');
                // flexes[la][pada][numper] = 'a';
                terms = getTerms_(la, pada, num, per);
                flexes[la][pada][numper] = terms;
            });
        });
    });
});

p('FL', flexes);

function getTerms_(la, pada, num, per) {
    var gana = 'भ्वादिगण';  //
    var terms = [];
    var syms = 2;

    rows.forEach(function(row, idx) {
        row = row.trim();
        if (row[0] == '#') return;
        if (row == '') return;
        var re_la = new RegExp(la);
        if (!re_la.test(row)) return;
        var re_pada = new RegExp(pada);
        if (!re_pada.test(row)) return;
        var re_gana = new RegExp(gana);
        if (!re_gana.test(row)) return;
        var arr = row.split('\\n');

        var triplet;
        if (per == 3) triplet = arr.slice(-3, -2)[0];
        else if (per == 2) triplet = arr.slice(-2, -1)[0];
        else if (per == 1) triplet = arr.slice(-1)[0];

        if (!triplet) log('NO TRIPLET', idx, row);
        triplet = triplet.trim();

        var forms = triplet.split(' ');
        var form;
        if (num == 'sg') form = forms[0];
        else if (num == 'du') form = forms[1];
        else if (num == 'pl') form = forms[2];
        if (!form) log('NO FORM', idx, row);


        // if (idx != 100) return;
        // log('per', per);
        // log('num', num);
        // log('A', row);
        // log('B', triplet);

        // var syms = 2;
        if (pada == 'परस्मै') {
            if (per == 1)  syms = 3;
            else if (num == 'pl' && per == 2) syms = 1;
            else if (per == 3 && num == 'pl') syms = 4;
        } else if (pada == 'आत्मने') {
            if (per == 1 && num == 'sg') syms = 1;
            else if (per == 1 && (num == 'pl')) syms = 4;
            else if (per == 1 && num == 'du') syms = 4;
            else if (per == 3 && num == 'du') syms = 3;
            else if (per == 2 && num == 'du') syms = 3;
            else if (per == 2 && num == 'pl') syms = 4;
            else if (per == 3 && num == 'pl') syms = 4;
        }
        var last2syms = form.slice(-syms);
        // log('last2syms:', idx, form, '-', last2syms);
        // if (last2syms == 'ुवः') log(idx, row);
        if (per == 2 && num == 'du' && last2syms == 'हथे') log('==>>', idx, row);
        terms.push(syms);
        terms.push(last2syms);
    });
    var uniqs = _.uniq(terms);

    return uniqs;
}

// ट् ह्राद्


// var la = {};
// la.p_law = 'परस्मै, लट्'; //
// la.p_law = 'भ्वादिगण, परस्मै, लट्';  // только гана 1  'ावः', 'ुवः'
// la.p_low = 'परस्मै, लोट्';

// var latmp = la.p_law;
// var re = new RegExp(latmp);


// var terms = [];

// rows.forEach(function(row, idx) {
//     row = row.trim();
//     if (row[0] == '#') return;
//     if (!re.test(row)) return;
//     var arr = row.split('\\n');

//     // ############
//     // var triplet = arr.slice(-3, -2)[0]; // триплет третий с конца, лицо, प्रथम, - 3
//     // var triplet = arr.slice(-2, -1)[0]; //  मध्यम - 2
//     var triplet = arr.slice(-1)[0]; // उत्तम - 1

//     if (!triplet) log(idx, row);
//     triplet = triplet.trim();
//     var forms = triplet.split(' ');

//     // ############
//     // var form = forms[0]; // 0-sg-eka,
//     var form = forms[1]; // 1-du-dvi
//     // var form = forms[0]; // 2-pl-bahu

//     // var last2syms = form.slice(-2);
//     var last2syms = form.slice(-3);
//     // log(idx, form, last2syms);
//     if (last2syms == 'ुवः') log(idx, row)
//     terms.push(last2syms);
// });

// log(_.uniq(terms));




// var flexes = {};
// flexes.p_law_sg3 = [ 'ति', 'धि' ];
// flexes.p_law_sg2 = [ 'सि', 'षि' ];
// flexes.p_law_sg1 = [ 'मि' ];
// flexes.p_law_du3 = [ 'तः', 'धः', 'टः' ];
// flexes.p_law_du2 = [ 'थः', 'धः', 'ठः' ];
// flexes.p_law_du1 = [ 'वः' ]; // [ 'ावः' ] - это три символа


// p(flexes);
