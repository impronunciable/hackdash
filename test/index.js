
import {expect} from 'chai';

// Helper function to re-check get().expect() status code
// because superagent is not always working :(
global.expectCode = (code, res) => {
  expect(res.status).to.be.equal(code);
};

describe('(~˘▾˘)~  TESTS  ~(˘▾˘~)', () => {

  it ('yaaaay Hackdash with tests!', () => {
    expect(true).to.be.true;
  });

  require('./api');

});
