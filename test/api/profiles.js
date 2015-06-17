
var request = require('request');
request = request.defaults({ json: true });

var dataBuilder;

var chai = require('chai');
var expect = chai.expect;

module.exports = function(base_url, config, testUsers){
  var auth = testUsers[0].auth;
  var uri = base_url + '/profiles';

  dataBuilder = require('./dataBuilder')();

  var users;

  describe('Profiles', function(){

    before(function(done){

      dataBuilder.getById('User', testUsers[0]._id, function(err, userA){
        if (err) throw err;

        dataBuilder.getById('User', testUsers[1]._id, function(err, userB){
          if (err) throw err;
          users = [ userA, userB ];
          done();
        });
      });
    });

    describe('GET /profiles/:user_id', function(){

      it('must retrieve a profile by user id', function(done){

        request.get({
          uri: uri + '/' + testUsers[0]._id,
          auth: testUsers[0].auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('object');
          checkProfile(response.body, users[0]);
          done();

        });

      });

      it('must fill profile\'s lists');

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

    describe('PUT /profiles/:user_id', function(){

      it('must update a profile by user id', function(done){

        var updates = {
          name: "Test User 2",
          email: "pepe@gmail.com",
          bio: "some other bio",

          // NOT allowed
          _id: dataBuilder.getFakeId(),
          username: 'some_new_username',
          provider: 'rock_provider',
          provider_id: 5000,
          picture: 'http://amazing.com/picture.jpg'
        };

        request.put({
          uri: uri + '/' + testUsers[0]._id,
          auth: testUsers[0].auth,
          body: updates
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          request.get({
            uri: uri + '/' + testUsers[0]._id,
            auth: testUsers[0].auth
          }, function (error, response, body) {
            expect(error).to.not.be.ok();
            expect(response.statusCode).to.be.equal(200);

            expect(response.body).to.be.an('object');
            expect(response.body.name).to.be.equal(updates.name);
            expect(response.body.email).to.be.equal(updates.email);
            expect(response.body.bio).to.be.equal(updates.bio);

            // NOT allowed
            expect(response.body._id).to.not.be.equal(updates._id);
            expect(response.body.picture).to.not.be.equal(updates.picture);
            expect(response.body.username).to.not.be.equal(updates.username);
            expect(response.body.provider).to.not.be.equal(updates.provider);
            expect(response.body.provider_id).to.not.be.equal(updates.provider_id);

            done();
          });
        });
      });

      it('must not allow to update another profile', function(done){

        var updates = {
          name: "Test User",
          email: "pepe@gmail.com",
          bio: "some other bio",
        };

        request.put({
          uri: uri + '/' + testUsers[1]._id,
          auth: testUsers[0].auth,
          body: updates
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(403);
          expect(response.body).to.be.equal("Only your own profile can be updated.");
          done();
        });
      });

    });

  });

};

function checkProfile(profile, expected){

  expect(profile._id.toString()).to.be.equal(expected._id.toString());
  expect(profile.username).to.be.equal(expected.username);
  expect(profile.provider).to.be.equal(expected.provider);
  expect(profile.picture).to.be.equal(expected.picture);
  expect(profile.name).to.be.equal(expected.name);
  expect(profile.bio).to.be.equal(expected.bio);

  expect(profile).not.to.have.property('provider_id');

  expect(profile.collections).to.be.an("array");
  expect(profile.admin_in).to.be.an("array");
  //expect(profile.dashboards).to.be.an("array");
  expect(profile.projects).to.be.an("array");
  expect(profile.contributions).to.be.an("array");
  expect(profile.likes).to.be.an("array");
}
