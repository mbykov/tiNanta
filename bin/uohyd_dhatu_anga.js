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
var tips = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];
// var parTips = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
// var atmTips = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];

// if (tins.length == 0) {
//     log('/lib/tins_cache should have some values !');
//     return;
// }

var angas = [];
var excep = {'लट्': [], 'लङ्': [], 'लिट्': [], 'लुङ्': [], 'लुट्': [], 'लृट्': [], 'लोट्': [], 'विधिलिङ्': [], 'आशीर्लिङ्': [], 'लृङ्': []};
var nonuniq = {'लट्': [], 'लङ्': [], 'लिट्': [], 'लुङ्': ['भण्'], 'लुट्': [], 'लृट्': [], 'लोट्': [], 'विधिलिङ्': [], 'आशीर्लिङ्': [], 'लृङ्': []};
var uniqStips = [];

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
        if (!oRes) return;
        // эту нужно загонять в la
        if (!inc(uniqStips, oRes.stips)) uniqStips.push(oRes.stips);
    // log(verb.key, stems);
    });
    // result.lakara = oLas;
    // p('Res', JSON.stringify(result));
    // angas.push(JSON.stringify(result));
});

log(uniqStips);


// log(tins);
log('===========');
p(angas.slice(0,5));
log(angas.length); // liw: 925
// p(excep['लिट्']);
log('====== error dirty:');
log(excep['लिट्'].length);

function stemForLakara(verb, laforms) {
    // log('LA', laforms);
    // строки forms, отбрасываю sandhi-варианты (редкие), и по отдельности для par и atm
    var tipForms = [];
    tips.forEach(function(tip) {
        var form2 = laforms[tip];
        if (!form2) return;
        var forms = form2.split('/');
        if (forms.length > 1) return;
        var obj = {};
        obj[tip] = form2;
        tipForms.push({tip: tip, form: form2});
    });
    if (tipForms.length == 0) return;
    // log('TIParr', tipForms);
    var res = stemAndTins(tipForms, verb); // tip - только luN
    // log('res', res);
    return res;
}

function stemAndTins(tipForms, verb) {
    var column;
    var syms = [];
    var idx = 0;
    while(idx < 10) {
        column = tipForms.map(function(obj) { return obj.form[idx]; });
        var uniq = _.uniq(column);
        if (uniq.length > 1) break;
        syms.push(uniq[0]);
        idx++;
    };
    var stem = syms.join('');
    var reStem = new RegExp('^' + stem);
    log('STEM', stem);
    var stips = {};
    tipForms.forEach(function(obj) {
        var stin = obj.form.replace(reStem, '');
        stips[obj.tip] = stin;
    });
    var json = JSON.stringify(stips);
    return {stem: stem, stips: json};
}


// Мосфю 70 кв 238
// Унмвер, т34, а67, 103, 130, 260 ост М - высотные башни, кварита 238 2-корпус, 4 этаж.

// старое =============================


// puts ============

return;

var txt = angas.join('\n');
fs.unlinkSync(dhatuAngaPath);
// fs.writeFileSync(dhatuAngaPath, util.inspect(angas,  {depth: null}) , 'utf-8');
fs.writeFileSync(dhatuAngaPath, txt, 'utf-8');

    // var finDhatu = verb.dhatu.replace(/्$/, '').slice(-1); // убрал вираму
    // // log(444, verb.dhatu, verb.dhatu.replace(/्$/, ''), verb.dhatu.replace(/्$/, '').slice(-1));
    // var finStem = stem.replace(/्$/, '').slice(-1);
    // // здесь проверять совпадение последних в цикле?
    // // log(111, stem, 222, finDhatu, 333, finStem);
    // if (finDhatu != finStem) {
    //     stem = stem.replace(/ि$/, '').replace(/स्$/, '').replace(/िस्$/, '').replace(/स$/, '').replace(/िष्$/, '').replace(/सा$/, '').replace(/िष$/, ''); //
    // }
    // // log(222, stem);
    // finStem = stem.replace(/्$/, '').slice(-1);
    // if (finDhatu != finStem) {
    //     // log('ERR dhatu:', verb.dhatu, 'stem:', stem,  verb.dhatu, 'fd', finDhatu, 'fs', finStem);
    //     // log('ERR dhatu:', verb.dhatu, 'stem:', stem,  verb.dhatu, laforms);
    //     // throw new Error();
    // }
    // log('stem:', stem, 'form', strArr[0]);
    // var reStem = new RegExp('^' + stem);
    // var reTin = new RegExp(tin + '$'); // это только для luN, aorist /// >>>>>>>> тут м.б. разные окончания, -ta или -wa
    // // нужно вычислять stem и набор -tins - из семи наборов - по первому окончанию?
    // // или сохранять весь набор - точнее, но объемнее
    // // или вычислить свои семь и больше наборов
    // var isuf = strArr[0].replace(reStem, '').replace(reTin, '');
    // return {stem: stem, isuf: isuf};
