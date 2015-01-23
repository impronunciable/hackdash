
var request = require('request');
var dataBuilder;

var chai = require('chai');
var expect = chai.expect;
var dashboards;

module.exports = function(base_url, config, testUsers){
  var user = testUsers[0].auth;

  dataBuilder = require('./dataBuilder')();

  describe('Embeds', function(){

    before(function(done){
      createDashboards(done);
    });

    describe('/dashboards', function(){

      var uri = '/api/v2/dashboards';

      it ('must return a json without a content-type', function(done){

        request.get({
          url: base_url + uri + '/testadmin',
          auth: user
        }, function (error, response, body){

          expect(response.statusCode).to.be.equal(200);

          expect(function(){
            JSON.parse(body);
          }).to.not.throw();

          done();
        });

      });

      it ('must retrieve a jsonp with a content-type of javascript', function(done){

        request.get({
          url: base_url + uri + '/testadmin.jsonp?callback=cb',
          auth: user
        }, function (error, response, body){
          expect(response.statusCode).to.be.equal(200);

          var startPos = body.indexOf('({');
          var endPos = body.indexOf('})');

          expect(startPos).to.be.greaterThan(-1);
          expect(endPos).to.be.greaterThan(-1);

          expect(function(){
            JSON.parse(body);
          }).to.throw();

          expect(function(){
            JSON.parse(body.substring(startPos+1, endPos+1));
          }).to.not.throw();

          done();
        });

      });

      it ('must retrieve a Full Dashboard', function(done){

        function mustHave(obj, props){
          props.forEach(function(p){
            expect(obj).to.have.property(p);
          });
        }

        function mustNOTHave(obj, props){
          props.forEach(function(p){
            expect(obj).to.not.have.property(p);
          });
        }

        getJsonFromJsonP(
          base_url + uri + '/testadmin.jsonp?callback=cb',
          user,
        function(err, data){

          mustHave(data, [
            '_id',
            'admins',
            'title',
            'description',
            'link',
            'domain',
            'created_at',
            'open',
            'projects'
          ]);

          mustNOTHave(data, [ '__v' ]);

          expect(data.admins).to.be.an('array');
          expect(data.admins.length).to.be.greaterThan(0);

          data.admins.forEach(function(admin){
            mustHave(admin, [ '_id', 'name', 'picture'/*, 'bio'*/ ]);
            mustNOTHave(admin, [
             '__v', 'provider', 'provider_id', 'username', 'email', 'admin_in', 'created_at'
            ]);
          });

          expect(data.projects).to.be.an('array');
          expect(data.projects.length).to.be.greaterThan(0);

          data.projects.forEach(function(p){

            mustHave(p, [
              '_id',
              'cover',
              'status',
              'title',
              'description',
              'domain',
              'contributors',
              'followers',
              'leader',
              'created_at'
            ]);

            mustNOTHave(p, [ '__v', 'tags' ]);

            expect(p.contributors).to.be.a('number');
            expect(p.followers).to.be.a('number');

            mustHave(p.leader, [ '_id', 'name', 'picture', 'bio' ]);
            mustNOTHave(p.leader, [
             '__v', 'provider', 'provider_id', 'username', 'email', 'admin_in', 'created_at'
            ]);

          });

          done();
        });

      });
    });

  });

};

function getJsonFromJsonP(url, usr, callback) {

  request.get({ url: url, auth: usr }, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      var jsonpData = body;
      var json;

      try {
        json = JSON.parse(jsonpData);
      }
      catch(e) {
        var startPos = jsonpData.indexOf('({');
        var endPos = jsonpData.indexOf('})');
        var jsonString = jsonpData.substring(startPos+1, endPos+1);
        json = JSON.parse(jsonString);
      }

      callback(null, json);

    } else {
      callback(error);
    }
  });
};

function createDashboards(done){
  var dashName = 'testadmin';

  dataBuilder.create('User', [{
    username: 'user1',
    provider: 'twitter',
    provider_id: '1',
    picture: 'http://example.com/images/a1.png',
    name: 'admin1',
    bio: 'test test bio admin 1',
    admin_in: [dashName]
  }, {
    username: 'user2',
    provider: 'twitter',
    provider_id: '2',
    picture: 'http://example.com/images/a2.png',
    name: 'admin2',
    bio: 'test test bio admin 2',
    admin_in: [dashName]
  }], function(err, users){

    dataBuilder.create('Project', [{
      domain: dashName,
      title: 'project1',
      description: 'desc1',
      status: 'building',
      cover: 'xxx',
      collaborators: [],
      followers: [],
      leader: users[0]._id.toString()
    }, {
      domain: dashName,
      title: 'project2',
      description: 'desc2',
      status: 'prototyping',
      cover: 'yyy',
      collaborators: [],
      followers: [],
      leader: users[1]._id.toString()
    }],function(err, projects){

      dataBuilder.create('Dashboard', {
        title: 'Test Dashboard',
        description: 'Test Dashboard description',
        domain: dashName,
        link: 'http://example.com'
      }, done);

    });

  });

}