
var request = require('request');
request = request.defaults({ json: true });

var dataBuilder;

var chai = require('chai');
var expect = chai.expect;

module.exports = function(base_url, config, testUsers){
  var auth = testUsers[0].auth;
  var uri = base_url + '/collections';

  dataBuilder = require('./dataBuilder')();

  describe('Collections', function(){
    var collections;

    before(function(done){
      createTestCollections(testUsers, function(err, _collections){
        if (err) { throw err; }
        collections = _collections;
        done();
      });
    });

    after(function(done){
      var ids = collections.map(function(u){ return u._id; });
      dataBuilder.clear('Collection', ids, function(){
        done();
      });
    });

    describe('GET /collections', function(){

      it('must retrieve all collections', function(done){

        request.get({
          uri: uri,
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');

          dataBuilder.count('Collection', function(err, count){
            expect(response.body.length).to.be.equal(count);
            done();
          });

        });

      });

      it('must allow to query collections by title', function(done){

        request.get({
          uri: uri + '?q=Title A',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);
          expect(response.body[0].title).to.be.equal('Collection Title A');

          done();
        });

      });

      it('must allow to query collections by description', function(done){

        request.get({
          uri: uri + '?q=ription b',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);
          expect(response.body[0].description).to.be.equal('description b');

          done();
        });

      });

    });

  });

};

function checkCollection(collection, expected){
  expect(collection._id.toString()).to.be.equal(expected._id.toString());
  expect(collection.owner).to.be.equal(expected.owner);
  expect(collection.title).to.be.equal(expected.title);
  expect(collection.description).to.be.equal(expected.description);
  expect(collection.dashboards).to.be.equal(expected.dashboards);

  expect(new Date(collection.created_at).toString()).to.be.equal(expected.created_at.toString());
}

function createTestCollections(testUsers, done){

  dataBuilder.create('Collection', [{
      "owner": testUsers[0]
    , "title": "Collection Title A"
    , "description": "description a"
    , "link": "http://example.com/some/link"
  }, {
      "owner": testUsers[0]
    , "title": "Collection Title B"
    , "description": "description b"
    , "link": "http://example.com/some/link"
  }, {
      "owner": testUsers[0]
    , "title": "Collection Title C"
    , "description": "description c"
    , "link": "http://example.com/some/link"
  }], done);

}