TESTS = test/naman/*.js
#REPORTER = dot
REPORTER = spec
g = _

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
