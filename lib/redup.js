/*
  if wordform has reduplication in stem?
*/

var _ = require('underscore');
var Const = require('./constants');
var u = require('./utils');
var debug = (process.env.debug == 'true') ? true : false;

module.exports = redup();

function redup() {
    if (!(this instanceof redup)) return new redup();
    return this;
}

// hu, BI, dA, DA, hA, cit, Bf, pfc,
redup.prototype.check = function(flex) {
    var that = this;
    if (flex.la == 'lin') return; // проверить при работе с lin
    var stem = flex.stem;
    if (this.lan) {
        var lan = this.lan;
        var aug = lan.aug;
        if (aug) {
            var re = new RegExp('^' + aug);
            flex.stem = stem.replace(re, '');
        }
    }
    (u.startWithVowel(flex.stem)) ? redupVow.call(this, flex) : redupCons.call(this, flex);
}

function redupCons(flex) {
    if (canNotBeRedup(flex)) return; // log('========= CAN NOT BE REDUP =========');
    var that = this;
    var stem = flex.stem;
    stem = stem.replace(/ि$/, '');
    var dhatu;
    var dhatus = [];
    var cons = u.onlyCons(stem);
    var first = cons[0];
    var second = cons[1];
    var vows = u.onlyVowels(stem);
    var weak = vows[0];
    var weakLong = Const.shortlong[weak];
    var weaks = [weak, weakLong];
    var guna = vows[1];
    var idx = _.indexOf(stem, second, 1); // 1 is for first == second
    var idxStrong;
    if (idx == 1) {
        var weak = ''; // a-short
        if (vows[0]) {
            guna = vows[0];
            idxStrong = _.indexOf(stem, guna);
        } else {
            idxStrong = stem.length;
        }
    } else {
        if (guna) idxStrong = _.indexOf(stem, guna, 2);
        else idxStrong = stem.length;
    }
    var aug = stem.slice(0, idx);
    var head = stem.slice(idx, idxStrong);
    //head = head.replace(/्$/, ''); // remove virama
    var tail = stem.slice(idxStrong + 1);
    //var sum = [aug, head, tail].join('');

    if (stem[1] == 'े') { // e-case - to if-else?
        dhatu = [first, second, Const.virama].join('');
        dhatus.push(dhatu);
    }

    if (/र/.test(tail)) head = [head, tail].join('');
    if (/र/.test(head)) {
        head = head.replace(/्$/, ''); // remove virama
        dhatu = head.replace(/ार$/, 'ृ').replace(/र$/, 'ृ').replace(/्ृ/, 'ृ');
        dhatus.push(dhatu);
        dhatu = head.replace(/ार$/, 'ॄ').replace(/र$/, 'ॄ').replace(/्ृ/, 'ृ');
        dhatus.push(dhatu);
        dhatu = head.replace(/र्/, 'ृ').replace(/र$/, 'ॄ').replace(/्ृ/, 'ृ'); // pfc, ra in the middle of a stem
        dhatu = u.addVirama(dhatu);
        dhatus.push(dhatu);
        if (weak == 'ि') { // lit_par_krI
            head = head.replace(/िय$/, '').replace(/ि$/, '');
            dhatu = [head, 'ि'].join('');
            dhatus.push(dhatu);
            dhatu = [head, 'ी'].join('');
            dhatus.push(dhatu);
        }
    } else if (!weak && guna == 'ृ') {
        dhatu = [head, guna, tail].join('');
        dhatu = u.addVirama(dhatu);
        dhatus.push(dhatu);
    } else if (weak == 'ि' && guna == 'ृ') {
        dhatu = [head, guna, tail].join('');
        dhatus.push(dhatu);
    } else if (guna == 'ू' && tail[0] == 'व') { // lit_par_BU_sg.3 जु
        dhatu = [head, guna].join('');
        dhatus.push(dhatu);
    } else if (Const.longshort[guna] == weak) {
        _.each(weaks, function(vow) { // guna - jIv
            dhatu = [head, vow, tail].join('');
            dhatu = u.addVirama(dhatu);
            dhatus.push(dhatu);
        });
    } else if (guna == weak) {
        _.each(weaks, function(vow) { // guna - jIv
            dhatu = [head, vow, tail].join('');
            dhatu = u.addVirama(dhatu);
            dhatus.push(dhatu);
        });
    } else if (guna && u.isIN(u.aguna(guna), weak)) {
        // FIXME: weakLong
        dhatu = [head, weak, tail].join('');
        dhatu = u.addVirama(dhatu);
        dhatus.push(dhatu);
        if (weak == 'ि') {
            dhatu = dhatu.replace('ि', 'ी'); //I-long -> three_lat_par_BI_ // FIXME: другие долгие тоже нужны, кроме И?
        }
        dhatus.push(dhatu);
    } else if (weak == 'ु' && cons.slice(-1) == 'व') { // three_lat_par_hu_pl.3
        dhatu = [head[0], weak].join('');
        dhatus.push(dhatu);
        dhatus.push(dhatu);
    } else if (weak == 'ि' && cons.slice(-1) == 'य') { // three_lat_par_hu_pl.3
        dhatu = [head[0], 'ी'].join('');
        dhatus.push(dhatu);
        dhatus.push(dhatu);
    } else if ((weak == '' || weak == Const.A) && (!guna || guna  == 'ी')) { // flex is 'ौ'  => Roots ending in ā, e, ai, or o become au, so dA=dE=de=do
        if (aug == 'ज' && head == 'ह्व') { // hve-exception
            dhatu = 'ह्वे';
            dhatus.push(dhatu);
        }
        var dhatuEnds = ['ा', 'ै', 'ो', 'े', '']; // A, E, o, e
        head = head.replace(Const.virama, '');
        _.each(dhatuEnds, function(vow) { // guna - jIv
            dhatu = [head, vow].join('');
            dhatu = u.addVirama(dhatu);
            dhatus.push(dhatu);
        });
        dhatu = u.addVirama(dhatu);
        dhatu = dhatu.replace(/ञ्$/, 'न्');
        dhatus.push(dhatu);
    } else if (!guna && weak == 'ि') { // ex. biBitah after deleting i
        head = head.replace(/्य$/, '').replace(/य$/, ''); //.replace(/ाय$/, '');
        _.each(weaks, function(vow) { // guna - jIv
            dhatu = [head, vow, tail].join('');
            dhatu = u.addVirama(dhatu);
            dhatus.push(dhatu);
        });
    } else {
        //log('ELSE', flex.keys);
    }

    // EXCEPTIONS
    dhatus = _.uniq(dhatus);
    flex.dhatus = dhatus;
    u.suffixes.call(that, flex, 'redup');
}

function canNotBeRedup(flex) {
    var cons = u.onlyCons(flex.stem);
    var first = cons[0];
    var second = cons[1];
    var aspirated = Const.voiced_asp.concat(Const.unvoiced_asp);
    var unaspirated = Const.voiced.concat(Const.unvoiced);

    if (flex.stem[1] == 'े') return false; // e-case
    if (first == second) return false;
    else if (first == 'ज' && u.isIN(['ह', 'घ', 'ख'], second) ) return false;
    else if (first == 'च' && 'ख' == second ) return false;
    else if (u.isIN(Const.guttural, second)) { //guttural to palatal
        var idx_gut = _.indexOf(Const.guttural, second);
        if (Const.palatal[idx_gut] == first) return false;
    } else if (u.isIN(aspirated, cons[1])) {
        // Second cons - aspirated to unasp
        var iasp = _.indexOf(aspirated, cons[1]);
        var iuna = _.indexOf(unaspirated, cons[0]);
        if (iasp == iuna) return false;
    }
    return true;
}

function redupVow(flex) {
    var that = this;
    if (!flex.guna) flex.weak = true;
    var stem = flex.stem;
    stem = stem.replace(/ि$/, ''); // FIXME: эту штуку нужно убить везде, и снова прогнать тесты - путаются lat, lan, lit
    var vow = stem[0];
    var dhatu;
    var dhatus = [];
    var cons = u.onlyCons(stem);
    var first = cons[0];
    var second = cons[1];
    var vows = u.onlyVowels(stem);
    var weak = vows[0];
    var weakLong = Const.shortlong[weak];
    var weaks = [weak, weakLong];
    var guna = vows[1];
    var idx = _.indexOf(stem, second, 1); // 1 is for first == second
    var head;
    var tail;

    if (vow == 'आ') {
        tail = stem.replace(/^आ/, '');
        var heads = ['आ', 'अ'];
        _.each(heads, function(head) {
            dhatu = [head, tail].join('');
            dhatu = u.addVirama(dhatu);
            dhatus.push(dhatu);
        });
    }

    var uv = stem.slice(0,2); // samprasarana
    if (flex.guna && uv == 'उव') {
        tail = stem.replace(/^उव/, '').replace(Const.A, '');
        head = 'व';
    } else if (flex.weak && vow == 'ऊ') {
        tail = stem.replace(/^उव/, '').replace(Const.A, '').replace(/^ऊ/, '');
        head = 'व';
    }
    if (flex.guna && vow == 'इ') {
        tail = stem.replace(/^इये/, '');
        head = 'इ';
    } else if (flex.weak && vow == 'ई') {
        tail = stem.replace(/^ई/, '');
        head = 'इ';
    }

    if (head) {
        dhatu = [head, tail].join('');
        dhatu = u.addVirama(dhatu);
        dhatus.push(dhatu);
    }

    flex.dhatus = dhatus;
    u.suffixes.call(that, flex, 0);
}


function log() { console.log.apply(console, arguments) }
