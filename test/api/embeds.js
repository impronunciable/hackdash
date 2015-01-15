
var request = require('request');
var dataBuilder;

var chai = require('chai');
var expect = chai.expect;
var dashboards;

module.exports = function(base_url, config){
  dataBuilder = require('./dataBuilder')();

  describe('Embeds', function(){

    before(function(done){
      dataBuilder.clear('Dashboard', function(){
        createDashboards(done);
      });
    });

    describe('/dashboards', function(){

      var uri = '/api/v2/dashboards';

      it ('must return a json without a content-type', function(done){

        request.get(base_url + uri + '/testadmin', function (error, response, body){

          expect(response.statusCode).to.be.equal(200);

          expect(function(){
            JSON.parse(body);
          }).to.not.throw();

          done();
        });

      });

      it ('must retrieve a jsonp with a content-type of javascript', function(done){

        request.get(base_url + uri + '/testadmin.jsonp?callback=cb'
        , function (error, response, body){
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

        getJsonFromJsonP(base_url + uri + '/testadmin.jsonp?callback=cb', function(err, data){

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
          expect(data.projects).to.be.an('array');

          data.admins.forEach(function(admin){
            mustHave(admin, [ '_id', 'name', 'picture'/*, 'bio'*/ ]);
            mustNOTHave(admin, [
             '__v', 'provider', 'provider_id', 'username', 'email', 'admin_in', 'created_at'
            ]);
          });

          data.projects.forEach(function(p){

            mustHave(p, [
              '_id', 
              'cover', 
              'status',
              'title',
              'description',
              'link',
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

function getJsonFromJsonP(url, callback) {

  request.get(url, function (error, response, body) {

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

  dataBuilder.create('Dashboard', {
    title: 'Test Dashboard',
    description: 'Test Dashboard description',
    domain: 'testadmin',
/*
    admins: [{
      _id: 'admin-12345',
      picture: 'http://example.com/images/a1.png',
      name: 'admin1',
      bio: 'test test bio admin 1'
    }, {
      _id: 'admin-12346',
      picture: 'http://example.com/images/a2.png',
      name: 'admin2',
      bio: 'test test bio admin 2'
    }],

    projects: [{
      _id: 'project-12345',
      title: 'project1',
      description: 'desc1',
      status: 'building',
      cover: 'xxx',
      collaborators: 5,
      followers: 15,
      leader: {
        _id: 'leader-12345',
        picture: 'http://example.com/images/l1.png',
        name: 'leader1',
        bio: 'test test bio 1'
      }
    }, {
      _id: 'project-12346',
      title: 'project2',
      description: 'desc2',
      status: 'prototyping',
      cover: 'yyy',
      collaborators: 3,
      followers: 10,
      leader: {
        _id: 'leader-12346',
        picture: 'http://example.com/images/l2.png',
        name: 'leader2',
        bio: 'test test bio 2'
      }
    }]
*/
  }, function(err, _dashboards){
    dashboards = _dashboards;
    done();
  });
}