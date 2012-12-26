
var should = require('should')
  , request = require('superagent');

var url = 'http://localhost:3000'
  , pid;

describe('API', function(){

  describe('Projects', function(){
    it('Fetch all projects', function(done){
      request.get(url + '/api/projects')
       .auth('test', 'test')
        .end(function(res){
        res.body.html.should.be.ok;
        done();
      });
    });

    it('refuse to create a new project without title', function(done){
      request.post(url + '/api/projects/create')
      .auth('test', 'test')
      .send({'title': '', 'summary': 'asdasd'})
      .end(function(res){
        res.status.should.equal(500);
        done();
      });
    });

    it('refuse to create a new project without summary', function(done){
      request.post(url + '/api/projects/create')
      .auth('test', 'test')
      .send({'title': 'sadasd', 'summary': ''})
      .end(function(res){
        res.status.should.equal(500);
        done();
      });
    });

    it('should create a project', function(done){
      request.post(url + '/api/projects/create')
      .auth('test', 'test')
      .send({
        'title': 'test project', 
        'summary': 'this is text'
      })
      .end(function(res){
        res.status.should.equal(200);
        should.not.exist(res.body.err);
        res.body.id.should.exist;
        pid = res.body.id;
        done();
      });
    });

    it('should refuse to edit a project without summary', function(done){
      request.post(url + '/api/projects/edit/' + pid)
      .auth('test', 'test')
      .send({
        'title': 'test project', 
        'summary': ''
      })
      .end(function(res){
        res.status.should.equal(500);
        done();
      });
    });

    it('should edit a project', function(done){
      request.post(url + '/api/projects/edit/' + pid)
      .auth('test', 'test')
      .send({
        'title': 'test project', 
        'summary': 'this is text',
        'link': 'http://google.com'
      })
      .end(function(res){
        res.status.should.equal(200);
        res.body.id.should.equal(pid);
        done();
      });
    });

    it('should search a project', function(done){
      request.get(url + '/api/projects/' + pid + '/follow')
      .auth('test', 'test')
      .query({
        'q': 'peron',
        'type': 'title'
      })
      .end(function(res){
        res.status.should.equal(200);
        res.body.html.should.exist;
        done();
      });
    });

    it('should remove a project', function(done){
      request.get(url + '/api/projects/remove/' + pid)
      .auth('test', 'test')
      .end(function(res){
        res.status.should.equal(200);
        res.body.id.should.exist;
        done();
      });
    });


  });


});
