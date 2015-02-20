
var request = require('request');
request = request.defaults({ json: true });

var dataBuilder;

var chai = require('chai');
var expect = chai.expect;

module.exports = function(base_url, config, testUsers){
  var auth = testUsers[0].auth;
  var uri = base_url + '/users';

  dataBuilder = require('./dataBuilder')();

  describe('Users', function(){
    var users;

    before(function(done){
      createTestUsers(function(err, _users){
        if (err) { throw err; }
        users = _users;
        done();
      });
    });

    after(function(done){
      var ids = users.map(function(u){ return u._id; });
      dataBuilder.clear('User', ids, function(){
        done();
      });
    });

    describe('GET /users', function(){

      it('must retrieve all users', function(done){

        request.get({
          uri: uri,
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');

          dataBuilder.count('User', function(err, count){
            expect(response.body.length).to.be.equal(count);
            done();
          });

        });

      });

      it('must allow to query users by name', function(done){

        request.get({
          uri: uri + '?q=croft',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);
          expect(response.body[0].name).to.be.equal('Lara Croft');

          done();
        });

      });

      it('must allow to query users by username', function(done){

        request.get({
          uri: uri + '?q=many_calavera',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);
          expect(response.body[0].name).to.be.equal('Many Calavera');

          done();
        });

      });

    });

    describe('GET /users/:id', function(){

      it('must retrieve a user by id', function(done){

        request.get({
          uri: uri + '/' + users[0]._id,
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('object');
          checkUser(response.body, users[0]);
          done();

        });

      });

      it('must return 404 if user not found', function(done){

        request.get({
          uri: uri + '/' + dataBuilder.getFakeId(),
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(404);
          done();
        });

      });

    });

  });

};

function checkUser(user, expected){
  expect(user._id.toString()).to.be.equal(expected._id.toString());
  expect(user.username).to.be.equal(expected.username);
  expect(user.provider).to.be.equal(expected.provider);
  expect(user.provider_id).to.be.equal(expected.provider_id);
  expect(user.picture).to.be.equal(expected.picture);
  expect(user.name).to.be.equal(expected.name);
  expect(user.bio).to.be.equal(expected.bio);
  expect(new Date(user.created_at).toString()).to.be.equal(expected.created_at.toString());
}

function createTestUsers(done){

  dataBuilder.create('User', [{
    username: 'lui_kang',
    provider: 'twitter',
    provider_id: 1234,
    picture: 'http://example.com/images/lui_kang.png',
    name: 'Liu Kang',
    bio: 'He became the Grand Champion of Mortal Kombat throughout the first four tournaments, a title that remained undisputed in the original timeline.'
  }, {
    username: 'many_calavera',
    provider: 'twitter',
    provider_id: 1235,
    picture: 'http://example.com/images/many_calavera.png',
    name: 'Many Calavera',
    bio: 'Bound only by the paper-thin wrappings of mortality, a soul here lies, struggling to be free. And so it shall, thanks to a bowl of bad gazpacho, and a man named… Calavera'
  }, {
    username: 'lara_croft',
    provider: 'twitter',
    provider_id: 1236,
    picture: 'http://example.com/images/lara_croft.png',
    name: 'Lara Croft',
    bio: "The world's most famous archaeologist who's whereabouts are unknown."
  }], done);

}
