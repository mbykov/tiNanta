# node.js Sanskrit tiNanta analyser

tiNanta analyser gets array of wordforms and return array of queries for (in my case) CouchDB.

tiNanta analyser is based on results of a remarkable program 'SanskritVerb' developed by Dr. Dhaval Patel & Dr. Sivakumari Katuri. But tiNanta.js solves the inverse problem - it restores a dhatu for any final wordform.

look: http://sanskritworld.in/sanskrittool/SanskritVerb/tiGanta.html

tiNanta analyser creates beforehand the  database 'sa-tins' for all endings of any wordform and for all angas for any dhatu, and then works with this db.


````bash
$ node run.js आकिष्टाम्                                                           (git)-[devel]
parsing: AkizwAm आकिष्टाम्
[ { verb: true,
    tips: [ 'तस्' ],
    tin: 'िष्टाम्',
    size: 7,
    gana: '01',
    la: 'लुङ्',
    pada: 'प',
    stem: 'आक',
    dhatu: 'अक्',
    flake: 'आकिष्टाम्' } ]
qs size: 1
queryTime: 57.654ms
````


## Installation

With node.js:

````javascript
$ npm install tiNanta
````
also you should clone CouchDB named sa-tins:

http://diglossa.org:5984/_utils/index.html


## API

````javascript
var tiNanta = require('tiNanta');
````

````javascript
tiNanta.query(stems, function(err, queries) {
    console.log(err, queries);
}
````

## console

run.js is for convenient purpuses only and takes only one wordform as input:

it takes slp1, (slp1 goes only in console):

````bash
node run.js karoti
````
or devanagari as well:

````bash
node run.js करोति
````

## Running node tests

tiNanta.js has 245 056 tests. So it takes some time to run ok.

````javascript
$ make test
````

## License

  GNU GPL
