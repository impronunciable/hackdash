
var request = require('request');
request = request.defaults({ json: true });

var dataBuilder;

var chai = require('chai');
var expect = chai.expect;

module.exports = function(base_url, config, testUsers){
  var auth = testUsers[0].auth;
  var uri = base_url + '/projects';

  dataBuilder = require('./dataBuilder')();

  describe('Projects', function(){
    var projects;

    before(function(done){
      createTestProjects(testUsers, function(err, _projects){
        if (err) { throw err; }
        projects = _projects;
        done();
      });
    });

    after(function(done){
      var ids = projects.map(function(u){ return u._id; });
      dataBuilder.clear('Project', ids, function(){
        done();
      });
    });

    describe('GET /projects', function(){

      it('must retrieve all projects', function(done){

        request.get({
          uri: uri,
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');

          dataBuilder.count('Project', function(err, count){
            expect(response.body.length).to.be.equal(count);
            done();
          });

        });

      });

      it('must allow to query projects by title', function(done){

        request.get({
          uri: uri + '?q=Title A',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);
          expect(response.body[0].title).to.be.equal('Project Title A');

          done();
        });

      });

      it('must allow to query projects by description', function(done){

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

      it('must allow to query projects by tags', function(done){

        request.get({
          uri: uri + '?q=little tag',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);
          expect(response.body[0].title).to.be.equal('Project Title B');

          done();
        });

      });

      it('must allow to query projects by domain', function(done){

        request.get({
          uri: uri + '?q=mainc',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);
          expect(response.body[0].domain).to.be.equal('domainc');

          done();
        });

      });

    });

  });

};

function checkProject(project, expected){
  expect(project._id.toString()).to.be.equal(expected._id.toString());
  expect(project.title).to.be.equal(expected.title);
  expect(project.domain).to.be.equal(expected.domain);
  expect(project.description).to.be.equal(expected.description);
  expect(project.cover).to.be.equal(expected.cover);
  expect(project.status).to.be.equal(expected.status);
  expect(project.link).to.be.equal(expected.link);
  expect(project.tags).to.be.equal(expected.tags);

  expect(project.leader).to.be.an("object");
  expect(project.leader._id.toString()).to.be.equal(expected.leader._id.toString());
  expect(project.leader.name).to.be.equal(expected.leader.name);

  expect(new Date(project.created_at).toString()).to.be.equal(expected.created_at.toString());
}

function createTestProjects(testUsers, done){

  dataBuilder.create('Project', [{
      "title": "Project Title A"
    , "domain": "domaina"
    , "description": "description a"
    , "leader": testUsers[0]._id
    , "status": "brainstorming"
    //, "contributors": [{ type: ObjectId, ref: 'User'}]
    //, "followers": [{ type: ObjectId, ref: 'User'}]
    , "cover": "http://hackdash.org/test/img.png"
    , "link": "http://example.com/some/link"
    , "tags": ["tag 1", "tag 2", "tag 3"]
  }, {
      "title": "Project Title B"
    , "domain": "domainb"
    , "description": "description b"
    , "leader": testUsers[0]._id
    , "status": "wireframing"
    //, "contributors": [{ type: ObjectId, ref: 'User'}]
    //, "followers": [{ type: ObjectId, ref: 'User'}]
    , "cover": "http://hackdash.org/test/img.png"
    , "link": "http://example.com/some/link"
    , "tags": ["tag 1", "little tag", "tag 3"]
  }, {
      "title": "Project Title C"
    , "domain": "domainc"
    , "description": "description c"
    , "leader": testUsers[0]._id
    , "status": "researching"
    //, "contributors": [{ type: ObjectId, ref: 'User'}]
    //, "followers": [{ type: ObjectId, ref: 'User'}]
    , "cover": "http://hackdash.org/test/img.png"
    , "link": "http://example.com/some/link"
    , "tags": ["tag 1", "tag 2", "tag 3"]
  }], done);

}