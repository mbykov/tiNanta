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

var dataPath = path.join(__dirname, '../uohyd/rawcomplete.txt');
var dhatuPathaCachePath = path.join(__dirname, '../lib/dhatupatha_cache.txt');

fs.unlinkSync(dhatuPathaCachePath);

var list_logger = fs.createWriteStream(dhatuPathaCachePath, {
    flags: 'a', // 'a' means appending (old data will be preserved)
    defaultEncoding: 'utf8'
});

var dhatuList = fs.readFileSync(dataPath).toString().split('\n');

var padas = [];
var its = [];

// GANAS: भ्वादि, अदादि, जुहोत्यादि, दिवादि, स्वादि, तुदादि, रुधादि, तनादि, क्र्यादि, क्र्यादि, चुरादि
var gnum = {'भ्वा': 1, 'अ': 2, 'जु': 3, 'दि': 4, 'स्वा': 5, 'तु': 6, 'रु': 7, 'त': 8, 'क्र्या': 9, 'चु': 10};
//  क्र्या॰

// अं॑सँ॑ * समाघाते * अंस (अंस्) * । चु॰ * ०४६० ॥ * उ॰ । * सेट्
dhatuList.forEach(function(row, idx) {
    // if (idx > 100) return;
    if (row[0] == '#') return;
    if (row == '') return;
    // if (/अधी/.test(row)) log(row);
    row = row.replace(/	/g, '').replace(/।/g, ' ').replace('॥', '').replace(/\s+/g, ' ');
    var wsvara, artha, dhatus, gana, num, pada, set;
    [wsvara, artha, dhatus, gana, num, pada, set] = row.split('*');
    wsvara = wsvara.trim();
    pada = pada.trim().replace('॰', '');
    gana = gana.trim().replace('॰', '');
    set = set.trim();
    dhatus = dhatus.trim();
   var wosvara, dhatu;
    var darr = dhatus.split('(');
    // if (/ऽ/.test(dhatus)) log('AN', dhatus);
    if (/ऽ/.test(dhatus)) dhatu = wosvara = dhatus.split('ऽ')[1];
    else if (darr.length == 1) dhatu = wosvara = darr[0].trim();
    else {
        wosvara = darr[0].trim();
        dhatu = darr[1].trim().replace(')', '').replace('!', '');
    }
    num = salita.sa2slp(num);
    // сейчас сам лишаю ударений, но можно все же читать из dhatus?
    wosvara = wsvara.replace(/॑/g, '').replace(/ँ/g, '').replace(/॒/g, '');

    // log(wsvara, 'a:',artha, 'd:', dhatu, 'g:', gana, 'n:', num, 'p', pada, 's:', set);
    var line = [wsvara, wosvara, dhatu, gana, pada, set, gnum[gana], num].join('-');
    line = [line, '\n'].join('');
    list_logger.write(line);

});

list_logger.end();
log('ok');
