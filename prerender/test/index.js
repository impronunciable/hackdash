
var chai = require('chai');
var expect = chai.expect;

var config = require('../config.json');

describe('Prerender', function(){

  require('./prerender');
  require('./fetcher');

});