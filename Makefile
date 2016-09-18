TESTS = test/naman/*.js
REPORTER = dot
# REPORTER = spec
g = _
g = ''

parse:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--slow 900 \
		--grep $(g) \
		--timeout 3000 \
		--bail \
		test/parse.js \
#		2> /dev/null

test:
	@node test/parse.js


clean:
	rm -fr build components template.js

.PHONY: test clean
