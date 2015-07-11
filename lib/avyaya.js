/*
  kridanta suffixes
*/

var _ = require('underscore');
var Const = require('./constants');
var u = require('./utils');
var sandhi = require('../../sandhi/sandhi');

module.exports = avyaya();

function avyaya() {
    if (!(this instanceof avyaya)) return new avyaya();
    return this;
}

avyaya.prototype.check = function(stem) {
    ktvAc.call(this, stem);
    tumun.call(this, stem);
    // Namul.call(this, stem);
}


function makeQuery(dhatus, param) {
    var that = this;
    var query;
    _.each(dhatus, function(dhatu) {
        query = {type: param.type, query: dhatu, avyaya: true};
        if (param.anit) query.anit = true;
        if (param.taddhita) query.taddhita = param.taddhita;
        if (param.kridanta) query.krit = param.kridanta;
        if (param.avyaya) query.avyaya = param.avyaya;
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
            //log('Exs', exceps);
            makeQuery.call(that, exceps, param);
        });
    });
}


// ====
// avyaya: -tumun (inf), -Namul ?, gerund:-ktvA , gerund+preffix: -ya, -tya (short vowel)
// ====
// FIXME: Namul is absent
//
function tumun(stem) {
    var clean = stem.replace('ुम्','');
    if (stem == clean) return;
    var suff = stem.slice(-4);
    var pratyayas = ['तुम्', 'टुम्'];
    // log('STEM', stem, clean, suff);
    if (!u.isIN(pratyayas, suff)) return;

    var dhatus = sandhi.del(stem, suff, 'त');
    // dhatus = _.flatten(dhatus);
    // log('=avyaya-tumun=', dhatus);
    if (u.empty(dhatus)) return;
    var param = {type: 'dhatu', kridanta: 'tumun', dhatus: dhatus, flex: null};
    makeDhatuNew.call(this, param);
}

function ktvAc(stem) {
    if (stem == stem.replace(/्वा$/,'')) return;
    // log('avyaya-ktvAc', stem);
    var pratyayas = ['त्वा', 'ट्वा'];
    var dhatus = _.map(pratyayas, function(pratyaya) { return sandhi.del(stem, pratyaya, 'त') });
    dhatus = _.flatten(dhatus);
    var wott = stem.replace(/त्त्वा$/, '');
    dhatus.push(wott);

    if (u.empty(dhatus)) return;
    var param = {type: 'dhatu', kridanta: 'ktvAc', dhatus: dhatus, flex: null};
    makeDhatuNew.call(this, param);
}

function log() { console.log.apply(console, arguments) }
