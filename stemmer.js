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
    var plainDict = {pos: 'plain', query: query};
    this.queries.push(plainDict);
    var namas = sup.nama.call(this, query);
    // var kriyas = sup.kriya.call(this, query);
    return this.queries;
}




function ulog (obj) {
    console.log(util.inspect(obj, showHidden=false, depth=null, colorize=true));
}

function log() { console.log.apply(console, arguments) }
