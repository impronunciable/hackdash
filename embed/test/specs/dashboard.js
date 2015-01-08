
var Dashboard = require('../../src/Dashboard');

var chai = require('chai');
var expect = chai.expect;

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var dash = {
  title: 'Test Deashboard',
  domain: 'testadmin',
  projects: [{
    title: 'project1',
    description: 'desc1',
    status: 'building',
    cover: 'xxx'
  }, {
    title: 'project2',
    description: 'desc2',
    status: 'prototyping',
    cover: 'yyy'
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
        name: dash.domain
      });

      dashboard.render(dash);

      var header = ctn.querySelector('h2');
      var list = ctn.querySelector('ul');

      expect(header).to.be.ok;
      expect(header.innerHTML).to.be.equal(dash.title);

      expect(list).to.be.ok;
      expect(list.innerHTML.trim().length).to.be.greaterThan(0);

      var projs = list.querySelectorAll('li');
      expect(projs.length).to.be.equal(dash.projects.length);

      dash.projects.forEach(function(p, i){
        var status = projs[i].className;
        var cover = projs[i].querySelector('.cover img');
        var title = projs[i].querySelector('.title');
        var desc = projs[i].querySelector('.description');

        expect(status).to.be.equal(p.status);
        expect(cover.getAttribute('href')).to.be.equal(p.cover);
        expect(title.innerHTML).to.be.equal(p.title);
        expect(desc.innerHTML).to.be.equal(p.description);
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

  document.body.appendChild(ctn);
  return ctn;
}

