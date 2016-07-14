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

jnutest:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--slow 500 \
		--grep $(g) \
		--timeout 3000 \
		test/jnu.js \
#		2> /dev/null

jnu_gana:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--slow 500 \
		--grep $(g) \
		--timeout 3000 \
		test/jnu_gana.js \
#		2> /dev/null


gana:
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
