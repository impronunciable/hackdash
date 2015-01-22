
var Dashboard = require('../../src/Dashboard');

var chai = require('chai');
var expect = chai.expect;

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var dash = {
  title: 'Test Dashboard',
  description: 'Test Dashboard description',
  domain: 'testadmin',

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
};

describe('Dashboard', function(){

  it('must call createDashboard if data-dashboard attribute', function(){
    var ctn = createContainer();
    sinon.spy(hackdashEmbed, 'createDashboard');

    hackdashEmbed.build();
    expect(hackdashEmbed.createDashboard).to.have.been.calledOnce;
    expect(hackdashEmbed.createDashboard).to.have.been.calledWith(ctn);

    hackdashEmbed.createDashboard.restore();
    destroyContainer();
  });

  it('must fetch and fill a container', function(done){
    var ctn = createContainer();

    hackdashEmbed.build(function(){
      expect(ctn.innerHTML.trim().length).to.be.greaterThan(0);
      done();
    });

    destroyContainer();
  });

  describe('#render', function(){

    it('must fill a container from a dataset', function(){
      var ctn = createContainer();

      var dashboard = new Dashboard({
        container: ctn,
        name: dash.domain,
        show: {
          title: true,
          description: true,
          admins: true,

          project: {
            leader: true,
            collaborators: true,
            followers: true,
            links: true
          }
        }
      });

      dashboard.render(dash);

      var dashEl = ctn.querySelector('.dashboard');

      var header = dashEl.querySelector('h2.title');
      var headerDesc = dashEl.querySelector('p.description');
      var adminsEl = dashEl.querySelector('ul.admins');
      var list = ctn.querySelector('ul.projects');

      expect(header).to.be.ok;
      expect(header.innerHTML).to.be.equal(dash.title);

      expect(headerDesc).to.be.ok;
      expect(headerDesc.innerHTML).to.be.equal(dash.description);

      // Dashboard Admins -----------------------------------

      expect(adminsEl).to.be.ok;
      expect(adminsEl.innerHTML.trim().length).to.be.greaterThan(0);

      var admins = adminsEl.querySelectorAll('li');
      expect(admins.length).to.be.equal(dash.admins.length);

      dash.admins.forEach(function(admin, i){

        var adminEl = admins[i].querySelector('a');
        var pic = adminEl.querySelector('img');
        var name = adminEl.querySelector('h4');
        var bio = adminEl.querySelector('p');

        expect(adminEl.getAttribute('href'))
          .to.be.equal('http://local.host:3000/users/' + admin._id);

        expect(pic.getAttribute('href')).to.be.equal(admin.picture);
        expect(name.innerHTML).to.be.equal(admin.name);
        expect(bio.innerHTML).to.be.equal(admin.bio);

      });

      // Dashboard Projects -----------------------------------

      expect(list).to.be.ok;
      expect(list.innerHTML.trim().length).to.be.greaterThan(0);

      var projs = list.querySelectorAll('li');
      expect(projs.length).to.be.equal(dash.projects.length);

      dash.projects.forEach(function(p, i){

        // Project Info -----------------------------------

        var status = projs[i].className;
        var cover = projs[i].querySelector('.cover img');
        var title = projs[i].querySelector('.title');
        var desc = projs[i].querySelector('.description');

        expect(status).to.be.equal(p.status);
        expect(cover.getAttribute('href')).to.be.equal(p.cover);
        expect(title.innerHTML).to.be.equal(p.title);
        expect(desc.innerHTML).to.be.equal(p.description);

        // Project People -----------------------------------

        var people = projs[i].querySelector('.people');

        var collaborators = people.querySelector('.collaborators');
        var followers = people.querySelector('.followers');

        var leader = people.querySelector('.leader');
        var pic = leader.querySelector('img');
        var name = leader.querySelector('h4');
        var bio = leader.querySelector('p');

        expect(parseInt(collaborators.innerHTML, 10))
          .to.be.equal(p.collaborators);
        expect(parseInt(followers.innerHTML, 10)).to.be.equal(p.followers);

        expect(leader.getAttribute('href'))
          .to.be.equal('http://local.host:3000/users/' + p.leader._id);

        expect(pic.getAttribute('href')).to.be.equal(p.leader.picture);
        expect(name.innerHTML).to.be.equal(p.leader.name);
        expect(bio.innerHTML).to.be.equal(p.leader.bio);

        // Project Links -----------------------------------

        var links = projs[i].querySelector('.links');
        var follow = links.querySelector('.follow');
        var share = links.querySelector('.share');
        var join = links.querySelector('.join');

        expect(follow.getAttribute('href'))
          .to.be.equal('http://local.host:3000/projects/' + p._id);
        expect(follow.innerHTML).to.be.equal('Follow');

        expect(share.getAttribute('href'))
          .to.be.equal('http://local.host:3000/projects/' + p._id);
        expect(share.innerHTML).to.be.equal('Share');

        expect(join.getAttribute('href'))
          .to.be.equal('http://local.host:3000/projects/' + p._id);
        expect(join.innerHTML).to.be.equal('Join');

      });

      destroyContainer();
    });

  });

});

function destroyContainer(){
  var ctn = document.getElementById('hd-ctn');
  if (ctn){
    document.body.removeChild(ctn);
  }
}

function createContainer(){
  destroyContainer();

  var ctn = document.createElement('div');
  ctn.id = 'hd-ctn';
  ctn.className = 'hackdash-embed';

  ctn.setAttribute('data-dashboard', dash.domain);

  ctn.setAttribute('data-title', true);
  ctn.setAttribute('data-description', true);
  ctn.setAttribute('data-admins', true);

  ctn.setAttribute('data-leader', true);
  ctn.setAttribute('data-collaborators', true);
  ctn.setAttribute('data-followers', true);
  ctn.setAttribute('data-links', true);

  document.body.appendChild(ctn);
  return ctn;
}
