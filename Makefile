TESTS = test/naman/*.js
REPORTER = dot
# REPORTER = spec
g = _
g = ''

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--slow 500 \
		--grep $(g) \
		--timeout 3000 \
		test/test.js \
#		2> /dev/null

find:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--slow 500 \
		--grep $(g) \
		--timeout 3000 \
		test/jnu_find.js \
#		2> /dev/null

parse:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--slow 500 \
		--grep $(g) \
		--timeout 3000 \
		--bail \
#		test/jnu_parse.js \
		test/parse.js \
#		2> /dev/null


ganaXX:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--slow 500 \
		--grep $(g) \
		--timeout 3000 \
		test/ganas/*.js \
		2> /dev/null


clean:
	rm -fr build components template.js

.PHONY: test clean
