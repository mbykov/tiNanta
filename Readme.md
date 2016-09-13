# node.js sanskrit tiNanta analyser

tiNanta analyser gets array of wordforms (flakes) and return array of queries for (in my case) CouchDB.

tiNanta analyser is based on results of a remarkable program developed by Dr. Dhaval Patel & Dr. Sivakumari Katuri, and it solves the inverse problem - for the final wordform it restores its dhatu.

look: http://sanskritworld.in/sanskrittool/SanskritVerb/tiGanta.html

tiNanta analyser beforehand creates the  databases 'sa-tin' for endings of any wordform and the database 'sa-das' for all angas for any dhatu, and then works with this two dbs.


````bash
$ node run.js आकिष्टाम्                                                           (git)-[devel]
stemmer parse: AkizwAm आकिष्टाम्
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
queryTime: 103.593ms
````


## Installation

With node.js:

````javascript
$ npm install tiNanta
````

also you should clone two DBs: sa-tin ans sa-das

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
