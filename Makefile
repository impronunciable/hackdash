ALL_TESTS = $(shell find test/ -name '*.test.js' ! -name '._*')

test:	
	NODE_ENV=test node server & 
	sleep 1
	./node_modules/.bin/mocha $(ALL_TESTS) -R spec
	pkill node

install:
	./bin/install

.PHONY: test
