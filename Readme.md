# stemmer.js

forms CouchDB queries for Morpheus v.0.3.0

depends on flakes.js, which is stemmer

beta, under heavy development - http://sa.diglossa.org

## Installation

With node.js:

````bash
$ git clone github.com/mbykov/stemmer.js
$ cd stemmer.js
$ npm install
````

````bash
node run.js vihAya
or
node run.js विहाय
````

## API

````javascript
var stemmer = require('stemmer');
var qs = stemmer.query(wordform);
````



## License

  GNU GPL
