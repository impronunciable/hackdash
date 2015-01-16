
var ctnName = 'hackdash-embed';

var Dashboard = require('./Dashboard');

var dataAttr = {
  dashboard: 'data-dashboard'
};

module.exports = {

  build: function(done){
    var containers = getContainers();

    for (var i = containers.length; i--;) {
        
      var container = containers[i];

      if (attr(container, dataAttr.dashboard)){
        this.createDashboard(container, done);
      }

    }

  },

  createDashboard: function(container, done){

    var dash = new Dashboard({
      container: container,
      name: attr(container, dataAttr.dashboard),
      show: getShow(container, 
        [ 'title', 'description', 'admins' ], 
        [ 'leader', 'collaborators', 'followers', 'links' ])
    });

    dash.fetch(function(data){
      dash.render(data);
      done && done();
    });
  }

};


function getContainers() {
  var containers = [];

  if (document.querySelectorAll) {
    containers = document.querySelectorAll('.' + ctnName);
  }
  
  return containers || [];
}

function attr(ele, attr){
  return ele.getAttribute(attr);
}

function hasAttr(ele, attr){
  return ele.hasAttribute(attr);
}

function getShow(container, props, projsProps){
  var show = {};

  props.forEach(function(prop){
    show[prop] = hasAttr(container, 'data-' + prop);
  });

  show.project = {};
  projsProps.forEach(function(prop){
    show.project[prop] = hasAttr(container, 'data-' + prop);
  });

  return show;
}