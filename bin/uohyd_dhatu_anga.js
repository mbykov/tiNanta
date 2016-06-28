// одноразовый файл
// читает /lib/uohyd_dump.js, создает /lib/dhatu_anga.js - файл всех dhatu cо всеми стемами
// в зависимости от gana - образует stem или пару strong-weak

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

var dumpPath = path.join(__dirname, '../lib/uohyd_dump.js');
var dhatuPath = path.join(__dirname, '../lib/dhatu_anga.js');
var tinsPath = path.join(__dirname, '../lib/tins_cache.js');

var verbs = require(dumpPath);
var tins = require(tinsPath);
var nmap = {'0': 'sg', '1': 'du', '2': 'pl'};
var filter = require('../lib/filterGana');

// вычитаю -tins, собираю stems - д.б. ровно один stem для gana=1, la=law
// нужно прогнать все глаголы для всех gana-lakara


if (tins.length == 0) {
    log('/lib/tins_cache should have some values !');
    return;
}

var angas = [];
// var exceptions = ['भ्लाश्', 'भ्राश्', 'भ्रम्', 'घृण्ण्', 'श्रा', 'श्रु', 'श्वच्', 'अक्ष्', 'एज्', 'ग्रुच्', 'क्रम्', 'लष्', 'म्रुच्', 'नाथ्', 'क्षुद्', 'लुञ्ज्', 'इल्', 'क्षल्', 'जल्', 'हुल्', 'क्षीव्', 'मथ्', 'क्षिप्', 'क्षिप्', 'लुट्', 'जूर्', 'क्षिप्', 'क्षिप्', 'लुन्थ्', 'जूर्', 'क्षिप्', 'जर्ज्', 'जम्भ्', 'कुप्', 'लिह्', 'क्षिप्', 'लुन्थ्', 'लाज्', 'मा', 'जूर्', 'कुस्म्', 'ह्लग्', 'हिंस्', 'ह्री', 'इन्द्', 'हुल्', 'क्षीव्', 'ह्री', 'हृ', 'हन्', 'ह्वल्', 'इन्द्', 'इट्', 'इट्', 'हृ', 'हुल्', 'हृ', 'हुल्', 'क्षीव्', 'हय्', 'हृ', 'हुल्', 'क्षुद्', 'रङ्घ्', 'रुण्ठ्', 'स्रु', 'तक्ष्', 'टीक्'];

var exceptions = ['BlAS-dIptO-BvAdiH-1237', 'BrAS-dIptO-BvAdiH-1236', 'Bram-calane-BvAdiH-1278', 'GfR-grahaRe-BvAdiH-623', 'SrA-pAke-BvAdiH-1232', 'Sru-SravaRe-BvAdiH-1452', 'Sru-gatO-BvAdiH-1447', 'Svac-gatO-BvAdiH-235', 'akz-saNGAte-BvAdiH-989', 'akz-vyAptO-BvAdiH-988', 'ej-kampane-BvAdiH-326', 'gruc-steyakaraRe-BvAdiH-281', 'kram-pAdavikzepe-BvAdiH-675', 'laz-kAntO-BvAdiH-1377', 'mruc-gatO-BvAdiH-273', 'nAT-ESvarye-BvAdiH-11', 'nAT-upatApe-BvAdiH-10', 'nAT-yAcYAyAm-BvAdiH-12', 'raG-gatO-BvAdiH-145', 'ruW-Alasye-BvAdiH-491', 'ruW-gatO-BvAdiH-495', 'ruW-gatipratiGAte-BvAdiH-492', 'sru-gatO-BvAdiH-1448', 'takz-tanUkaraRe-BvAdiH-990', 'wIk-gatO-BvAdiH-140', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

var excep = {};
excep['लट्'] = ['BlAS-dIptO-BvAdiH-1237', 'BrAS-dIptO-BvAdiH-1236', 'Bram-calane-BvAdiH-1278', 'GfR-grahaRe-BvAdiH-623', 'SrA-pAke-BvAdiH-1232', 'Sru-SravaRe-BvAdiH-1452', 'Sru-gatO-BvAdiH-1447', 'Svac-gatO-BvAdiH-235', 'akz-saNGAte-BvAdiH-989', 'akz-vyAptO-BvAdiH-988', 'ej-kampane-BvAdiH-326', 'gruc-steyakaraRe-BvAdiH-281', 'kram-pAdavikzepe-BvAdiH-675', 'laz-kAntO-BvAdiH-1377', 'mruc-gatO-BvAdiH-273', 'nAT-ESvarye-BvAdiH-11', 'nAT-upatApe-BvAdiH-10', 'nAT-yAcYAyAm-BvAdiH-12', 'raG-gatO-BvAdiH-145', 'ruW-Alasye-BvAdiH-491', 'ruW-gatO-BvAdiH-495', 'ruW-gatipratiGAte-BvAdiH-492', 'sru-gatO-BvAdiH-1448', 'takz-tanUkaraRe-BvAdiH-990', 'wIk-gatO-BvAdiH-140', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
// GrA - и все на -A - нет долгой -A во всех практически формах - FIXME: проверить, м.б. все можно восстановить
excep['लङ्'] = ['gurd-krIqAyAm-BvAdiH-45', 'BlAS-dIptO-BvAdiH-1237', 'BrAS-dIptO-BvAdiH-1236', 'Bram-calane-BvAdiH-1278', 'DmA-Sabde-BvAdiH-1429', 'DmA-agnisaMyoge-BvAdiH-1428', 'GrA-ganDopAdAne-BvAdiH-1427', 'Sru-SravaRe-BvAdiH-1452', 'Sru-gatO-BvAdiH-1447', 'akz-saNGAte-BvAdiH-989', 'akz-vyAptO-BvAdiH-988', 'gA-gatO-BvAdiH-1462', 'haw-dIptO-BvAdiH-434', 'kram-pAdavikzepe-BvAdiH-675', 'laz-kAntO-BvAdiH-1377', 'mnA-aByAse-BvAdiH-1432', 'nAT-ESvarye-BvAdiH-11', 'nAT-upatApe-BvAdiH-10', 'nAT-yAcYAyAm-BvAdiH-12', 'pA-pAne-BvAdiH-1426', 'pac-pAke-BvAdiH-1531', 'takz-tanUkaraRe-BvAdiH-990', 'zWA-gatinivfttO-BvAdiH-1430', 'zwuB-stamBe-BvAdiH-562', 'pan-vyavahAre-BvAdiH-628', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

verbs.forEach(function(verb) {
    var gana = verb.gana;
    if (gana != 1) return;
    // p(verb.dhatu);
    // if (inc(exceptions, verb.key)) return;
    // log('V', verb.key, verb.dhatu, ' ');

    // var aaa = filter.gana(gana);
    // angas[verb.dhatu] = {strong: [], weak: []};
    var result = {dhatu: verb.dhatu, gana: gana};
    var stems = []; // это для A:
    for (var pada in verb.la) {
        // log('pada:', pada);
        var lakaras = verb.la[pada];
        for (var la in lakaras) {
            // if (la != 'लट्') continue;
            if (la != 'लङ्') continue;
            if (inc(excep[la], verb.key)) continue;

            var numbers = lakaras[la];
            // log('la:', la);

            var strongs = [];
            var weaks = [];
            for (var number in numbers) {
                // log('N', number);
                var forms = numbers[number];
                forms.forEach(function(form, idx) {
                    var purusha = nmap[idx.toString()];
                    // log('P', purusha);
                    var numper = [purusha, number].join('.');
                    // log(pada, numper, form);

                    var oStem = stemForForm(verb.key, verb.dhatu, form, gana, la, pada, numper);
                    var stem = oStem.stem;
                    // FIXME:
                    if (gana == 1) stems.push(stem);
                    else 'kuku'; //;
                    // if (number == '1') strongs.push(stem);
                    // else weaks.push(stem);
                });
            }
            var ustem = _.uniq(stems);
            var ustrong = _.uniq(strongs);
            var uweak = _.uniq(weaks);
            var errStem = ['eStem:', verb.key, verb.dhatu, pada, la, JSON.stringify(ustem)].join(' - ');
            var errStrong = ['eStrong:', verb.key, verb.dhatu, pada, la, JSON.stringify(ustrong)].join(' - ');
            var errWeak = ['eWeak:', verb.key, verb.dhatu, pada, la, JSON.stringify(uweak)].join(' - ');
            if (ustem.length > 1) throw new Error(errStem);
            if (ustrong.length > 1) throw new Error(errStrong);
            if (uweak.length > 1) throw new Error(errWeak);

            // var result = {dhatu: verb.dhatu, artha: verb.artha, la: la, gana: gana}; // artha: verb.artha,
            // var result = {dhatu: verb.dhatu, gana: gana, la: la};
            // var result = {dhatu: verb.dhatu, gana: gana};
            if (!result.lakara) result.lakara = [];
            var oLa = {la: la};
            if (ustem.length == 1) {
                oLa.stem = ustem[0];
            } else {
                oLa.strong = ustrong[0];
                oLa.weak = uweak[0];
            }
            result.lakara.push(oLa);
            // result.key = verb.key;
            angas.push(result);
            // log('R', result);
            // angas.push(JSON.stringify(result));
        }
    }
});

// log(tins);
log('===========');
p(angas.slice(0,9));
log(angas.length); // 859

// это la-pada-number из цикла, а в tins - свои
function stemForForm(vkey, dhatu, form, gana, la, pada, numper) {
    // log('====================', vkey);
    var key, val;
    // tins для данных параметров - можно зафризить
    var thema = (inc([1,4,6,10], gana)) ? 'a' : 'b';
    var stins = _.select(tins, function(tin) {
        key = Object.keys(tin)[0];
        val = tin[key];
        // log('T1', val.thema, 'T2', thema);
        if (val.thema) return val.la == la && val.pada == pada && val.np == numper && val.thema == thema;
        else return val.la == la && val.pada == pada && val.np == numper;
    });
    var oStems = [];
    stins.forEach(function(tin) {
        // log(222, tin);
        var term = Object.keys(tin)[0];
        // фильтры terms, специфичные для gana-lakara - иначе придется писать всю строку дважды-многажды
        if (gana == 1) {
            if (la == 'लट्' && pada == 'atm' && numper == 'pl.3' && term != 'न्ते') return;
            else if (la == 'लट्' && pada == 'par' && numper == 'pl.3' && term != 'न्ति') return;
        }
        // if (pada == 'atm' && numper == 'du.1') log('Term', numper, term);

        var re = new RegExp(term + '$');
        var stem = form.replace(re, '');
        // log('F=S', form, stem, stin);
        if (form == stem) return;

        // фильтры angas, по numper, или по -va-ma для первой ганы
        // добавить gana:
        // filter.gana(gana);
        stem = filter.gana(gana).call(this, dhatu, form, gana, la, pada, numper, stem, term);
        var oStem = {stem: stem, term: term, la: la, pada: pada, numper: numper};
        oStems.push(oStem);
    });
    var errTooMoreStems = ['too more stins:', form, pada, la, numper].join(' - ');
    if (oStems.length > 1 || oStems.length == 0) {
        log('ERR: ', vkey, dhatu, 'form:', form);
        p('stins', stins);
        p('oStems', oStems);
        throw new Error(errTooMoreStems);
    }
    // log(111, oStems);
    return oStems[0];
}


/*
  нужно же вычитать tins - а это sandhi, да еще внутренние.
  в результате должно быть :
  dhatu: [{gana: 1, stem: 'xxx'}, {gana: 2, strong: 'xxx', weak: 'yyy'}]
  и так для всех dhatu
*/

// log(verbs);

// log(tins)
