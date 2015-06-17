
var request = require('request');
request = request.defaults({ json: true });

var dataBuilder;

var chai = require('chai');
var expect = chai.expect;
var collections;

module.exports = function(base_url, config, testUsers){
  var auth = testUsers[0].auth;
  var uri = base_url + '/collections';

  dataBuilder = require('./dataBuilder')();

  describe('Collections', function(){

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

            response.body.forEach(function(collection, i){
              checkCollection(collection, getById(collection._id));
            });

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

      it('must allow to set a limit', function(done){

        request.get({
          uri: uri + '?limit=2',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(2);

          done();
        });

      });

    });

    describe('GET /collections/:id', function(){

      it('must return a collection', function(done){
        var c = collections[0];

        request.get({
          uri: uri + '/' + c._id,
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('object');
          checkCollection(response.body, c);

          done();
        });

      });

    });

  });

};

function getById(id){
  var found;

  collections.forEach(function(c){
    if (c._id.toString() === id.toString()){
      found = c;
      return false;
    }
  });

  return found;
}

function checkCollection(collection, expected){
  expect(collection).not.to.have.property('__v');

  expect(collection._id.toString()).to.be.equal(expected._id.toString());
  expect(collection.title).to.be.equal(expected.title);
  expect(collection.description).to.be.equal(expected.description);
  expect(collection.dashboards.length).to.be.equal(expected.dashboards.length);

  expect(new Date(collection.created_at).toString()).to.be.equal(expected.created_at.toString());

  expect(collection.owner).to.be.an("object");
  expect(collection.owner._id.toString()).to.be.equal(expected.owner.toString());

  expect(collection.owner).to.have.property('_id');
  expect(collection.owner).to.have.property('name');
  expect(collection.owner).to.have.property('picture');
  expect(collection.owner).to.have.property('bio');
  expect(collection.owner).to.have.property('admin_in');

  expect(collection.owner).to.have.property('provider');
  expect(collection.owner).to.have.property('username');

  expect(collection.owner).not.to.have.property('__v');
  expect(collection.owner).not.to.have.property('email');
  expect(collection.owner).not.to.have.property('provider_id');
}

function createTestCollections(testUsers, done){

  dataBuilder.create('Collection', [{
      "owner": testUsers[0]._id
    , "title": "Collection Title A"
    , "description": "description a"
    , "link": "http://example.com/some/link"
  }, {
      "owner": testUsers[0]._id
    , "title": "Collection Title B"
    , "description": "description b"
    , "link": "http://example.com/some/link"
  }, {
      "owner": testUsers[0]._id
    , "title": "Collection Title C"
    , "description": "description c"
    , "link": "http://example.com/some/link"
  }], done);

}