
var request = require('request');
request = request.defaults({ json: true });

var dataBuilder;

var chai = require('chai');
var expect = chai.expect;

module.exports = function(base_url, config, testUsers){
  var auth = testUsers[0].auth;
  var uri = base_url + '/dashboards';

  dataBuilder = require('./dataBuilder')();

  describe('Dashboards', function(){
    var dashboards;

    before(function(done){
      createTestDashboards(testUsers, function(err, _dashboards){
        if (err) { throw err; }
        dashboards = _dashboards;
        done();
      });
    });

    after(function(done){
      var ids = dashboards.map(function(u){ return u._id; });
      dataBuilder.clear('Dashboard', ids, function(){
        done();
      });
    });

    describe('GET /dashboards', function(){

      it('must retrieve all dashboards', function(done){

        request.get({
          uri: uri,
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');

          dataBuilder.count('Dashboard', function(err, count){
            expect(response.body.length).to.be.equal(count);
            done();
          });

        });

      });

      it('must allow to query dashboards by title', function(done){

        request.get({
          uri: uri + '?q=Title A',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);
          expect(response.body[0].title).to.be.equal('Dashboard Title A');

          done();
        });

      });

      it('must allow to query dashboards by description', function(done){

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

      it('must allow to query dashboards by domain', function(done){

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

    describe('POST /dashboards', function(){

      it('must create a dashboard', function(done){

        request.post({
          uri: uri,
          auth: auth,
          body: { domain: 'newdash' }
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('object');

          var dashboard = response.body;

          expect(dashboard._id).to.be.ok;
          expect(dashboard.domain).to.be.equal('newdash');
          expect(dashboard.open).to.be.true;

          dataBuilder.clear('Dashboard', [dashboard._id], function(){
            done();
          });

        });

      });

      it('must validate domain', function(done){

        request.post({
          uri: uri,
          auth: auth,
          body: { domain: 'new dash' }
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(500);
          expect(response.body.error).to.be.equal('subdomain_invalid');
          done();
        });

      });

      it('must validate if domain exists', function(done){

        var domain = dashboards[0].domain;

        request.post({
          uri: uri,
          auth: auth,
          body: { domain: domain }
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(409);
          expect(response.body.error).to.be.equal('subdomain_inuse');
          done();
        });

      });

    });

  });

};

function checkDashboard(dashboard, expected){
  expect(dashboard._id.toString()).to.be.equal(expected._id.toString());
  expect(dashboard.title).to.be.equal(expected.title);
  expect(dashboard.domain).to.be.equal(expected.domain);
  expect(dashboard.description).to.be.equal(expected.description);
  expect(dashboard.link).to.be.equal(expected.link);
  expect(dashboard.open).to.be.equal(expected.open);

  expect(new Date(dashboard.created_at).toString()).to.be.equal(expected.created_at.toString());
}

function createTestDashboards(testUsers, done){

  dataBuilder.create('Dashboard', [{
      "domain": "domaina"
    , "title": "Dashboard Title A"
    , "description": "description a"
    , "link": "http://example.com/some/link"
    , "open": true
    , "showcase": []
  }, {
      "domain": "domainb"
    , "title": "Dashboard Title B"
    , "description": "description b"
    , "link": "http://example.com/some/link"
    , "open": true
    , "showcase": []
  }, {
      "domain": "domainc"
    , "title": "Dashboard Title C"
    , "description": "description c"
    , "link": "http://example.com/some/link"
    , "open": true
    , "showcase": []
  }], done);

}