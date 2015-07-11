# simple practical morph analyzer for sanskrit

beta, under heavy development - http://morph.diglossa.org

## Installation

With node.js:

````bash
$ git clone github.com/mbykov/morpheus.sa.js
$ cd morpheus.sa.js
$ npm install
````

## Running node tests

````bash
$ ls test
all  ganas  krit	naman  redup  tadd  upa
````
so

````bash
$ make gana
$ make gana g=one
$ make gana g=lat_par_BU
$ make naman
$
````
or simply

````bash
$ make
````

View more examples in [test suite](https://github.com/mbykov/morpheus.sa.js/tree/master/test)

## License

  GNU GPL
