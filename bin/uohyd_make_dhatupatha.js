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
var salita = require('salita-component');

var dataPath = path.join(__dirname, '../uohyd/drpatel/generatedverbforms_deva20062016.csv');
var listForms = fs.readFileSync(dataPath).toString().split('\n');

var rawPath = path.join(__dirname, '../uohyd/rawcomplete.txt');
var dhatuPathaCachePath = path.join(__dirname, '../lib/dhatupatha_cache.txt');

fs.unlinkSync(dhatuPathaCachePath);

var list_logger = fs.createWriteStream(dhatuPathaCachePath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});

var dhatuList = fs.readFileSync(rawPath).toString().split('\n');

var padas = [];
var its = [];

// GANAS: भ्वादि, अदादि, जुहोत्यादि, दिवादि, स्वादि, तुदादि, रुधादि, तनादि, क्र्यादि, क्र्यादि, चुरादि
var gnum = {'भ्वा': '01', 'अ': '02', 'जु': '03', 'दि': '04', 'स्वा': '05', 'तु': '06', 'रु': '07', 'त': '08', 'क्र्या': '09', 'चु': '10'};
//  क्र्या॰

var pars = ['तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्'];
var atms = ['त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इट्', 'वहि', 'महिङ्'];


var wos = [];
var wcheck = {};
listForms.forEach(function(row, idz) {
    if (idz < 1000) return;
    // if (idz > 200000) return;
    var form, wosvara, la, tip, nums, wovowel;
    if (row == '') return;
    [form, wosvara, la, tip, nums] = row.split(',');
    var pada;
    if (inc(pars), tip) pada = 'प';
    else if (inc(atms), tip) pada = 'आ';
    var key = [wosvara, pada, nums].join('-');
    if (!wcheck[key]) {
        wcheck[key] = true;
        wosvara = wosvara.replace(/!र्$/, '!');
        wosvara = wosvara.replace(/!ष्$/, '!');
        wosvara = wosvara.replace(/!ङ्$/, '!');
        wosvara = wosvara.replace(/^ओ!/, '');
        wosvara = wosvara.replace(/^उ!/, '');
        wosvara = wosvara.replace(/^ई!/, '');
        wosvara = wosvara.replace(/^टुओ!/, '');
        var fin = wosvara.slice(-1);
        if (fin == '!') {
            wosvara = wosvara.slice(0,-1);
            fin = wosvara.slice(-1);
            if (u.isVowel(fin)) wovowel = wosvara.slice(0, -1);
        }
        var gana = nums.split('.')[0];
        var num = nums.split('.')[1];
        var owo = {wo: wosvara, gana: gana, pada: pada, num: num};
        if (wovowel) owo.wovowel = wovowel;
        wos.push(owo);
    }
});

var keys = _.keys(wos);
log('WOS:', keys.length);
// return;

var size = 0;
var selects = [];

wos.forEach(function(owo, idy) {
    var rows = [];
    dhatuList.forEach(function(row, idx) {
        row = row.trim();
        // if (idx > 100) return;
        if (row[0] == '#') return;
        if (row == '') return;

        row = row.replace(/	/g, '').replace(/।/g, ' ').replace('॥', '').replace(/\s+/g, ' ');
        var wsvara, artha, dhatus, gana, num, sanum, pada, set;
        [wsvara, artha, dhatus, gana, sanum, pada, set] = row.split('*');
        sanum = sanum.trim();
        // owo.sanum = sanum;
        num = salita.sa2slp(sanum);
        gana = gana.trim().replace('॰', '');
        gana = gnum[gana];
        pada = pada.trim().replace('॰', '');
        var padas = (pada == 'उ') ? ['प', 'आ'] : [pada];
        if (num != owo.num || gana != owo.gana) return; //  || !inc(padas, owo.pada)
        rows.push(row);
    });

    if (rows.length == 0) selects.push(owo);

    // owo
    var cleans = [];
    var dirties = [];
    if (owo.wo == 'जिवि') cleans.push(owo); // selects:

    rows.forEach(function(row) {
        var wsvara, artha, dhatus, gana, num, sanum, pada, set;
        [wsvara, artha, dhatus, gana, sanum, pada, set] = row.split('*');
        sanum = sanum.trim();
        // owo.sanum = sanum;
        num = salita.sa2slp(sanum);
        gana = gana.trim().replace('॰', '');
        gana = gnum[gana];
        pada = pada.trim().replace('॰', '');
        var padas = (pada == 'उ') ? ['प', 'आ'] : [pada];

        // log('owo:', owo);
        wsvara = wsvara.trim();
        set = set.trim();
        dhatus = dhatus.trim();
        var wosvara, dhatu;
        var darr = dhatus.split('(');

        if (/ऽ/.test(dhatus)) dhatu = wosvara = dhatus.split('ऽ')[1];
        else if (darr.length == 1) dhatu = wosvara = darr[0].trim();
        else {
            wosvara = darr[0].trim();
            dhatu = darr[1].trim().replace(')', ''); //.replace('!', '');
        }
        wsvara = wsvara.replace(/॑/g, '').replace(/ँ/g, '').replace(/॒/g, '');
        var wowovir = wosvara.replace(/्$/, ''); // wo-without-virama
        var dhatuvir = dhatu.replace(/्$/, ''); // wo-without-virama

        var excep = false;

        if (owo.wo == 'इण्') wosvara = owo.wo;
        else if (owo.wo == 'दृ') wosvara = owo.wo;
        else if (owo.wo == 'दृशि') wosvara = owo.wo;
        else if (owo.wo == 'णिजि') wosvara = owo.wo;
        else if (owo.wo == 'डुपच') wosvara = owo.wo;
        else if (owo.wo == 'श्लिष')  excep = true;
        else if (owo.wo == 'पिश') excep = true;
        else if (owo.wo == 'घृ') excep = true;
        else if (owo.wo == 'पुण') excep = true;
        else if (owo.wo == 'ञिमिदा') excep = true;
        else if (owo.wo == '') excep = true;
        else if (owo.wo == 'डुलभ') wosvara = owo.wo;
        else if (owo.wo == 'हाङ्') wosvara = owo.wo;
        else if (owo.wo == 'हाक्') wosvara = owo.wo;
        else if (owo.wo == '') wosvara = owo.wo;
        else if (owo.wo == '') wosvara = owo.wo;
        else if (owo.wo == '') wosvara = owo.wo;
        else if (owo.wo == 'लडि') {
            wosvara = owo.wo;
            dhatu = 'लण्';
        } else if (owo.wo == '') {
            wosvara = owo.wo;
            dhatu = '';
        } else if (owo.wo == '') {
            wosvara = owo.wo;
            dhatu = '';
        } else if (owo.wo == '') {
            wosvara = owo.wo;
            dhatu = '';
        } else if (owo.wo == '') {
            wosvara = owo.wo;
            dhatu = '';
        }

        if (owo.wo == wosvara || owo.wo == wowovir || owo.wo == wsvara || owo.wo == dhatu || owo.wo == dhatuvir || owo.wovowel == wosvara || owo.wovowel == dhatuvir) {
            var rowobj = {ws: wsvara, wo: wosvara, dhatu: dhatu, gana: gana, padas: padas, set: set, num: num};
            cleans.push(rowobj);
        } else {
            dirties.push(row);
        }
        if (excep) cleans.push(owo);

        // ================ записать файл cleans =====================================
        // owo : { wo: 'हह', gana: '03', pada: 'प', num: '0008'}
        cleans.forEach(function(clean) {
            var line;
            var lines = [];
            if (clean.dhatu) {
                clean.padas.forEach(function(pada) {
                    line = [clean.wsvara, clean.wosvara, clean.dhatu, clean.gana, pada, clean.set, clean.num].join('-');
                    lines.push(line);
                });
            } else {
                line = ['wo', clean.wosvara, clean.wosvara, clean.gana, '*', clean.num].join('-');
                lines = [line];
            }

            lines.forEach(function(line) {
                line = [line, '\n'].join('');
                list_logger.write(line);
                size += 1;
            });
        });
    });

    // selects:
    if (cleans.length == 0  && dirties.length > 0) {
        log('--->', owo);
        // log('CL:', cleans.length);
        log('DR:', dirties);
    }


});

// log('SEL:', selects);
log('SELs:', selects);


list_logger.end();
log('ok', size);

// SELs: [ { wo: 'जिवि',
//           gana: '01',
//           pada: 'प',
//           num: '0678',
//           dl: 0,
//           wovowel: 'जिव' } ]
// ok 0
