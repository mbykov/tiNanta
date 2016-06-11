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

log(dru);

var jnu_verbs = './Junk/jnu-tiNanta-values.txt';
var dataPath = path.join(__dirname, '../', jnu_verbs);

// log('RUN ===', dataPath);

var rows = fs.readFileSync(dataPath).toString().split('\n');

var dhatus = {};

for (var gana in dru) {
    log('GANA', gana);
    if (gana != 'भ्वादिगण') continue;
    var lakara = dru[gana];
    for (var la in lakara) {
        log('LA', la);
        if (la != 'ऌट्') continue;
        var padas = lakara[la];
        for (var pada in padas) {
            log('P', pada);
            var flexes = padas[pada];
            for (var key in flexes) {
                var cterms = flexes[key];
                var size = cterms.shift();
                // log('size-terms', size, terms);
                var terms = getTerms(gana, la, pada, key, size, cterms);
                // terms.shift();
                // log('C', terms);
            }
        }
    }
}


function getTerms(gana, la, pada, key, size, cterms) {
    // log('P-i', gana, la, pada, key);
    var terms = [];
    var num, per;
    [num, per] = key.split('.');

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

        var dhatuarr = arr[0].split(' ');
        var dhatu = dhatuarr[0];
        var artha = dhatuarr[1].replace('(', '').replace(',', '');
        var dhatu_slp = salita.sa2slp(dhatu);
        var artha_slp = salita.sa2slp(artha);
        var dhatu_key = [idx, dhatu_slp].join('-');

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

        var stem, lastsyms;
        if (size > 0) {
            stem = form.slice(0, -size);
            lastsyms = form.slice(-size);
        } else {
            stem = form;
            lastsyms = '';
        }

        // log(dhatu_key, stem, lastsyms);
        var descr = {gana: gana, la:la, key: key, dhatu: dhatu, stem: stem, flex: lastsyms};
        if (!descr) log ('NO DESCR', row);
        dhatus[dhatu_key] = descr;
        // gana, la, pada, key, size, cterms;

        // log('lastsyms:', idx, form, '-', lastsyms); //
        // if (lastsyms == 'ुवः') log(idx, row); // 'ाव', 'ुव'
        // 'िथ', '्थ', 'रथ', 'ेथ', 'ोथ', 'ाथ'
        // l-i-w => 5 значений. Или прописать гласную букву и ее гуну, соответствующую каждой гласной перед Тха, или - что?
        // или пропускать все, в надежде, что отрежет словарь
        // первое - целое исследование //  च क ा श ि ध ्  व    ै
        // то есть - второе. А в словаре - пометка для liw и, наверное, она же для gana-3

        // if (la == 'ऌट्' && per == 3 && num == 'sg' && lastsyms == 'ष्यति' ) log('==>>', idx, row);
        // terms.push(size);
        terms.push(lastsyms);
    });
    var uniqs = _.uniq(terms);

    if (JSON.stringify(uniqs) == JSON.stringify(cterms)) {
        // p('DHs', dhatus['4204-raBa']);
        p('DHs', dhatus['7-BU']);
        return uniqs;
    } else {
        log('=================', uniqs, 2, cterms);
        log('=================', gana, '-', la, '-', pada, '-', key);
        throw new Error();
    }
}
