/*
 * stemmer.js -
 */

var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;

exports = module.exports = stemmer();
function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
}

// samasa to queries array
stemmer.prototype.get = function(query) {
    this.queries = [];
    var namas = sup.nama.call(this, query);
    var kriyas = sup.kriya.call(this, query);
    var plainDict = {pos: 'plaindict', query: query};
    if (this.queries.length == 0) this.queries.push(plainDict);
    return this.queries;
}




function ulog (obj) {
    console.log(util.inspect(obj, showHidden=false, depth=null, colorize=true));
}

function log() { console.log.apply(console, arguments) }
