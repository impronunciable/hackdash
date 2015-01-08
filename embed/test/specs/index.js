
var expect = require('chai').expect;

describe('Hackdash Embeds', function(){

  before(function(){
    require('../../src');
  });

  it('must initialize itself', function(){
    expect(window.hackdashEmbed.VERSION).to.be.ok;
  });

  require('./dashboard');
  
});

