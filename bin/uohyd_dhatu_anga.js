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

var dumpPath = path.join(__dirname, '../lib/uohyd_dump.js'); // db-file of verbs and verbforms
var dhatuAngaPath = path.join(__dirname, '../lib/dhatu_anga.js'); // result
var tinsPath = path.join(__dirname, '../lib/tins_cache.js');

var verbs = require(dumpPath);
var tins = require(tinsPath);
var nmap = {'0': 'sg', '1': 'du', '2': 'pl'};
var filter = require('../lib/filterGana');

// вычитаю -tins, собираю stems - д.б. ровно один stem для gana=1, la=law
// нужно прогнать все глаголы для всех gana-lakara

//                pres. =P: impf; perf; aorist; =F: fut.1 fut2. =M: imp.m. pot.m; ben.m; cond.m;
var lakara = ['लट्', 'लङ्', 'लिट्', 'लुङ्', 'लुट्', 'लृट्', 'लोट्', 'विधिलिङ्', 'आशीर्लिङ्', 'लृङ्'];

if (tins.length == 0) {
    log('/lib/tins_cache should have some values !');
    return;
}

var angas = [];
// var exceptions = ['भ्लाश्', 'भ्राश्', 'भ्रम्', 'घृण्ण्', 'श्रा', 'श्रु', 'श्वच्', 'अक्ष्', 'एज्', 'ग्रुच्', 'क्रम्', 'लष्', 'म्रुच्', 'नाथ्', 'क्षुद्', 'लुञ्ज्', 'इल्', 'क्षल्', 'जल्', 'हुल्', 'क्षीव्', 'मथ्', 'क्षिप्', 'क्षिप्', 'लुट्', 'जूर्', 'क्षिप्', 'क्षिप्', 'लुन्थ्', 'जूर्', 'क्षिप्', 'जर्ज्', 'जम्भ्', 'कुप्', 'लिह्', 'क्षिप्', 'लुन्थ्', 'लाज्', 'मा', 'जूर्', 'कुस्म्', 'ह्लग्', 'हिंस्', 'ह्री', 'इन्द्', 'हुल्', 'क्षीव्', 'ह्री', 'हृ', 'हन्', 'ह्वल्', 'इन्द्', 'इट्', 'इट्', 'हृ', 'हुल्', 'हृ', 'हुल्', 'क्षीव्', 'हय्', 'हृ', 'हुल्', 'क्षुद्', 'रङ्घ्', 'रुण्ठ्', 'स्रु', 'तक्ष्', 'टीक्'];

var exceptions = ['BlAS-dIptO-BvAdiH-1237', 'BrAS-dIptO-BvAdiH-1236', 'Bram-calane-BvAdiH-1278', 'GfR-grahaRe-BvAdiH-623', 'SrA-pAke-BvAdiH-1232', 'Sru-SravaRe-BvAdiH-1452', 'Sru-gatO-BvAdiH-1447', 'Svac-gatO-BvAdiH-235', 'akz-saNGAte-BvAdiH-989', 'akz-vyAptO-BvAdiH-988', 'ej-kampane-BvAdiH-326', 'gruc-steyakaraRe-BvAdiH-281', 'kram-pAdavikzepe-BvAdiH-675', 'laz-kAntO-BvAdiH-1377', 'mruc-gatO-BvAdiH-273', 'nAT-ESvarye-BvAdiH-11', 'nAT-upatApe-BvAdiH-10', 'nAT-yAcYAyAm-BvAdiH-12', 'raG-gatO-BvAdiH-145', 'ruW-Alasye-BvAdiH-491', 'ruW-gatO-BvAdiH-495', 'ruW-gatipratiGAte-BvAdiH-492', 'sru-gatO-BvAdiH-1448', 'takz-tanUkaraRe-BvAdiH-990', 'wIk-gatO-BvAdiH-140', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

var excep = {};
// excep['लट्'] = ['BlAS-dIptO-BvAdiH-1237', 'BrAS-dIptO-BvAdiH-1236', 'Bram-calane-BvAdiH-1278', 'GfR-grahaRe-BvAdiH-623', 'SrA-pAke-BvAdiH-1232', 'Sru-SravaRe-BvAdiH-1452', 'Sru-gatO-BvAdiH-1447', 'Svac-gatO-BvAdiH-235', 'akz-saNGAte-BvAdiH-989', 'akz-vyAptO-BvAdiH-988', 'ej-kampane-BvAdiH-326', 'gruc-steyakaraRe-BvAdiH-281', 'kram-pAdavikzepe-BvAdiH-675', 'laz-kAntO-BvAdiH-1377', 'mruc-gatO-BvAdiH-273', 'nAT-ESvarye-BvAdiH-11', 'nAT-upatApe-BvAdiH-10', 'nAT-yAcYAyAm-BvAdiH-12', 'raG-gatO-BvAdiH-145', 'ruW-Alasye-BvAdiH-491', 'ruW-gatO-BvAdiH-495', 'ruW-gatipratiGAte-BvAdiH-492', 'sru-gatO-BvAdiH-1448', 'takz-tanUkaraRe-BvAdiH-990', 'wIk-gatO-BvAdiH-140', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

excep['लट्'] = ['DmA-Sabde-BvAdiH-1429', 'BlAS-dIptO-BvAdiH-1237', 'BrAS-dIptO-BvAdiH-1236', 'Bram-calane-BvAdiH-1278', 'DmA-agnisaMyoge-BvAdiH-1428', 'GfR-grahaRe-BvAdiH-623', 'GrA-ganDopAdAne-BvAdiH-1427', 'Sru-SravaRe-BvAdiH-1452', 'Sru-gatO-BvAdiH-1447', 'Svac-gatO-BvAdiH-235', 'akz-saNGAte-BvAdiH-989', 'akz-vyAptO-BvAdiH-988', 'ej-kampane-BvAdiH-326', 'gA-gatO-BvAdiH-1462', 'gruc-steyakaraRe-BvAdiH-281', 'kram-pAdavikzepe-BvAdiH-675', 'laz-kAntO-BvAdiH-1377', 'mnA-aByAse-BvAdiH-1432', 'mruc-gatO-BvAdiH-273', 'nAT-ESvarye-BvAdiH-11', 'nAT-upatApe-BvAdiH-10', 'nAT-yAcYAyAm-BvAdiH-12', 'pA-pAne-BvAdiH-1426', 'pan-vyavahAre-BvAdiH-628', 'raG-gatO-BvAdiH-145', 'ruW-Alasye-BvAdiH-491', 'ruW-gatO-BvAdiH-495', 'ruW-gatipratiGAte-BvAdiH-492', 'sru-gatO-BvAdiH-1448', 'takz-tanUkaraRe-BvAdiH-990', 'wIk-gatO-BvAdiH-140', 'zWA-gatinivfttO-BvAdiH-1430', '', '', '', '', '', '', ''];

// GrA - и все на -A - нет долгой -A во всех практически формах - FIXME: проверить, м.б. все можно восстановить
excep['लङ्'] = ['gurd-krIqAyAm-BvAdiH-45', 'BlAS-dIptO-BvAdiH-1237', 'BrAS-dIptO-BvAdiH-1236', 'Bram-calane-BvAdiH-1278', 'DmA-Sabde-BvAdiH-1429', 'DmA-agnisaMyoge-BvAdiH-1428', 'GrA-ganDopAdAne-BvAdiH-1427', 'Sru-SravaRe-BvAdiH-1452', 'Sru-gatO-BvAdiH-1447', 'akz-saNGAte-BvAdiH-989', 'akz-vyAptO-BvAdiH-988', 'gA-gatO-BvAdiH-1462', 'haw-dIptO-BvAdiH-434', 'kram-pAdavikzepe-BvAdiH-675', 'laz-kAntO-BvAdiH-1377', 'mnA-aByAse-BvAdiH-1432', 'nAT-ESvarye-BvAdiH-11', 'nAT-upatApe-BvAdiH-10', 'nAT-yAcYAyAm-BvAdiH-12', 'pA-pAne-BvAdiH-1426', 'pac-pAke-BvAdiH-1531', 'takz-tanUkaraRe-BvAdiH-990', 'zWA-gatinivfttO-BvAdiH-1430', 'zwuB-stamBe-BvAdiH-562', 'pan-vyavahAre-BvAdiH-628', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

verbs.forEach(function(verb) {
    var gana = verb.gana;
    if (gana != 1) return;
    // if (verb.key != 'Bez-Baye-BvAdiH-1366') return;
    log('D', verb.key);
    var result = {gana: gana, dhatu: verb.dhatu, artha: verb.artha};
    var oLas = [];
    lakara.forEach(function(la) {
        var stems = [];
        var strongs = [];
        var weaks = [];
        // if (la != 'लट्') return;
        // if (la != 'लङ्') return;
        if (la != 'लङ्' && la != 'लट्') return;
        if (inc(excep[la], verb.key)) return;
        var laforms = verb[la];
        // log(1, la, laforms);
        for (var tip in laforms) {
            var form2 = laforms[tip];
            // log(333, tip, form2)
            var forms = form2.split('/');
            forms.forEach(function(form) {
                var tipStem = stemForForm(verb.key, verb.dhatu, gana, form, la, tip);
                if (!tipStem) return;
                if (gana == 1) stems.push(tipStem);
                // else if (number == '1') strongs.push(stem);
                // else weaks.push(stem);
            });
        }
        var ustem = _.uniq(stems);
        var ustrong = _.uniq(strongs);
        var uweak = _.uniq(weaks);
        var errStem = ['uniq eStem:', verb.key, verb.dhatu, la, JSON.stringify(ustem)].join(' - ');
        var errStrong = ['uniq eStrong:', verb.key, verb.dhatu, la, JSON.stringify(ustrong)].join(' - ');
        var errWeak = ['uniq eWeak:', verb.key, verb.dhatu, la, JSON.stringify(uweak)].join(' - ');
        if (ustem.length > 1) throw new Error(errStem);
        if (ustrong.length > 1) throw new Error(errStrong);
        if (uweak.length > 1) throw new Error(errWeak);

        if (!result.lakara) result.lakara = [];
        var oLa = {la: la};
        if (ustem.length == 1) {
            oLa.stem = ustem[0];
        } else {
            oLa.strong = ustrong[0];
            oLa.weak = uweak[0];
        }
        oLas.push(oLa);
    });
    result.lakara = oLas;
    // result.key = verb.key;
    // angas.push(result);
    // log('R', result);
    angas.push(JSON.stringify(result));
});


// log(tins);
log('===========');
p(angas.slice(0,5));
log(angas.length); // 859

// это la-pada-number из цикла, а в tins - свои
function stemForForm(vkey, dhatu, gana, form, la, tip) {
    // log('====================', form, tip);
    // tins only for this tip:
    var stins = _.select(tins, function(tin) { return tin.la == la && tin.tip == tip}); // только подходящие tips
    var stems = [];
    stins.forEach(function(tin) {
        // log(222, tin);
        if (tin.thema) {
            var thema = (inc([1,4,6,10], gana)) ? 'a' : 'b';
            if (tin.thema != thema) return;
        }
        var term = tin.tin;
        // фильтры terms, специфичные для gana-lakara-tip - иначе придется писать всю строку дважды-многажды
        var re = new RegExp(term + '$');
        var stem = form.replace(re, '');
        // log('F=S', form, stem, term);
        if (form == stem) return;
        // log('S0', stins);
        stem = filter.gana(gana).call(this, dhatu, form, gana, la, tip, stem, term);
        // var oStem = {stem: stem, term: term, la: la, pada: pada, numper: numper};
        stems.push(stem);
    });
    // log('S=>', la, tip, form, stems);
    var shouldBeOneStem = [form, la, tip].join(' - ');
    if (stems.length > 1) {
        log('ERR: ', vkey, dhatu, 'form:', form);
        p('stins', stins);
        p('oStems', stems);
        throw new Error(shouldBeOneStem);
    }
    // log(111, oStems);
    return stems[0];
}


// puts ============

var txt = angas.join('\n');
fs.unlinkSync(dhatuAngaPath);
// fs.writeFileSync(dhatuAngaPath, util.inspect(angas,  {depth: null}) , 'utf-8');
fs.writeFileSync(dhatuAngaPath, txt, 'utf-8');
