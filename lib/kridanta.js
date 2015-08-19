/*
  kridanta suffixes
*/

var _ = require('underscore');
var Const = require('./constants');
var u = require('./utils');
var sandhi = require('sandhi');

module.exports = krit();

function krit() {
    if (!(this instanceof krit)) return new krit();
    return this;
}

krit.prototype.check = function(flex) {

    flex.stems = null;
    // tric.call(this, flex);
    tavyat.call(this, flex);
    kta.call(this, flex);
    // ktavatu.call(this, flex);
    // lyut.call(this, flex);

    // return; // из-за flex.morph - это от объединения flex
    // taddhita_thak.call(this, flex);
    taddhita_tva.call(this, flex);
    // taddhita_tal.call(this, flex); // <==== тут есть ERR
    taddhita_matup.call(this, flex);
}

function makeQuery(dhatus, param) {
    var that = this;
    var query;
    _.each(dhatus, function(dhatu) {
        query = {type: param.type, query: dhatu};
        if (param.anit) query.anit = true;
        if (param.taddhita) query.taddhita = param.taddhita;
        if (param.kridanta) query.krit = param.kridanta;
        if (param.flex) {
            query.key = param.flex.key;
            query.gend = param.flex.gend;
        }
        that.queries.push(query);
    });
}

function makeDhatuNew(param) {
    var that = this;
    _.each(param.dhatus, function(dhatu) {
        var weaks = u.aguna(dhatu);
        //log('Ws', weaks);
        _.each(weaks, function(weak) {
            var exceps = u.excepStr(weak, 'dhatu');
            // log('Exs', exceps);
            makeQuery.call(that, exceps, param);
        });
    });
}

function kta(flex) {
    if (flex.var != 'a') return;
    // u.p(flex, '=kta=');
    var stem = flex.stem;
    // var pratyayaT = ['त', 'ट', 'ध', 'ढ'];
    // var pratyayaN = ['न', 'ण'];
    var stems = [];
    var clean = stem.replace(/त$/, '').replace(/ट$/, '').replace(/ध$/, '').replace(/ढ$/, '').replace(/न$/, '').replace(/ण$/, '');
    if (stem == clean) return;

    clean = clean.replace(/यि$/, '');
    stems.push(u.addVirama(clean));
    clean = clean.replace(/ि$/, '');
    stems.push(u.addVirama(clean));
    var dhatus = _.uniq(_.compact(stems));

    var last = stem.slice(-1);
    // dhatus.push(sandhi.del(stem, last, 'त'));
    dhatus.push(sandhi.int(stem, last, 'त'));
    // log('I-STEM', stem, clean, 'last', last);

    dhatus = _.uniq(_.compact(_.flatten(dhatus)));
    // log('==kta-dhatus==', dhatus);
    if (u.empty(dhatus)) return;
    var param = {type: 'dhatu', kridanta: 'kta', dhatus: dhatus, flex: flex};
    makeDhatuNew.call(this, param);
}

/*
 vraj varjitavyaH
 rUc rocitavyaH
 */

function tavyat(flex) {
    if (!u.isIN(['a', 'A'], flex.var)) return; // в morpheus.js для всех krit
    // u.p(flex);
    var that = this;
    var teststem = flex.stem.replace(/व्य$/,''); // कथ यितव्यः
    if (flex.stem == teststem) return;
    var dhatus = [];

    var clean = teststem.replace(/्यि.$/,'').replace(/यि.$/,'').replace(/ि.$/,'');
    clean = clean.replace(/ेत/, ''); // etavya
    // log('clean', flex.stem, teststem, clean);

    if (teststem != clean) {
        var stem_i = [clean, 'ि'].join('');
        var stem_I = [clean, 'ी'].join('');
        var stem_y = [clean, 'य्'].join('');
        var stem_vir = [clean, Const.virama].join('');
        var istems = [clean, stem_i, stem_I, stem_y, stem_vir];
        dhatus = _.map(istems, function(stem) { return stem});
    } else if (teststem == 'एत') { // only 'e-i'
        dhatus = ['इ'];
    } else {
        var last = clean.slice(-1);
        // dhatus = sandhi.del(clean, last, 'त');
        dhatus = sandhi.int(clean, last, 'त');
    }
    // log('krit-tavyat-dhatus', dhatus);
    if (u.empty(dhatus)) return;
    var param = {type: 'dhatu', kridanta: 'tavyat', dhatus: dhatus, flex: flex};
    makeDhatuNew.call(this, param);
}

function lyut(flex) {
    if (flex.var != 'a') return;
    // var dhatus = _.map(Const.N, function(pratyaya) { return sandhi.del(flex.stem, pratyaya, ''); });
    var dhatus = _.map(Const.N, function(pratyaya) { return sandhi.int(flex.stem, pratyaya, ''); });
    dhatus = _.flatten(dhatus);
    dhatus = _.map(dhatus, function(dhatu) { return u.addVirama(dhatu); });

    if (u.empty(dhatus)) return;
    var param = {type: 'dhatu', kridanta: 'lyut', dhatus: dhatus, flex: flex};
    makeDhatuNew.call(this, param);
}

function taddhita_tva(flex) {
    // if (flex.var != 'a') return;
    if (flex.gend != 'neut') return;
    var stem = u.replaceEnd(flex.stem, 'त्व', '');
    if (stem == flex.stem) return;
    var query = {type: 'nama', query: stem, tadd: 'tva', gend: flex.gend, key: flex.key}; //  flex: flex
    // u.p(flex);
    // u.u(query);
    this.queries.push(query);
}

function taddhita_matup(flex) {
    if (flex.var != 'at') return;
    var stem = flex.stem.replace(/वत्$/, '').replace(/मत्$/, '');
    if (stem == flex.stem) return;
    var query = {type: 'nama', query: stem, tadd: 'matup', morph: flex.morph};
    this.queries.push(query);
}

function taddhita_tal(flex) {
    if (flex.var != 'a') return;
    if (!flex.morph.fem) return;
    var stem = u.replaceEnd(flex.stem, 'त', '');
    if (stem == flex.stem) return;
    var query = {type: 'nama', query: stem, tadd: 'tal', morph: flex.morph.fem};
    this.queries.push(query);
}

function taddhita_thak(flex) {
    // FIXME: make tadd g=_thak_vftta => Ar, ar -> f, дописать в u.aguna
    if (flex.var != 'a') return;
    var stem = u.replaceEnd(flex.stem, 'िक', '');
    if (stem == flex.stem) return;
    var that = this;
    var agunas = u.aguna(stem);
    _.each(agunas, function(aguna) {
        var query = {type: 'nama', query: aguna, tadd: 'thak', morph: flex.morph};
        that.queries.push(query);
    });
}

function ktavatu(flex) {
    // if (flex.var != 'a') return; // FIXME: нужен аналог
    if (flex.stem == flex.stem.replace('वत्','')) return;
    var kri = {name: 'kta', term: 'तवत्'};
    //makeDhatu.call(this, flex.stem, kri);
}

function tric(flex) {
    if (flex.var != 'f') return;
    u.p(flex);
    if (flex.stem == flex.stem.replace('ृ','')) return;
    var kri = {name: 'tric', term: 'तृ'};
    //makeDhatu.call(this, flex.stem, kri, flex);
}

// ====
// avyaya: -tumun (inf), -Namul ?, gerund:-ktvA , gerund+preffix: -ya, -tya (short vowel)
// ====
// FIXME: Namul не сделано
//
krit.prototype.tumun = function(stem) {
    if (stem == stem.replace('ुम्','')) return;
    var pratyayas = ['तुम्', 'टुम्'];
    // var dhatus = _.map(pratyayas, function(pratyaya) { return sandhi.del(stem, pratyaya, 'त') });
    var dhatus = _.map(pratyayas, function(pratyaya) { return sandhi.int(stem, pratyaya, 'त') });
    dhatus = _.flatten(dhatus);
    var param = {type: 'dhatu', kridanta: 'tumun', dhatus: dhatus, flex: null};
    makeDhatuNew.call(this, param);
}

krit.prototype.ktvAc = function(stem) {
    if (stem == stem.replace(/्वा$/,'')) return;
    var pratyayas = ['त्वा', 'ट्वा'];
    // var dhatus = _.map(pratyayas, function(pratyaya) { return sandhi.del(stem, pratyaya, 'त') });
    var dhatus = _.map(pratyayas, function(pratyaya) { return sandhi.int(stem, pratyaya, 'त') });
    dhatus = _.flatten(dhatus);
    var wott = stem.replace(/त्त्वा$/, '');
    dhatus.push(wott);

    if (u.empty(dhatus)) return;
    var param = {type: 'dhatu', kridanta: 'ktvAc', dhatus: dhatus, flex: null};
    makeDhatuNew.call(this, param);
}

function log() { console.log.apply(console, arguments) }
