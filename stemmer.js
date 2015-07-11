/*
 * stemmer.js -
 */

var sup = require('./lib/sup');
var debug = (process.env.debug == 'true') ? true : false;

exports = module.exports = stemmer();
function stemmer() {
    if (!(this instanceof stemmer)) return new stemmer();
    this.queries = [];
}

// samasa to queries array
stemmer.prototype.get = function(query) {
    var namas = sup.nama.call(this, query);
    var kriyas = sup.kriya.call(this, query);
    // ulog(this.queries);
    // log('size:', this.queries.length);
    return this.queries;
}




function ulog (obj) {
    console.log(util.inspect(obj, showHidden=false, depth=null, colorize=true));
}
