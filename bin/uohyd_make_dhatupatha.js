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
var gnum = {'भ्वा': '01', 'अ': '02', 'जु': '03', 'दि': '04', 'स्वा': '05', 'तु': '06', 'रु': '07', 'त': '08', 'क्र्या': '09', 'चु': '10'};
//  क्र्या॰

// अं॑सँ॑ * समाघाते * अंस (अंस्) * । चु॰ * ०४६० ॥ * उ॰ । * सेट्
// ओँ॑प्या॑यीँ॒  * वृद्धौ    * प्याय्    *  । भ्वा॰ *  ०५६१ ॥  *   आ॰ ।   *  सेट्
var size = 0;
dhatuList.forEach(function(row, idx) {
    row = row.trim();
    // if (idx > 100) return;
    if (row[0] == '#') return;
    if (row == '') return;

    row = row.replace(/	/g, '').replace(/।/g, ' ').replace('॥', '').replace(/\s+/g, ' ');
    var wsvara, artha, dhatus, gana, num, pada, set;
    [wsvara, artha, dhatus, gana, num, pada, set] = row.split('*');
    wsvara = wsvara.trim();
    pada = pada.trim().replace('॰', '');
    var padas = (pada == 'उ') ? ['प', 'आ'] : [pada];
    gana = gana.trim().replace('॰', '');
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
    num = salita.sa2slp(num);
    // сейчас сам лишаю ударений, но можно все же читать из dhatus?
    // wosvara = wsvara.replace(/॑/g, '').replace(/ँ/g, '').replace(/॒/g, '');
    // log(wsvara, 'a:',artha, 'd:', dhatu, 'g:', gana, 'n:', num, 'p', pada, 's:', set);
    // if (wosvara == 'बल्ह्') log('RRR', row, 333, darr);

    padas.forEach(function(p) {
        var line = [wsvara, wosvara, dhatu, gana, p, set, gnum[gana], num].join('-');
        line = [line, '\n'].join('');
        list_logger.write(line);
        // if (wosvara == 'बल्ह') log('RRR', line);
        size += 1;
    });

});

list_logger.end();
log('ok', size);
