// это устарело, я пытался прописать tins вручную

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

var dhatus = {};

for (var gana in dru) {
    log('GANA', gana);
    // if (gana != 'भ्वादिगण') continue;
    if (gana != 'अदादिगण') continue;

    var lakara = dru[gana];
    for (var la in lakara) {
        // if (la != 'लट्') continue;
        // if (la != 'लट्' && la != 'ऌट्') continue;
        // if (la != 'ऌट्') continue;
        // if (la != 'लोट्') continue;
        log('LA', la);

        var padas = lakara[la];
        for (var pada in padas) {
            log('P', pada);
            var flexes = padas[pada];
            for (var key in flexes) {
                var cterms = flexes[key];
                var size = cterms.shift();
                // log('size-terms', size, terms);
                var dhatus_ = getTerms(gana, la, pada, key, size, cterms);
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
        var descr = {gana: gana, la:la, pada: pada, dhatu: dhatu, key: key, stem: stem, flex: lastsyms};
        if (!dhatus[dhatu_key]) dhatus[dhatu_key] = [];
        dhatus[dhatu_key].push(descr);
        // gana, la, pada, key, size, cterms;

        // log('lastsyms:', idx, form, '-', lastsyms); //
        // if (lastsyms == 'ुवः') log(idx, row); // 'ाव', 'ुव'
        // 'िथ', '्थ', 'रथ', 'ेथ', 'ोथ', 'ाथ'
        // l-i-w => 5 значений. Или прописать гласную букву и ее гуну, соответствующую каждой гласной перед Тха, или - что?
        // или пропускать все, в надежде, что отрежет словарь
        // первое - целое исследование //  च क ा श ि ध ्  व    ै
        // то есть - второе. А в словаре - пометка для liw и, наверное, она же для gana-3

        if (la == 'ऌट्' && per == 3 && num == 'pl' && lastsyms == 'ष्तन्ति' ) log('==>>', idx, row);
        // terms.push(size);
        terms.push(lastsyms);
    });
    var uniqs = _.uniq(terms);

    if (JSON.stringify(uniqs) == JSON.stringify(cterms)) {
        // p('DHs', dhatus['4204-raBa']);
        // p('DHs', dhatus['7-BU']);
        return dhatus;
    } else {
        log('=================', uniqs, 2, cterms);
        log('=================', gana, '-', la, '-', pada, '-', key);
        throw new Error();
    }
}

// p('DHs', dhatus['4204-raBa']);
// p('DHs', dhatus['7-BU']);
// p('DHs', dhatus['1-BU']);

var dhatukeys = _.keys(dhatus);
log('SIZE:', dhatus);


return;
compact(dhatus);

function compact(dhatus) {
    var order = {};
    for (var dkey in dhatus) {
        // if (dkey != '4204-raBa') continue;
        // if (dkey != '7-BU') continue;
        // order[dkey] = {};
        var dhs = dhatus[dkey];
        var sample = dhs[0];
        var dhatu = sample.dhatu;
        // if (dhatu != 'श्रथि') continue;
        if (!order[dhatu]) order[dhatu] = {};
        var ganagroups = _.groupBy(dhs, 'gana');
        for (var gana in ganagroups) {
            if (!order[dhatu][gana]) order[dhatu][gana] = {};
            var gana_arr = ganagroups[gana];
            var la_groups = _.groupBy(gana_arr, 'la');
            for (var la in la_groups) {
                if (!order[dhatu][gana][la]) order[dhatu][gana][la] = {};
                var padas_groups = la_groups[la] ;
                var par_group = _.select(padas_groups, function(gr) { return gr.pada == 'परस्मै'});
                var atm_group = _.select(padas_groups, function(gr) { return gr.pada == 'आत्मने'});
                var par_stems = par_group.map(function(gr) { return gr.stem});
                var atm_stems = atm_group.map(function(gr) { return gr.stem});
                // var par_terms = par_group.map(function(gr) { return gr.flex});
                // var atm_terms = atm_group.map(function(gr) { return gr.flex});
                par_stems = _.uniq(par_stems);
                atm_stems = _.uniq(atm_stems);
                // par_terms = _.uniq(par_terms);
                // atm_terms = _.uniq(atm_terms);

                // log(par_group);
                // log(atm_group);
                // log('par stem', par_stems);
                // log('atm stem', atm_stems);
                // continue;

                // low - imperative - все gacCa, но sg.1 и du.1 - gacca. Как выписать эту зависимость. Как ее вычислить?



                var stkey = [dkey, dhatu, gana, la].join(' - ');
                if (par_stems.length > 1) throw new Error('too many par stems' + stkey + '-st-' + par_stems);
                if (atm_stems.length > 1) throw new Error('too many atm stems' + stkey +  '-st-' + atm_stems);
                // if (par_terms.length > 1) throw new Error('too many par terms' + stkey + '-st-' + par_stems + '-trm-' + par_terms);
                // if (atm_terms.length > 1) throw new Error('too many atm terms' + stkey +  '-st-' + atm_stems + '-trm-' + par_terms);
                if (par_stems.length > 0) {
                    order[dhatu][gana][la]['par'] = {};
                    order[dhatu][gana][la]['par']['stem'] = par_stems[0];
                    // order[dhatu][gana][la]['par']['a-size'] = atm_stems.length;
                    // order[dhatu][gana][la]['par']['term'] = par_terms;
                }
                if (atm_stems.length > 0) {
                    order[dhatu][gana][la]['atm'] = {};
                    order[dhatu][gana][la]['atm']['stem'] = atm_stems[0];
                    // order[dhatu][gana][la]['atm']['term'] = atm_terms;
                }
            }
        }
        // var pars = sample.dhatu;
        // var dhatu = sample.dhatu;
    }
    p(order);
}
