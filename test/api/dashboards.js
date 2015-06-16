
var request = require('request');
request = request.defaults({ json: true });

var dataBuilder;

var chai = require('chai');
var expect = chai.expect;
var dashboards;

module.exports = function(base_url, config, testUsers){
  var auth = testUsers[0].auth;
  var uri = base_url + '/dashboards';

  dataBuilder = require('./dataBuilder')();

  describe('Dashboards', function(){

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
            expect(response.body.length).to.be.equal(count-1); // only with projects

            response.body.forEach(function(dashboard, i){
              checkDashboard(dashboard, getById(dashboard._id), true);
            });

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

      it('must allow to set a limit of results', function(done){

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

      it('must allow to set a page', function(done){

        request.get({
          uri: uri + '?limit=2&page=1',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.equal(1);// only with projects

          done();
        });

      });

    });

    describe('GET /dashboards/:domain', function(){

      it('must return a dashboard', function(done){
        var d = dashboards[0];

        request.get({
          uri: uri + '/' + d.domain,
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(200);

          expect(response.body).to.be.an('object');
          checkDashboard(response.body, d);

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
          expect(dashboard.owner).to.be.equal(testUsers[0]._id.toString());

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

    describe('DELETE /dashboards/:domain', function(){

      it('must validate if domain exists', function(done){

        request.del({
          uri: uri + '/NotFound',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(404);
          done();
        });

      });

      it('must validate if has Owner', function(done){

        request.del({
          uri: uri + '/domaina',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(403);
          expect(body).to.be.equal("This dashboard cannot be removed because it has no owner.");
          done();
        });

      });

      it('must validate if user is Owner', function(done){

        request.del({
          uri: uri + '/domainb',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(403);
          expect(body).to.be.equal("Only Owner can remove this dashboard.");
          done();
        });

      });

      it('must validate if has projects', function(done){

        request.del({
          uri: uri + '/domaind',
          auth: auth
        }, function (error, response, body) {
          expect(error).to.not.be.ok();
          expect(response.statusCode).to.be.equal(403);
          expect(body).to.be.equal("Only Dashboards with no projects can be removed.");
          done();
        });

      });

      it('must validate if has only one admin', function(done){

        function updateUserAdmin(userId, domain, _done){
          dataBuilder.getById('User', userId, function(err, usr){
            usr.admin_in = [];
            usr.admin_in.push(domain);

            usr.save(function(err){
              _done(usr);
            });

          });
        }

        updateUserAdmin(testUsers[0]._id, 'domainc', function(user0){
          updateUserAdmin(testUsers[1]._id, 'domainc', function(user1){

            request.del({
              uri: uri + '/domainc',
              auth: auth
            }, function (error, response, body) {

              expect(error).to.not.be.ok();
              expect(response.statusCode).to.be.equal(403);
              expect(body).to.be.equal("Only Dashboards with ONE admin can be removed.");

              user0.admin_in = [];
              user1.admin_in = [];

              user0.save(function(err){
                user1.save(function(err){
                  done();
                });
              });

            });

          });
        });

      });

      it('must remove the dashboard and admin_in field from user', function(done){

        dataBuilder.getById('User', testUsers[0]._id, function(err, usr){
          usr.admin_in = ['testdom1', 'domainc', 'testdom2'];

          usr.save(function(err){
            expect(usr.admin_in.length).to.be.equal(3);

            request.del({
              uri: uri + '/domainc',
              auth: auth
            }, function (error, response, body) {
              expect(error).to.not.be.ok();
              expect(response.statusCode).to.be.equal(204);

              request.get({
                uri: uri + '/domainc',
                auth: auth
              }, function (error, response, body) {
                expect(error).to.not.be.ok();
                expect(response.statusCode).to.be.equal(404);

                dataBuilder.getById('User', testUsers[0]._id, function(err, usr){
                  expect(usr.admin_in.length).to.be.equal(2);
                  done();
                });

              });
            });

          });
        });

      });

    });


  });

};

function getById(id){
  var found;

  dashboards.forEach(function(d){
    if (d._id.toString() === id){
      found = d;
      return false;
    }
  });

  return found;
}

function checkDashboard(dashboard, expected, ownerString){
  expect(dashboard).not.to.have.property('__v');

  expect(dashboard._id.toString()).to.be.equal(expected._id.toString());
  expect(dashboard.title).to.be.equal(expected.title);
  expect(dashboard.domain).to.be.equal(expected.domain);
  expect(dashboard.description).to.be.equal(expected.description);
  expect(dashboard.link).to.be.equal(expected.link);
  expect(dashboard.open).to.be.equal(expected.open);

  expect(new Date(dashboard.created_at).toString()).to.be.equal(expected.created_at.toString());

  if (ownerString && dashboard.owner){
    expect(dashboard.owner.toString()).to.be.equal(expected.owner.toString());
  }
  else if (!ownerString && dashboard.owner){

    expect(dashboard.owner).to.be.an("object");
    expect(dashboard.owner._id.toString()).to.be.equal(expected.owner.toString());

    expect(dashboard.owner).to.have.property('_id');
    expect(dashboard.owner).to.have.property('name');
    expect(dashboard.owner).to.have.property('picture');
    expect(dashboard.owner).to.have.property('bio');

    expect(dashboard.owner).not.to.have.property('provider');
    expect(dashboard.owner).not.to.have.property('username');
    expect(dashboard.owner).not.to.have.property('admin_in');
    expect(dashboard.owner).not.to.have.property('__v');
    expect(dashboard.owner).not.to.have.property('email');
    expect(dashboard.owner).not.to.have.property('provider_id');
  }
}

function createTestDashboards(testUsers, done){

  dataBuilder.create('Dashboard', [{
      "domain": "domaina"
    , "title": "Dashboard Title A"
    , "description": "description a"
    , "link": "http://example.com/some/link"
    , "open": true
    , "showcase": []
    , "projectsCount": 3
    , "covers": ['1', '2', '3']
  }, {
      "domain": "domainb"
    , "title": "Dashboard Title B"
    , "description": "description b"
    , "link": "http://example.com/some/link"
    , "open": true
    , "owner": testUsers[1]._id.toString()
    , "showcase": []
    , "projectsCount": 3
    , "covers": ['1', '2', '3']
  }, {
      "domain": "domainc"
    , "title": "Dashboard Title C"
    , "description": "description c"
    , "link": "http://example.com/some/link"
    , "open": true
    , "owner": testUsers[0]._id.toString()
    , "showcase": []
    , "projectsCount": 0
    , "covers": ['1', '2', '3']
  }, {
      "domain": "domaind"
    , "title": "Dashboard With projects"
    , "description": "description d"
    , "link": "http://example.com/some/link"
    , "open": true
    , "owner": testUsers[0]._id.toString()
    , "showcase": []
    , "projectsCount": 3
    , "covers": ['1', '2', '3']
  }], done);

}