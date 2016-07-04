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
// var nmap = {'0': 'sg', '1': 'du', '2': 'pl'};
// var filter = require('../lib/filterGana');

//                pres. =P: impf; perf; aorist; =F: fut.1 fut2. =M: imp.m. pot.m; ben.m; cond.m;
var lakara = ['लट्', 'लङ्', 'लिट्', 'लुङ्', 'लुट्', 'लृट्', 'लोट्', 'विधिलिङ्', 'आशीर्लिङ्', 'लृङ्'];
// var tipnames = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
var parTips = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
var atmTips = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];

// if (tins.length == 0) {
//     log('/lib/tins_cache should have some values !');
//     return;
// }

var angas = [];
var excep = {'लट्': [], 'लङ्': [], 'लिट्': [], 'लुङ्': [], 'लुट्': [], 'लृट्': [], 'लोट्': [], 'विधिलिङ्': [], 'आशीर्लिङ्': [], 'लृङ्': []};
var nonuniq = {'लट्': [], 'लङ्': [], 'लिट्': [], 'लुङ्': ['भण्'], 'लुट्': [], 'लृट्': [], 'लोट्': [], 'विधिलिङ्': [], 'आशीर्लिङ्': [], 'लृङ्': []};

verbs.forEach(function(verb) {
    var errVerb = {};
    var dhatu = verb.dhatu;
    errVerb[dhatu] = [];
    // log('E', errVerb);
    var gana = verb.gana;
    if (gana != 1) return;
    // if (verb.key != 'Bez-Baye-BvAdiH-1366') return;
    // if (verb.key != 'BAm-kroDe-BvAdiH-630') return;
    // if (verb.key != 'BU-sattAyAm-BvAdiH-1') return; // अपनायीत्


    log('D', verb.key);
    var result = {gana: gana, dhatu: verb.dhatu, artha: verb.artha, lakara: []};
    var oLas = [];
    lakara.forEach(function(la) {
        // if (la != 'लिट्') return;        //
        // if (la != 'लट्') return;        //      if (la != 'लङ्') return;
        if (la != 'लुङ्') return;        //      if (la != 'लङ्' && la != 'लट्') return;
        var forms = [];
        var stems = [];
        var strongs = [];
        var weaks = [];
        var laforms = verb[la];
        if (!laforms) {
            // log(1, la, 'no la-forms<<<==========');
            return;
        }
        var oRes = stemForLakara(verb, laforms);
        // log(verb.key, stems);
    });
    // result.lakara = oLas;
    // p('Res', JSON.stringify(result));
    // angas.push(JSON.stringify(result));
});


// log(tins);
log('===========');
p(angas.slice(0,5));
log(angas.length); // liw: 925
// p(excep['लिट्']);
log('====== error dirty:');
log(excep['लिट्'].length);

function stemFromArray(strArr, verb, tin) {
    var strarr;
    var syms = [];
    var idx = 0;
    while(idx < 10) {
        strarr = strArr.map(function(stem) { return stem[idx]; });
        var uniq = _.uniq(strarr);
        if (uniq.length > 1) break;
        syms.push(uniq[0]);
        idx++;
    };
    var stem = syms.join('');
    var finDhatu = verb.dhatu.replace(/्$/, '').slice(-1); // убрал вираму
    // log(444, verb.dhatu, verb.dhatu.replace(/्$/, ''), verb.dhatu.replace(/्$/, '').slice(-1));
    var finStem = stem.replace(/्$/, '').slice(-1);
    // здесь проверять совпадение последних в цикле?
    // log(111, stem, 222, finDhatu, 333, finStem);
    if (finDhatu != finStem) {
        stem = stem.replace(/ि$/, '').replace(/स्$/, '').replace(/िस्$/, '').replace(/स$/, '').replace(/िष्$/, '').replace(/सा$/, '').replace(/िष$/, ''); //
    }
    // log(222, stem);
    finStem = stem.replace(/्$/, '').slice(-1);
    if (finDhatu != finStem) {
        // log('ERR dhatu:', verb.dhatu, 'stem:', stem,  verb.dhatu, 'fd', finDhatu, 'fs', finStem);
        // log('ERR dhatu:', verb.dhatu, 'stem:', stem,  verb.dhatu, laforms);
        // throw new Error();
    }
    log('stem:', stem, 'form', strArr[0]);
    var reStem = new RegExp('^' + stem);
    var reTin = new RegExp(tin + '$'); // это только для luN, aorist /// >>>>>>>> тут м.б. разные окончания, -ta или -wa
    // нужно вычислять stem и набор -tins - из семи наборов - по первому окончанию?
    // или сохранять весь набор - точнее, но объемнее
    // или вычислить свои семь и больше наборов
    var isuf = strArr[0].replace(reStem, '').replace(reTin, '');
    return {stem: stem, isuf: isuf};
}

function stemForLakara(verb, laforms) {
    // log('LA', laforms);
    // строки forms, отбрасываю sandhi-варианты (редкие), и по отдельности для par и atm
    // var strings = [];
    var parStrs = [];
    var atmStrs = [];
    parTips.forEach(function(tip) {
        var form2 = laforms[tip];
        if (!form2) return;
        var forms = form2.split('/');
        if (forms.length > 1) return;
        parStrs.push(form2);
    });
    atmTips.forEach(function(tip) {
        var form2 = laforms[tip];
        if (!form2) return;
        var forms = form2.split('/');
        if (forms.length > 1) return;
        atmStrs.push(form2);
    });
    var pstem, astem, psuf, asuf;
    if (parStrs.length == 0 && atmStrs.length == 0) return;
    // log('STRINGS', parStrs);
    // стем по строкам
    if (parStrs.length > 0) pstem = stemFromArray(parStrs, verb, 'त्'); // tip - только luN
    if (atmStrs.length > 0)  astem = stemFromArray(atmStrs, verb, 'त');

    var result = [];
    if (pstem) result.push(pstem);
    if (astem) result.push(astem);
    // здесь для аорист - выделить stem и s-suffix, i-s-ish
    // return {stem: stem, tips: JSON.stringify(tips)};
    log('res', result);
    return result;
}


// var tips = {};
// for (var tip in laforms) {
//     form2 = laforms[tip];
//     forms = form2.split('/');
//     if (forms.length > 1) continue;
//     // log(333, tip, form2);
//     var re = new RegExp('^' + stem);
//     var tin = form2.replace(re, '');
//     tips[tip] = tin;
// }
// log({stem: stem, tips: JSON.stringify(tips)});


// Мосфю 70 кв 238
// Унмвер, т34, а67, 103, 130, 260 ост М - высотные башни, кварита 238 2-корпус, 4 этаж.

// старое =============================

// это la-pada-number из цикла, а в tins - свои
function stemForForm_(vkey, dhatu, gana, set, form, la, tip) {
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
        if (term != '' && form == stem) return;
        // log('S0', stins);
        stem = filter.gana(gana).call(this, dhatu, form, gana, set, la, tip, stem, term);
        // var oStem = {stem: stem, term: term, la: la, pada: pada, numper: numper};
        stems.push(stem);
    });
    stems = _.uniq(stems);
    var shouldBeOneStem = [form, la, tip].join(' - ');
    var res = {};
    if (stems.length == 0) {
        return {err: form};
    } else if (stems.length > 1) {
        log('ERR one stem: ', vkey, dhatu, 'form:', form);
        p('stins', stins);
        p('oStems', stems);
        log('S=>', la, tip, form, stems);
        throw new Error(shouldBeOneStem);
    }
    // log(111, oStems);
    // lash should be a:
    var last = stems[0].slice(-1);
    if (!u.isConsonant(last)) return {err: form};
    return {stem: stems[0]};
}


// puts ============

var txt = angas.join('\n');
fs.unlinkSync(dhatuAngaPath);
// fs.writeFileSync(dhatuAngaPath, util.inspect(angas,  {depth: null}) , 'utf-8');
fs.writeFileSync(dhatuAngaPath, txt, 'utf-8');
