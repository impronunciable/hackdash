/*! 
* Hackdash - v0.6.6
* Copyright (c) 2015 Hackdash 
*  
*/ 

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Landing Application
 *
 */

var HackdashRouter = require('./HackdashRouter')
  , ModalRegion = require('./views/ModalRegion');

module.exports = function(){

  var app = module.exports = new Backbone.Marionette.Application();

  function initRegions(){
    app.addRegions({
      header: "header",
      main: "#main",
      footer: "footer",
      modals: ModalRegion
    });
  }

  function initRouter(){
    app.router = new HackdashRouter();
    Backbone.history.start({ pushState: true });
  }

  app.addInitializer(initRegions);
  app.addInitializer(initRouter);

  window.hackdash.app = app;
  window.hackdash.app.start();

  // Add navigation for BackboneRouter to all links 
  // unless they have attribute "data-bypass"
  $(window.document).on("click", "a:not([data-bypass])", function(evt) {
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
    var root = window.location.protocol + "//" + window.location.host + (app.root || "");

    if (href.prop && href.prop.slice(0, root.length) === root) {
      evt.preventDefault();
      Backbone.history.navigate(href.attr, { trigger: true });
    }
  });

};
},{"./HackdashRouter":2,"./views/ModalRegion":52}],2:[function(require,module,exports){
/*
 * Hackdash Router
 */

var Dashboard = require("./models/Dashboard")
  , Project = require("./models/Project")
  , Projects = require("./models/Projects")
  , Dashboards = require("./models/Dashboards")
  , Collection = require("./models/Collection")
  , Collections = require("./models/Collections")
  , Profile = require("./models/Profile")

  , Header = require("./views/Header")
  , Footer = require("./views/Footer")

  , HomeLayout = require("./views/Home")
  , LoginView = require("./views/Login")
  , ProfileView = require("./views/Profile")
  , ProjectFullView = require("./views/Project/Full")
  , ProjectEditView = require("./views/Project/Edit")
  , ProjectsView = require("./views/Project/Layout")
  , DashboardsView = require("./views/Dashboard/Collection")
  , CollectionsView = require("./views/Collection/Collection");

module.exports = Backbone.Marionette.AppRouter.extend({

  routes : {
      "" : "index"

    , "login" : "showLogin"

    , "projects" : "showProjects"
    , "projects/create" : "showProjectCreate"
    , "projects/:pid/edit" : "showProjectEdit"
    , "projects/:pid" : "showProjectFull"

    , "dashboards" : "showDashboards"
    , "dashboards/:dash": "showDashboard"

    , "collections" : "showCollections"
    , "collections/:cid" : "showCollection"

    , "users/profile": "showProfile"
    , "users/:user_id" : "showProfile"
  },

  index: function(){
    if (hackdash.subdomain){
      this.showDashboard();
    }
    else {
      this.showHome();
    }
  },

  removeHomeLayout: function(){
    $('body').removeClass("homepage");
    $('header').add('footer').show();
    $('#page').addClass('container');
  },

  showHome: function(){
    $('body').addClass("homepage");
    $('header').add('footer').hide();
    $('#page').removeClass('container');

    var app = window.hackdash.app;
    app.main.show(new HomeLayout());
  },

  getSearchQuery: function(){
    var query = hackdash.getQueryVariable("q");
    var fetchData = {};
    if (query && query.length > 0){
      fetchData = { data: $.param({ q: query }) };
    }

    return fetchData;
  },

  showLogin: function(){
    var providers = window.hackdash.providers;
    var app = window.hackdash.app;

    app.modals.show(new LoginView({
      model: new Backbone.Model({ providers: providers.split(',') })
    }));
  },

  showDashboard: function(dash) {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "dashboard";

    app.dashboard = new Dashboard();
    app.projects = new Projects();

    if (dash){
      app.dashboard.set('domain', dash);
      app.projects.domain = dash;
    }

    app.header.show(new Header({
      model: app.dashboard,
      collection: app.projects
    }));

    app.main.show(new ProjectsView({
      model: app.dashboard,
      collection: app.projects
    }));

    app.footer.show(new Footer({
      model: app.dashboard
    }));

    var self = this;
    app.dashboard.fetch().done(function(){
      app.projects.fetch(self.getSearchQuery(), { parse: true })
        .done(function(){
          app.projects.buildShowcase(app.dashboard.get("showcase"));
        });
    });

  },

  showProjects: function() {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "isearch";

    app.projects = new Projects();

    app.header.show(new Header({
      collection: app.projects
    }));

    app.main.show(new ProjectsView({
      collection: app.projects
    }));

    app.projects.fetch(this.getSearchQuery());
  },

  showProjectCreate: function(){
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "project";

    app.dashboard = new Dashboard();
    app.project = new Project();

    app.header.show(new Header({
      model: app.dashboard
    }));

    app.main.show(new ProjectEditView({
      model: app.project
    }));

    app.dashboard.fetch();
  },

  showProjectEdit: function(pid){
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "project";

    app.dashboard = new Dashboard();
    app.project = new Project({ _id: pid });

    app.header.show(new Header({
      model: app.dashboard
    }));

    app.main.show(new ProjectEditView({
      model: app.project
    }));

    app.dashboard.fetch();
    app.project.fetch();
  },

  showProjectFull: function(pid){
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "project";

    app.dashboard = new Dashboard();
    app.project = new Project({ _id: pid });

    app.header.show(new Header({
      model: app.dashboard
    }));

    app.main.show(new ProjectFullView({
      model: app.project
    }));

    app.dashboard.fetch();
    app.project.fetch();
  },

  showCollections: function() {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "collections";

    app.collections = new Collections();

    app.header.show(new Header({
      collection: app.collections
    }));

    app.main.show(new CollectionsView({
      collection: app.collections
    }));

    app.collections.fetch(this.getSearchQuery());
  },

  showCollection: function(collectionId) {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "collection";

    app.collection = new Collection({ _id: collectionId });

    app.collection
      .fetch({ parse: true })
      .done(function(){

        app.header.show(new Header({
          model: app.collection
        }));

        app.main.show(new DashboardsView({
          hideAdd: true,
          collection: app.collection.get("dashboards")
        }));
      });
  },

  showProfile: function(userId) {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "profile";

    if (!userId){
      if (hackdash.user){
        userId = hackdash.user._id;
      }
      else {
        window.location = "/";
      }
    }

    app.profile = new Profile({
      _id: userId
    });

    app.profile.fetch({ parse: true });

    app.header.show(new Header());

    app.main.show(new ProfileView({
      model: app.profile
    }));
  },

  showDashboards: function() {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "dashboards";

    app.dashboards = new Dashboards();
    app.collections = new Collections();

    app.header.show(new Header({
      collection: app.dashboards
    }));

    app.main.show(new DashboardsView({
      collection: app.dashboards
    }));

    app.collections.getMines();

    app.dashboards.fetch(this.getSearchQuery());
  }

});

},{"./models/Collection":8,"./models/Collections":9,"./models/Dashboard":10,"./models/Dashboards":11,"./models/Profile":12,"./models/Project":13,"./models/Projects":14,"./views/Collection/Collection":17,"./views/Dashboard/Collection":24,"./views/Footer":31,"./views/Header":42,"./views/Home":49,"./views/Login":51,"./views/Profile":55,"./views/Project/Edit":60,"./views/Project/Full":61,"./views/Project/Layout":62}],3:[function(require,module,exports){

module.exports = function(){

  window.hackdash = window.hackdash || {};

  window.hackdash.getQueryVariable = function(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] === variable){return decodeURI(pair[1]);}
    }
    return(false);
  };

  if ($.fn.editable){
    // Set global mode for InlineEditor (X-Editable)
    $.fn.editable.defaults.mode = 'inline';
  }
  
   // Init Helpers
  require('./helpers/handlebars');
  require('./helpers/backboneOverrides');
  
  Placeholders.init({ live: true, hideOnFocus: true });
  
  window.hackdash.apiURL = "/api/v2";
  window.hackdash.startApp = require('./HackdashApp');
};

},{"./HackdashApp":1,"./helpers/backboneOverrides":4,"./helpers/handlebars":5}],4:[function(require,module,exports){
/*
 * Backbone Global Overrides
 *
 */

// Override Backbone.sync to use the PUT HTTP method for PATCH requests
//  when doing Model#save({...}, { patch: true });

var originalSync = Backbone.sync;

Backbone.sync = function(method, model, options) {
  if (method === 'patch') {
    options.type = 'PUT';
  }

  return originalSync(method, model, options);
};

},{}],5:[function(require,module,exports){
/**
 * HELPER: Handlebars Template Helpers
 * 
 */

var Handlebars = require("hbsfy/runtime");

Handlebars.registerHelper('embedCode', function() {
  var embedUrl = window.location.protocol + "//" + window.location.host;
  var template = _.template('<iframe src="<%= embedUrl %>" width="100%" height="500" frameborder="0" allowtransparency="true" title="Hackdash"></iframe>');

  return template({ 
    embedUrl: embedUrl
  });
});

Handlebars.registerHelper('firstUpper', function(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
});

Handlebars.registerHelper('markdown', function(md) {
  return markdown.toHTML(md);
});

Handlebars.registerHelper('disqus_shortname', function() {
  return window.hackdash.disqus_shortname;
});

Handlebars.registerHelper('user', function(prop) {
  if (window.hackdash.user){
    return window.hackdash.user[prop];
  }
});

Handlebars.registerHelper('isLoggedIn', function(options) {
  if (window.hackdash.user){
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('isDashboardView', function(options) {
  if (window.hackdash.app.type === "dashboard"){
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('isSearchView', function(options) {
  if (window.hackdash.app.type === "isearch"){
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('timeAgo', function(date) {
  if (date && moment(date).isValid()) {
    return moment(date).fromNow();
  }

  return "-";
});

Handlebars.registerHelper('formatDate', function(date) {
  if (date && moment(date).isValid()) {
    return moment(date).format("DD/MM/YYYY HH:mm");
  } 
  
  return "-";
});

Handlebars.registerHelper('formatDateText', function(date) {
  if (date && moment(date).isValid()) {
    return moment(date).format("DD MMM YYYY, HH:mm");
  } 
  
  return "";
});

Handlebars.registerHelper('formatDateTime', function(date) {
  if (date && moment(date).isValid()) {
    return moment(date).format("HH:mm");
  } 
  
  return "";
});

Handlebars.registerHelper('timeFromSeconds', function(seconds) {

  function format(val){
    return (val < 10) ? "0" + val : val;
  }

  if (seconds && seconds > 0){

    var t = moment.duration(seconds * 1000),
      h = format(t.hours()),
      m = format(t.minutes()),
      s = format(t.seconds());

    return h + ":" + m + ":" + s;
  }
  
  return "-";
});

Handlebars.registerHelper('getProfileImage', function(user) {

  if (!user){
    return '';
  }

  var img = new window.Image();

  $(img)
    .load(function () { })
    .error(function () {
      $('.' + this.id).attr('src', 'http://avatars.io/' + user.provider + '/' + user.username);
    })
    .prop({
      id: 'pic-' + user._id,
      src: user.picture,
      'data-id': user._id,
      title: user.name,
      class: 'avatar tooltips pic-' + user._id,
      rel: 'tooltip'
    });

  return new Handlebars.SafeString(img.outerHTML);
});

},{"hbsfy/runtime":79}],6:[function(require,module,exports){
jQuery(function() {
  require('./Initializer')();
});
},{"./Initializer":3}],7:[function(require,module,exports){
/**
 * Collection: Administrators of a Dashboard
 *
 */

var 
  Users = require('./Users'),
  User = require('./User');

module.exports = Users.extend({
  
  model: User,
  idAttribute: "_id",

  url: function(){
    return hackdash.apiURL + '/admins'; 
  },

  addAdmin: function(userId){
    $.ajax({
      url: this.url() + '/' + userId,
      type: "POST",
      context: this
    }).done(function(user){
      this.add(user);
    });
  },

});


},{"./User":15,"./Users":16}],8:[function(require,module,exports){
/**
 * MODEL: Collection (a group of Dashboards)
 *
 */

var Dashboards = require('./Dashboards');

module.exports = Backbone.Model.extend({

  idAttribute: "_id",

  urlRoot: function(){
    return hackdash.apiURL + '/collections'; 
  },

  parse: function(response){
    response.dashboards = new Dashboards(response.dashboards || []);
    return response;
  },

  addDashboard: function(dashId){
    $.ajax({
      url: this.url() + '/dashboards/' + dashId,
      type: "POST",
      context: this
    });

    this.get("dashboards").add({ _id: dashId });
  },

  removeDashboard: function(dashId){
    $.ajax({
      url: this.url() + '/dashboards/' + dashId,
      type: "DELETE",
      context: this
    });

    var result = this.get("dashboards").where({ _id: dashId});
    if (result.length > 0){
      this.get("dashboards").remove(result[0]);
    }
  },

});


},{"./Dashboards":11}],9:[function(require,module,exports){
/**
 * Collection: Collections (group of Dashboards)
 *
 */

var 
  Collection = require('./Collection');

module.exports = Backbone.Collection.extend({

  model: Collection,

  idAttribute: "_id",
  
  url: function(){
    return hackdash.apiURL + '/collections'; 
  },

  getMines: function(){
    $.ajax({
      url: this.url() + '/own',
      context: this
    }).done(function(collections){
      this.reset(collections, { parse: true });
    });
  }

});


},{"./Collection":8}],10:[function(require,module,exports){
/**
 * MODEL: Project
 *
 */

var Admins = require("./Admins");

module.exports = Backbone.Model.extend({

  defaults: {
    admins: null
  },

  urlRoot: function(){
    if (this.get('domain')){
      return hackdash.apiURL + '/dashboards'; 
    }
    else {
      return hackdash.apiURL + '/';
    }
  },

  idAttribute: "domain", 

  initialize: function(){
    this.set("admins", new Admins());
  },

});


},{"./Admins":7}],11:[function(require,module,exports){
/**
 * MODEL: Dashboards
 *
 */

module.exports = Backbone.Collection.extend({

  url: function(){
    return hackdash.apiURL + "/dashboards"; 
  },

  idAttribute: "_id", 

});


},{}],12:[function(require,module,exports){
/**
 * MODEL: User
 *
 */

var Projects = require("./Projects");

module.exports = Backbone.Model.extend({

  idAttribute: "_id",

  defaults: {
    collections: new Backbone.Collection(),
    dashboards: new Backbone.Collection(),
    projects: new Projects(),
    contributions: new Projects(),
    likes: new Projects()
  },

  urlRoot: function(){
    return hackdash.apiURL + '/profiles'; 
  },

  parse: function(response){

    this.get("collections").reset(response.collections);

    this.get("dashboards").reset( 
      _.map(response.admin_in, function(dash){ return { title: dash }; })
    );
    
    this.get("projects").reset(response.projects);
    this.get("contributions").reset(response.contributions);
    this.get("likes").reset(response.likes);
    
    return response;
  }

});

},{"./Projects":14}],13:[function(require,module,exports){
/**
 * MODEL: Project
 *
 */

module.exports = Backbone.Model.extend({

  idAttribute: "_id",

  defaults: {
    active: true
  },

  urlRoot: function(){
    return hackdash.apiURL + '/projects'; 
  },

  doAction: function(type, res, done){
    $.ajax({
      url: this.url() + '/' + res,
      type: type,
      context: this
    }).done(done);
  },

  updateList: function(type, add){
    var list = this.get(type);
    var uid = hackdash.user._id;

    function exists(){
      return _.find(list, function(usr){
        return (usr._id === uid);
      }) ? true : false;
    }

    if (add && !exists()){
      list.push(hackdash.user);
    }
    else if (!add && exists()){
      var idx = 0;
      _.each(list, function(usr, i){
        if (usr._id === uid) {
          idx = i;
        }
      });

      list.splice(idx, 1);
    }

    this.set(type, list);
    this.trigger("change");
  },

  join: function(){
    this.doAction("POST", "contributors", function(){
      this.updateList("contributors", true);
    });
  },

  leave: function(){
    this.doAction("DELETE", "contributors", function(){
      this.updateList("contributors", false);
    });
  },

  follow: function(){
    this.doAction("POST", "followers", function(){
      this.updateList("followers", true);
    });
  },

  unfollow: function(){
    this.doAction("DELETE", "followers", function(){
      this.updateList("followers", false);
    });
  },

});


},{}],14:[function(require,module,exports){
/**
 * Collection: Projectss
 *
 */

var 
  Project = require('./Project');

var Projects = module.exports = Backbone.Collection.extend({

  model: Project,

  idAttribute: "_id",
  
  url: function(){
    if (this.domain){
      return hackdash.apiURL + '/' + this.domain + '/projects';   
    }
    return hackdash.apiURL + '/projects'; 
  },

  parse: function(response){

    if (hackdash.app.type !== "dashboard"){
      //it is not a dashboard so all projects active
      return response;
    }

    var dashboard = hackdash.app.dashboard;

    var showcase = (dashboard && dashboard.get("showcase")) || [];
    if (showcase.length === 0){
      //no showcase defined: all projects are active
      return response;
    }

    // set active property of a project from showcase mode 
    // (only projects at showcase array are active ones)
    _.each(response, function(project){
      
      if (showcase.indexOf(project._id) >= 0){
        project.active = true;
      }
      else {
        project.active = false; 
      }

    });

    return response;
  },

  buildShowcase: function(showcase){
    _.each(showcase, function(id, i){
      var found = this.where({ _id: id, active: true });
      if (found.length > 0){
        found[0].set("showcase", i);
      }
    }, this);

    this.trigger("reset");
  },

  getActives: function(){
    return new Projects(
      this.filter(function(project){
        return project.get("active");
      })
    );
  },

  getInactives: function(){
    return new Projects(
      this.filter(function(project){
        return !project.get("active");
      })
    );
  }

});


},{"./Project":13}],15:[function(require,module,exports){
/**
 * MODEL: User
 *
 */

module.exports = Backbone.Model.extend({

  idAttribute: "_id",

});

},{}],16:[function(require,module,exports){
/**
 * Collection: Users
 *
 */

var 
  User = require('./User');

module.exports = Backbone.Collection.extend({
  
  model: User,
  
  idAttribute: "_id",

  url: function(){
    return hackdash.apiURL + '/users'; 
  },

});


},{"./User":15}],17:[function(require,module,exports){
/**
 * VIEW: Collections
 * 
 */

var Collection = require('./index');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: "collections",
  className: "row collections",
  itemView: Collection,
  
  collectionEvents: {
    "remove": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  onRender: function(){
    var self = this;
    _.defer(function(){
      self.updateIsotope();
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  isotopeInitialized: false,
  updateIsotope: function(){
    var $collections = this.$el;

    if (this.isotopeInitialized){
      $collections.isotope("destroy");
    }

    $collections.isotope({
        itemSelector: ".collection"
      , animationEngine: "jquery"
      , resizable: true
    });
    
    this.isotopeInitialized = true;
  }

});
},{"./index":20}],18:[function(require,module,exports){
/**
 * VIEW: User Collections
 * 
 */

var template = require('./templates/list.hbs')
  , Collection = require('./ListItem');

module.exports = Backbone.Marionette.CompositeView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "modal my-collections-modal",
  template: template,
  itemView: Collection,
  itemViewContainer: ".collections",

  ui: {
    "title": "input[name=title]",
    "description": "input[name=description]",
    "events": ".events"
  },

  events: {
    "click .close": "close",
    "click .btn-add": "add"
  },

  itemViewOptions: function(){
    return {
      dashboardId: this.model.get("_id")
    };
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  addedCollection: function(title){
    this.showAction("add", title);
  },

  removedCollection: function(title){
    this.showAction("remove", title);
  },

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  add: function(){
    if (this.ui.title.val()){
      this.collection.create({
        title: this.ui.title.val(),
        description: this.ui.description.val()
      }, { wait: true });

      this.ui.title.val("");
      this.ui.description.val("");
    }
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  timer: null,
  showAction: function(type, title){
    var msg = (type === 'add' ? ' has been added to ' : ' has been removed from ');
    var dash = this.model.get("domain");

    this.ui.events.empty();
    window.clearTimeout(this.timer);
    
    var li = $('<li><span>' + dash + '</span>' + msg + '<span>' + title + '</span></li>');
    li.appendTo(this.ui.events);

    var self = this;
    this.timer = window.setTimeout(function(){
      self.ui.events.empty();
    }, 50000);
  }

});
},{"./ListItem":19,"./templates/list.hbs":22}],19:[function(require,module,exports){
/**
 * VIEW: A User Collection
 * 
 */
 
var template = require('./templates/listItem.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "li",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.dashboardId = options.dashboardId;
  },

  onRender: function(){
    if (this.hasDashboard()){
      this.$el.addClass('active');
    }
    else {
      this.$el.removeClass('active'); 
    }

    this.$el.off("click").on("click", this.toggleDashboard.bind(this));
  },

  serializeData: function(){
    return _.extend({
      hasDash: this.hasDashboard()
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  viewCollection: function(){
    this.$el.off("click");
    hackdash.app.modals.close();
  },

  toggleDashboard: function(e){
    if ($(e.target).hasClass("view-collection")){
      this.viewCollection();
      return;
    }

    if (this.hasDashboard()){
      this.model.removeDashboard(this.dashboardId);
      hackdash.app.modals.currentView.removedCollection(this.model.get("title"));
    }
    else {
      this.model.addDashboard(this.dashboardId);
      hackdash.app.modals.currentView.addedCollection(this.model.get("title"));
    }

    this.render();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  hasDashboard: function(){
    return this.model.get("dashboards").where({ _id: this.dashboardId}).length > 0;
  }

});
},{"./templates/listItem.hbs":23}],20:[function(require,module,exports){
/**
 * VIEW: Collection
 * 
 */
 
var template = require('./templates/collection.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },
  className: "collection span4",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){

    var url = "http://" + hackdash.baseURL + "/collections/" + this.model.get("_id");

    this.$el.on("click", function(e){
      if (!$(e.target).hasClass("add")){
        window.location = url;
      }
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/collection.hbs":21}],21:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"well\">\n  <div class=\"well-content\">\n    <h4>"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h4>\n    "
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "\n  </div>\n  <div class=\"row-fluid footer-box\">\n    <div class=\"aging activity created_at\">\n      <i rel=\"tooltip\" title=\""
    + escapeExpression(((helpers.timeAgo || (depth0 && depth0.timeAgo) || helperMissing).call(depth0, (depth0 != null ? depth0.created_at : depth0), {"name":"timeAgo","hash":{},"data":data})))
    + "\" class=\"tooltips icon-time icon-1\"></i>\n    </div>\n  </div>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":79}],22:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"modal-header\">\n  <button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close\">×</button>\n  <h3>My Collections: adding "
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "</h3>\n  <ul class=\"events\"></ul>\n</div>\n<div class=\"modal-body\">\n  <ul class=\"collections\"></ul>\n</div>\n<div class=\"modal-footer\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div class=\"span10\">\n        <input type=\"text\" name=\"title\" placeholder=\"Enter Title\" class=\"input-medium pull-left\" style=\"margin-right: 10px;\">\n        <input type=\"text\" name=\"description\" placeholder=\"Enter Description\" class=\"input-medium pull-left\">\n        <input type=\"button\" class=\"btn primary btn-success pull-left btn-add\" value=\"Add\">\n      </div>\n      <div class=\"span2\">\n        <input type=\"button\" class=\"btn primary pull-right\" data-dismiss=\"modal\" value=\"Close\">\n      </div>\n    </div>\n  </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":79}],23:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<label class=\"pull-left\">\n  "
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "\n</label>\n\n<a class=\"pull-right view-collection\" href=\"/collections/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\">View</a>";
},"useData":true});

},{"hbsfy/runtime":79}],24:[function(require,module,exports){
/**
 * VIEW: Dashboards
 * 
 */

var Dashboard = require('./index');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: "dashboards",
  className: "row dashboards",
  itemView: Dashboard,
  
  itemViewOptions: function(){
    return {
      hideAdd: this.hideAdd
    };
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  initialize: function(options){
    this.hideAdd = (options && options.hideAdd) || false;
  },

  onRender: function(){
    var self = this;
    _.defer(function(){
      self.updateIsotope();
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  isotopeInitialized: false,
  updateIsotope: function(){
    var $dashboards = this.$el;

    if (this.isotopeInitialized){
      $dashboards.isotope("destroy");
    }

    $dashboards.isotope({
        itemSelector: ".dashboard"
      , animationEngine: "jquery"
      , resizable: true
    });
    
    this.isotopeInitialized = true;
  }

});
},{"./index":25}],25:[function(require,module,exports){
/**
 * VIEW: Dashboard
 * 
 */
 
var template = require('./templates/dashboard.hbs')
  , UserCollectionsView = require('../Collection/List');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },
  className: "dashboard span4",
  template: template,

  events: {
    "click .demo a": "stopPropagation",
    "click .add a": "onAddToCollection"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.hideAdd = (options && options.hideAdd) || false;
  },

  onRender: function(){
    this.$el
      .attr({
          "title": this.model.get("status")
        , "data-name": this.model.get("domain")
        , "data-date": this.model.get("created_at")
      })
      .tooltip({});

    $('.tooltips', this.$el).tooltip({});

    var url = "http://" + this.model.get("domain") + "." + hackdash.baseURL;

    this.$el.on("click", function(e){
      if (!$(e.target).hasClass("add")){
        window.location = url;
      }
    });
  },

  serializeData: function(){
    return _.extend({
      hideAdd: this.hideAdd
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  stopPropagation: function(e){
    e.stopPropagation();
  },

  onAddToCollection: function(){
    hackdash.app.modals.show(new UserCollectionsView({
      model: this.model,
      collection: hackdash.app.collections
    }));
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"../Collection/List":18,"./templates/dashboard.hbs":26}],26:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"pull-right demo\">\n      <a href=\""
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\" class=\"btn btn-link\">Site</a>\n    </div>\n";
},"3":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"4":function(depth0,helpers,partials,data) {
  return "      <div class=\"pull-right add\">\n        <a class=\"btn btn-link add\">Add to Collections</a>\n      </div>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"well\">\n  <div class=\"well-content\">\n    <h4>"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "</h4>\n    <h4>"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h4>\n    "
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "\n    <br/>\n  </div>\n  <div class=\"row-fluid footer-box\">\n    <div class=\"aging activity created_at\">\n      <i rel=\"tooltip\" title=\""
    + escapeExpression(((helpers.timeAgo || (depth0 && depth0.timeAgo) || helperMissing).call(depth0, (depth0 != null ? depth0.created_at : depth0), {"name":"timeAgo","hash":{},"data":data})))
    + "\" class=\"tooltips icon-time icon-1\"></i>\n    </div>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.link : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers.unless.call(depth0, (depth0 != null ? depth0.hideAdd : depth0), {"name":"unless","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    \n  </div>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":79}],27:[function(require,module,exports){
/**
 * VIEW: A User Collection
 * 
 */
 
var template = require('./templates/addAdmin.hbs')
  , Users = require('../../models/Users');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "modal add-admins-modal",
  template: template,

  ui: {
    "txtUser": "#txtUser",
    "addOn": ".add-on"
  },

  events: {
    "click #save": "saveAdmin"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(){
    this.users = new Users();
  },

  onRender: function(){
    this.initTypehead();
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  saveAdmin: function(){
    var selected = this.users.find(function(user){
      return user.get('selected');
    });

    if (selected){
      this.collection.addAdmin(selected.get("_id"));
      this.close();
    }
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  initTypehead: function(){
    var users = this.users,
      self = this,
      MIN_CHARS_FOR_SERVER_SEARCH = 3;

    this.ui.txtUser.typeahead({
      source: function(query, process){
        if (query.length >= MIN_CHARS_FOR_SERVER_SEARCH){
          users.fetch({ 
            data: $.param({ q: query }),
            success: function(){
              var usersIds = users.map(function(user){ return user.get('_id').toString(); });
              process(usersIds);
            }
          });
        }
        else {
          process([]);
        }
      },
      matcher: function(){
        return true;
      },
      highlighter: function(uid){
        var user = users.get(uid),
          template = _.template('<img class="avatar" src="<%= picture %>" /> <%= name %>');

        return template({
          picture: user.get('picture'),
          name: user.get('name')
        });
      },
      updater: function(uid) {
        var selectedUser = users.get(uid);
        selectedUser.set('selected', true);
        self.ui.addOn.empty().append('<img class="avatar" src="' + selectedUser.get("picture") + '" />');
        return selectedUser.get('name');
      }
    });
  }

});
},{"../../models/Users":16,"./templates/addAdmin.hbs":32}],28:[function(require,module,exports){
/**
 * VIEW: A Embed code
 * 
 */
 
var template = require('./templates/embed.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "modal",
  template: template,

  ui: {
    embedCode: "textarea"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    var self = this;
    _.defer(function(){
      self.ui.embedCode.select();
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/embed.hbs":33}],29:[function(require,module,exports){
/**
 * VIEW: User
 * 
 */
 
var template = require('./templates/user.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "li",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    $('.tooltips', this.$el).tooltip({});
  }

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/user.hbs":35}],30:[function(require,module,exports){
/**
 * VIEW: Collection of Users
 * 
 */

var template = require('./templates/users.hbs')
  , User = require('./User')
  , AddAdmin = require('./AddAdmin');

module.exports = Backbone.Marionette.CompositeView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,
  
  tagName: "div",
  itemViewContainer: "ul",
  itemView: User,
  
  events: {
    "click a.add-admins": "showAddAdmins"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return user && user.admin_in.indexOf(this.domain) >= 0 || false;
    }
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  showAddAdmins: function(){
    hackdash.app.modals.show(new AddAdmin({
      collection: this.collection
    }));
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./AddAdmin":27,"./User":29,"./templates/users.hbs":36}],31:[function(require,module,exports){

var 
    template = require('./templates/footer.hbs')
  , Users = require('./Users')
  , Embed = require('./Embed');

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container",
  template: template,

  regions: {
    "admins": ".admins-ctn"
  },

  ui: {
    "switcher": ".dashboard-btn",
    "showcaseMode": ".btn-showcase-mode",
    "createShowcase": ".btn-new-project",
    "footerToggle": ".footer-toggle-ctn"
  },

  events: {
    "click .dashboard-btn": "onClickSwitcher",
    "click .embed-btn": "showEmbedModal",
    "click .btn-showcase-mode": "changeShowcaseMode"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return user && user.admin_in.indexOf(this.domain) >= 0 || false;
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(){
    var isDashboard = (hackdash.app.type === "dashboard" ? true : false);

    if (isDashboard){
      this.model.get("admins").fetch();
    } 
  },

  onRender: function(){
    var isDashboard = (hackdash.app.type === "dashboard" ? true : false);
    
    if (isDashboard){
      this.admins.show(new Users({
        model: this.model,
        collection: this.model.get("admins")
      }));
    }

    $('.tooltips', this.$el).tooltip({});
  },

  serializeData: function(){
    var msg = "This Dashboard is open: click to close";

    if (!this.model.get("open")) {
      msg = "This Dashboard is closed: click to reopen";
    }

    return _.extend({
      switcherMsg: msg
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  onClickSwitcher:function(){
    var open = true;

    if (this.ui.switcher.hasClass("dash-open")){
      open = false;
    }
    
    $('.tooltips', this.$el).tooltip('hide');

    this.model.set({ "open": open }, { trigger: false });
    this.model.save({ wait: true });
  },

  showEmbedModal: function(){
    hackdash.app.modals.show(new Embed());
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  changeShowcaseMode: function(){
    if (this.ui.showcaseMode.hasClass("on")){

      this.model.trigger("save:showcase");
      this.model.trigger("end:showcase");
      
      this.model.isShowcaseMode = false;
    
      this.ui.showcaseMode
        .text("Edit Showcase")
        .removeClass("on");

      this.ui.createShowcase.removeClass("hide");
      this.ui.footerToggle.removeClass("hide");
    }
    else {
      this.model.isShowcaseMode = true;
      this.model.trigger("edit:showcase");

      this.ui.showcaseMode
        .text("Save Showcase")
        .addClass("on");

      this.ui.createShowcase.addClass("hide");
      this.ui.footerToggle.addClass("hide");
    }
  }

});
},{"./Embed":28,"./Users":30,"./templates/footer.hbs":34}],32:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"modal-header\">\n  <button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close\">×</button>\n  <h3>Add Dashboard Admin</h3>\n</div>\n<div class=\"modal-body\">\n  <div class=\"input-prepend\">\n    <span class=\"add-on\" style=\"padding: 10px;\">\n      <i class=\"icon-user\"></i>\n    </span>\n    <input id=\"txtUser\" type=\"text\" class=\"input-xlarge\" placeholder=\"type name or username\" autocomplete=\"off\" style=\"padding: 10px;\">\n  </div>\n</div>\n<div class=\"modal-footer\">\n  <input id=\"save\" type=\"button\" class=\"btn primary btn-success pull-right\" style=\"margin-left: 10px;\" value=\"Save\">\n  <input type=\"button\" class=\"btn primary pull-right\" data-dismiss=\"modal\" value=\"Cancel\">\n</div>";
  },"useData":true});

},{"hbsfy/runtime":79}],33:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"modal-header\">\n  <button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close\">×</button>\n  <h3>Embed code</h3>\n</div>\n<div class=\"modal-body\">\n  <textarea rows=\"2\" style=\"width:90%;\">"
    + escapeExpression(((helper = (helper = helpers.embedCode || (depth0 != null ? depth0.embedCode : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"embedCode","hash":{},"data":data}) : helper)))
    + "</textarea>\n</div>\n<div class=\"modal-footer\">\n  <input type=\"button\" class=\"btn primary pull-right\" data-dismiss=\"modal\" value=\"Cancel\">\n</div>";
},"useData":true});

},{"hbsfy/runtime":79}],34:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"footer-toggle-ctn\">\n  <a class=\"tooltips btn dashboard-btn ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.open : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.program(4, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += " pull-right\"\n    data-placement=\"top\" data-original-title=\""
    + escapeExpression(((helper = (helper = helpers.switcherMsg || (depth0 != null ? depth0.switcherMsg : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"switcherMsg","hash":{},"data":data}) : helper)))
    + "\">\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.open : depth0), {"name":"if","hash":{},"fn":this.program(6, data),"inverse":this.program(8, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n  </a>\n\n  <a class=\"btn pull-right\" href=\"/api/v2/csv\" target=\"_blank\" data-bypass>Export CSV</a>\n  <a class=\"btn pull-right embed-btn\">Embed code</a>\n</div>\n<a class=\"btn btn-large pull-right btn-showcase-mode\">Edit Showcase</a>\n";
},"2":function(depth0,helpers,partials,data) {
  return "dash-open";
  },"4":function(depth0,helpers,partials,data) {
  return "dash-close";
  },"6":function(depth0,helpers,partials,data) {
  return "Close Dashboard";
  },"8":function(depth0,helpers,partials,data) {
  return "Open Dashboard";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<h4>Admins</h4>\n<div class=\"well-content admins-ctn\"></div>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdmin : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":79}],35:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<a href=\"/users/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\">\n  "
    + escapeExpression(((helpers.getProfileImage || (depth0 && depth0.getProfileImage) || helperMissing).call(depth0, depth0, {"name":"getProfileImage","hash":{},"data":data})))
    + "\n</a>";
},"useData":true});

},{"hbsfy/runtime":79}],36:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  return "<a class=\"add-admins\">\n  <i class=\"icon-plus\"></i>\n</a>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<ul></ul>\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdmin : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":79}],37:[function(require,module,exports){
/**
 * VIEW: CollectionHeader Layout
 * 
 */

var 
    template = require('./templates/collection.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  ui: {
    "title": "#collection-title",
    "description": "#collection-description"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return (user && this.owner._id === user._id) || false;
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    var user = hackdash.user;

    if (user){
      var isAdmin = this.model.get("owner")._id === user._id;
      
      if (isAdmin){
        this.initEditables();
      }
    }

    $('.tooltips', this.$el).tooltip({});
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  initEditables: function(){
    var self = this;

    this.ui.title.editable({
      type: 'text',
      title: 'Enter title',
      emptytext: "Enter a title",
      inputclass: 'dashboard-edit-title',
      tpl: '<input type="text" maxlength="30">',

      success: function(response, newValue) {
        self.model.set('title', newValue);
        self.model.save();
      }
    });

    this.ui.description.editable({
      type: 'textarea',
      title: 'Enter description',
      emptytext: "Enter a description",
      inputclass: "dashboard-edit-desc",
      tpl: '<textarea maxlength="250" cols="50"></textarea>',

      success: function(response, newValue) {
        self.model.set('description', newValue);
        self.model.save();
      }
    });
  },

});
},{"./templates/collection.hbs":43}],38:[function(require,module,exports){
/**
 * VIEW: CollectionsHeader Layout
 * 
 */

var 
    template = require('./templates/collections.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/collections.hbs":44}],39:[function(require,module,exports){
/**
 * VIEW: DashboardHeader Layout
 * 
 */

var 
    template = require('./templates/dashboard.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  ui: {
    "title": "#dashboard-title",
    "description": "#dashboard-description",
    "link": "#dashboard-link"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return user && user.admin_in.indexOf(this.domain) >= 0 || false;
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.readOnly = (options && options.readOnly) || false;
  },

  onRender: function(){
    var user = hackdash.user;

    if (user){
      var isAdmin = user.admin_in.indexOf(this.model.get("domain")) >= 0;
      
      if (isAdmin){
        this.initEditables();
      }
    }

    $('.tooltips', this.$el).tooltip({});
  },

  serializeData: function(){
    return _.extend({
      readOnly: this.readOnly
    }, this.model.toJSON() || {});
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  initEditables: function(){
    var self = this;

    this.ui.title.editable({
      type: 'text',
      title: 'Enter title',
      emptytext: "Enter a title",
      inputclass: 'dashboard-edit-title',
      tpl: '<input type="text" maxlength="30">',

      success: function(response, newValue) {
        self.model.set('title', newValue);
        self.model.save();
      }
    });

    this.ui.description.editable({
      type: 'textarea',
      title: 'Enter description',
      emptytext: "Enter a description",
      inputclass: "dashboard-edit-desc",
      tpl: '<textarea maxlength="250" cols="50"></textarea>',

      success: function(response, newValue) {
        self.model.set('description', newValue);
        self.model.save();
      }
    });

    this.ui.link.editable({
      type: 'text',
      title: 'Enter a link',
      emptytext: "Enter a link",
      inputclass: "dashboard-edit-link",

      success: function(response, newValue) {
        self.model.set('link', newValue);
        self.model.save();
      }
    });
  },

});
},{"./templates/dashboard.hbs":45}],40:[function(require,module,exports){
/**
 * VIEW: DashboardsHeader Layout
 * 
 */

var 
    template = require('./templates/dashboards.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/dashboards.hbs":46}],41:[function(require,module,exports){

var 
  template = require('./templates/search.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "form",
  className: "formSearch",
  template: template,

  ui: {
    searchbox: "#searchInput"
  },

  events: {
    "keyup #searchInput": "search",
    "click .sort": "sort"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  lastSearch: "",

  initialize: function(options){
    this.showSort = (options && options.showSort) || false;
    this.collection = options && options.collection;
    this.placeholder = (options && options.placeholder) || "Type here";
  },

  onRender: function(){
    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      this.ui.searchbox.val(query);
      this.lastSearch = query;
    }
  },

  serializeData: function(){
    return {
      showSort: this.showSort,
      placeholder: this.placeholder
    };
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  sort: function(e){
    e.preventDefault();
    var val = $(e.currentTarget).data("option-value");
    this.collection.trigger("sort:" + val);
  },

  search: function(){
    var self = this;
    window.clearTimeout(this.timer);

    this.timer = window.setTimeout(function(){
      var keyword = self.ui.searchbox.val();
      var fragment = Backbone.history.fragment.replace(Backbone.history.location.search, "");

      if (keyword !== self.lastSearch) {
        self.lastSearch = keyword;

        var opts = {
          reset: true
        };

        if (keyword.length > 0) {
          opts.data = $.param({ q: keyword });
          
          hackdash.app.router.navigate(fragment + "?q=" + keyword, { trigger: true });

          self.collection.fetch(opts);
        }
        else {
          if (hackdash.app.type === "isearch"){
            self.collection.reset();
          }
          else {
            self.collection.fetch();
          }

          hackdash.app.router.navigate(fragment, { trigger: true, replace: true });
        }
      }
      
    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/search.hbs":48}],42:[function(require,module,exports){

var
    template = require('./templates/header.hbs')
  , Search = require('./Search')
  , DashboardHeader = require('./Dashboard')
  , DashboardsHeader = require('./Dashboards')
  , CollectionsHeader = require('./Collections')
  , CollectionHeader = require('./Collection');

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container",
  template: template,

  regions: {
    "search": ".search-ctn",
    "page": ".page-ctn"
  },

  ui: {
    pageTitle: ".page-title"
  },

  modelEvents: {
    "change": "render"
  },

  templateHelpers: {
    hackdashURL: function(){
      return "http://" + hackdash.baseURL;
    },
    isDashboardAdmin: function(){
      var isDashboard = (hackdash.app.type === "dashboard" ? true : false);

      var user = hackdash.user;
      return isDashboard && user && user.admin_in.indexOf(this.domain) >= 0 || false;
    }
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    var type = window.hackdash.app.type;

    var self = this;
    function showSearch(placeholder){
      self.search.show(new Search({
        showSort: type === "dashboard",
        placeholder: placeholder,
        collection: self.collection
      }));
    }

    switch(type){
      case "isearch":
        showSearch("Type here to search projects");
        this.ui.pageTitle.text("Projects");
        break;

      case "dashboards":
        showSearch();
        this.page.show(new DashboardsHeader());
        break;

      case "dashboard":
        showSearch();

        if (this.model.get("_id")){
          this.page.show(new DashboardHeader({
            model: this.model
          }));

          // Hack - Remove this after removal of dashboard subdomain
          window.document.title = (this.model.get('title') || "") + " HackDash";
        }
        break;

      case "collections":
        showSearch("Type here to search collections");
        this.page.show(new CollectionsHeader());
        break;

      case "collection":
        if (this.model.get("_id")){
          this.page.show(new CollectionHeader({
            model: this.model
          }));
        }
        break;

      case "project":
        if (this.model.get("_id")){
          this.page.show(new DashboardHeader({
            model: this.model,
            readOnly: true
          }));
        }
        break;
    }

    $('.tooltips', this.$el).tooltip({});
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./Collection":37,"./Collections":38,"./Dashboard":39,"./Dashboards":40,"./Search":41,"./templates/header.hbs":47}],43:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "\n  <h1>\n    <a id=\"collection-title\">"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</a>\n  </h1>\n\n  <p class=\"lead collection-lead\">\n    <a id=\"collection-description\">"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</a>\n  </p>\n\n";
},"3":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.title : depth0), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.description : depth0), {"name":"if","hash":{},"fn":this.program(6, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"4":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <h1>\n    "
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "\n  </h1>\n";
},"6":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <p class=\"lead\">"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdmin : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true});

},{"hbsfy/runtime":79}],44:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  return "  <a class=\"btn btn-large\" href=\"/dashboards\">Create a Collection</a>\n";
  },"3":function(depth0,helpers,partials,data) {
  return "  <a class=\"btn btn-large\" href=\"/login\">Login to manage collections</a>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<h1>Collections</h1>\n\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":79}],45:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var stack1, buffer = "    \n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.title : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.description : depth0), {"name":"if","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"2":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "    <h1>\n      "
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.link : depth0), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </h1>\n";
},"3":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "      <a class=\"dashboard-link\" href=\""
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\" data-bypass>site</a>\n";
},"5":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <p class=\"lead\">"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"7":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdmin : depth0), {"name":"if","hash":{},"fn":this.program(8, data),"inverse":this.program(10, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(12, data),"inverse":this.program(17, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"8":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "\n    <h1>\n      <a id=\"dashboard-title\">"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</a>\n    </h1>\n\n    <p class=\"lead dashboard-lead\">\n      <a id=\"dashboard-description\">"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</a>\n    </p>\n\n    <p class=\"dashboard-link\">\n      <a id=\"dashboard-link\">"
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "</a>\n    </p>\n\n";
},"10":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.title : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.description : depth0), {"name":"if","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"12":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.open : depth0), {"name":"if","hash":{},"fn":this.program(13, data),"inverse":this.program(15, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"13":function(depth0,helpers,partials,data) {
  return "    <a class=\"btn btn-large btn-new-project\" href=\"/projects/create\">New Project</a>\n";
  },"15":function(depth0,helpers,partials,data) {
  return "    <h4 class=\"tooltips dashboard-closed\" \n      data-placement=\"bottom\" data-original-title=\"Dashboard closed for creating projects\">Dashboard Closed</h4>\n";
  },"17":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.open : depth0), {"name":"if","hash":{},"fn":this.program(18, data),"inverse":this.program(20, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"18":function(depth0,helpers,partials,data) {
  return "    <a class=\"btn btn-large\" href=\"/login\">Login to create a project</a>\n";
  },"20":function(depth0,helpers,partials,data) {
  return "    <a class=\"btn btn-large\" href=\"/login\">Login to join/follow projects</a>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.readOnly : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.program(7, data),"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true});

},{"hbsfy/runtime":79}],46:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  return "  <a class=\"btn btn-large\" href=\"/collections\">View Collections</a>\n";
  },"3":function(depth0,helpers,partials,data) {
  return "  <a class=\"btn btn-large\" href=\"/login\">Login to create collections</a>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<h1>Create collections</h1>\n<p class=\"lead\">\n  Search through dashboards and add them to Collections\n</p>\n\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":79}],47:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", blockHelperMissing=helpers.blockHelperMissing, buffer = "  <a class=\"btn-profile\" href=\"/users/profile\">\n    <img class=\"avatar tooltips\" src=\""
    + escapeExpression(((helpers.user || (depth0 && depth0.user) || helperMissing).call(depth0, "picture", {"name":"user","hash":{},"data":data})))
    + "\" rel=\"tooltip\" data-placement=\"bottom\" data-original-title=\"Edit profile\">\n\n";
  stack1 = ((helper = (helper = helpers.isDashboardView || (depth0 != null ? depth0.isDashboardView : depth0)) != null ? helper : helperMissing),(options={"name":"isDashboardView","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </a>  \n  <a class=\"btn logout\" href=\"/logout\" data-bypass>Logout</a>\n";
},"2":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isDashboardAdmin : depth0), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"3":function(depth0,helpers,partials,data) {
  return "      <span class=\"admin-label\">Admin</span>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"search-ctn\"></div>\n\n<div class=\"createProject pull-right btn-group\">\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n\n<a class=\"logo\" href=\""
    + escapeExpression(((helper = (helper = helpers.hackdashURL || (depth0 != null ? depth0.hackdashURL : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"hackdashURL","hash":{},"data":data}) : helper)))
    + "\" data-bypass></a>\n\n<div class=\"page-ctn\"></div>\n<h1 class=\"page-title\"></h1>";
},"useData":true});

},{"hbsfy/runtime":79}],48:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  return "<div class=\"orderby\">\n  <div class=\"btn-group\">\n    <button data-option-value=\"name\" class=\"sort btn\">By Name</button>\n    <button data-option-value=\"date\" class=\"sort btn\">By Date</button>\n    <button data-option-value=\"showcase\" class=\"sort btn\">Showcase</button>\n  </div>\n</div>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "<i class=\"icon-large icon-search\"></i>\n<input id=\"searchInput\" type=\"text\" class=\"search-query input-large\" placeholder=\""
    + escapeExpression(((helper = (helper = helpers.placeholder || (depth0 != null ? depth0.placeholder : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"placeholder","hash":{},"data":data}) : helper)))
    + "\"/>\n\n";
  stack1 = ((helper = (helper = helpers.isDashboardView || (depth0 != null ? depth0.isDashboardView : depth0)) != null ? helper : helperMissing),(options={"name":"isDashboardView","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":79}],49:[function(require,module,exports){

var template = require("./templates/home.hbs")
  , Dashboards = require("../../models/Dashboards");

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container-fluid",
  template: template,

  ui: {
    "domain": "#domain",
    "create": "#create-dashboard",
    "projects": "#search-projects",
    "collections": "#search-collections"
  },

  events: {
    "keyup #domain": "validateDomain",
    "click #create-dashboard": "createDashboard",

    "keyup #search-projects": "checkSearchProjects",
    "click #search-projects-btn": "searchProjects",

    "keyup #search-collections": "checkSearchCollections",
    "click #search-collections-btn": "searchCollections",

    "click #create-collections-btn": "createCollections"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //TODO: move to i18n
  errors: {
    "subdomain_invalid": "Subdomain invalid",
    "subdomain_inuse": "Subdomain is in use"
  },

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  validateDomain: function(){
    var name = this.ui.domain.val();
    this.cleanErrors();

    if(/^[a-z0-9]{5,10}$/.test(name)) {
      this.ui.domain.parent().addClass('success').removeClass('error');
      this.ui.create.removeClass('disabled');
    } else {
      this.ui.domain.parent().addClass('error').removeClass('success');
      this.ui.create.addClass('disabled');
    }

  },

  createDashboard: function(){
    var domain = this.ui.domain.val();

    this.cleanErrors();

    this.ui.create.button('loading');

    var dash = new Dashboards([]);

    dash.create({ domain: domain }, {
      success: this.redirectToSubdomain.bind(this, domain),
      error: this.showError.bind(this)
    });
  },

  checkSearchProjects: function(e){
    if (this.isEnterKey(e)){
      this.searchProjects();
    }
  },

  checkSearchCollections: function(e){
    if (this.isEnterKey(e)){
      this.searchCollections();
    }
  },

  searchProjects: function(){
    var q = this.ui.projects.val();
    q = q ? "?q=" + q : "";
    
    window.location = "/projects" + q;
  },

  searchCollections: function(){
    var q = this.ui.collections.val();
    q = q ? "?q=" + q : "";

    window.location = "/collections" + q;
  },

  createCollections: function(){
    window.location = "/dashboards";
  },

  showError: function(view, err){
    this.ui.create.button('reset');

    if (err.responseText === "OK"){
      this.redirectToSubdomain(this.ui.domain.val());
      return;
    }

    var error = JSON.parse(err.responseText).error;

    this.ui.domain.parents('.control-group').addClass('error').removeClass('success');
    this.ui.domain.after('<span class="help-inline">' + this.errors[error] + '</span>');
  },

  cleanErrors: function(){
    $(".error", this.$el).removeClass("error").removeClass('success');
    $("span.help-inline", this.$el).remove();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  redirectToSubdomain: function(name){
    window.location = "http://" + name + "." + hackdash.baseURL;
  },

  isEnterKey: function(e){
    var key = e.keyCode || e.which;
    return (key === 13);
  }

});
},{"../../models/Dashboards":11,"./templates/home.hbs":50}],50:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  return "        <form>\n          <p class=\"control-group\">\n            <input class=\"input-xlarge\" id=\"domain\" maxlength=\"10\"\n              placeholder=\"Hackathon domain Name (5-10 chars)\" type=\"text\">\n            <label>(5-10 lowercase letters/numbers)</label>\n          </p>\n\n          <p>\n            <input id=\"create-dashboard\" class=\"btn btn-large btn-custom disabled\" type=\"button\" value=\"Create a Dashboard\">\n          </p>\n        </form>\n";
  },"3":function(depth0,helpers,partials,data) {
  return "        <p>\n          <a class=\"btn btn-large btn-custom\" href=\"/login\">Log in to create a Hackathon</a>\n        </p>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n      \n    <section class=\"brand\">\n      <header>\n        <h1><a href=\"#\">HackDash</a></h1>\n      </header>\n\n      <div class=\"content\">\n        <h2>Ideas for a hackathon</h2>\n        <p>Upload your project. Add colaborators. Inform status. Share your app.</p>\n\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "      </div>\n    </section>\n  </div>\n</div>\n\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n    <div class=\"span6\">\n      <section class=\"block\">\n        <header>\n          <h3>Find Projects</h3>\n          <p>Search hackathon projects all over the world in one place.</p>\n        </header>\n\n        <div class=\"content span12\">\n          <p class=\"control-group\">\n            <input class=\"input-large search-box\" id=\"search-projects\"\n              placeholder=\"name or description\" type=\"text\">\n            <button class=\"btn btn-large btn-custom disabled search-btn\" id=\"search-projects-btn\">Search</button>\n          </p>\n        </div>\n      </section>\n    </div>\n\n    <div class=\"span6\">\n      <section class=\"block\">\n        <header>\n          <h3>Find Collections</h3>\n          <p>Search and organize groups of dashboards with \"Collections\".</p>\n        </header>\n\n        <div class=\"content span12\">\n          <p class=\"control-group\">\n            <input class=\"input-large search-box\" id=\"search-collections\"\n              placeholder=\"name or description\" type=\"text\">\n            <button class=\"btn btn-large btn-custom disabled search-btn\" id=\"search-collections-btn\">Search</button>\n            <button class=\"btn btn-large btn-custom disabled search-btn\" id=\"create-collections-btn\">Create</button>\n          </p>\n        </div>\n      </section>\n    </div>\n\n  </div>\n</div>\n\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n    <section class=\"block\">\n      <header>\n        <h3>About</h3>\n      </header>\n\n      <div class=\"content span11\">\n        <p>The HackDash was born by accident and by a need.\n        We were looking for platform to track ideas through\n        hackathons in the line to the Hacks/Hackers Media\n        Party organized by @HacksHackersBA where hackers\n        and journalists share ideas. We spread the idea\n        through Twitter and that was the context of the\n        HackDash born. @blejman had an idea and\n        @danzajdband was interested in implement that idea.\n        So we started building the app hoping we can get to\n        the Buenos Aires media party with something that\n        doesn't suck. The Media Party Hackathon day came\n        followed by a grateful surprise. Not only the\n        people liked the HackDash implementation but a\n        couple of coders added the improvement of the\n        HackDash as a Hackaton project. After the Media\n        Party we realized that this small app is filling a\n        real need. The Dashboard has been used now in\n        several ways like Node.js Argentina meetup,\n        HacksHackersBA, La Nación DataFest and\n        HackasHackersCL (using it as a Wordpress theme).\n        Now, the HackDash will be an standard for\n        hackathons through the PinLatAm program, for news\n        innovation in Latin America. Create your own\n        hackathon.</p>\n      </div>\n    </section>\n  </div>\n</div>\n\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n    <section class=\"block\">\n      <header>\n        <h3>Why Hackdash?</h3>\n      </header>\n\n      <div class=\"content\">\n        <div class=\"row-fluid\">\n          <div class=\"span10 offset1 brand-why\">\n            <div class=\"span3\">\n              <div class=\"icon quick\"></div>\n              <h5>Quick and Easy</h5>\n            </div>\n\n            <div class=\"span3\">\n              <div class=\"icon nerds\"></div>\n              <h5>For Nerds</h5>\n            </div>\n\n            <div class=\"span3\">\n              <div class=\"icon fast\"></div>\n              <h5>Fast</h5>\n            </div>\n\n            <div class=\"span3\">\n              <div class=\"icon geeks\"></div>\n              <h5>Love &amp; Geeks</h5>\n            </div>\n          </div>\n        </div>\n      </div>\n    </section>\n  </div>\n</div>\n\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n    <section class=\"block\">\n      <header>\n        <h3>Partners</h3>\n      </header>\n\n      <div class=\"content\">\n        <div class=\"row-fluid\">\n          <div class=\"span10 offset2 partners\">\n            <div class=\"span5 hhba\"></div>\n            <div class=\"span5 nxtp\"></div>\n          </div>\n        </div>\n      </div>\n    </section>\n  </div>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":79}],51:[function(require,module,exports){
/**
 * VIEW: Login Modal
 * 
 */
 
var template = require('./templates/login.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "modal",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onClose: function(){
    window.history.back();
  }

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/login.hbs":71}],52:[function(require,module,exports){
/**
 * REGION: ModalRegion
 * Used to manage Twitter Bootstrap Modals with Backbone Marionette Views
 */

module.exports = Backbone.Marionette.Region.extend({
  el: "#modals-container",

  constructor: function(){
    _.bindAll(this);
    Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
    this.on("show", this.showModal, this);
  },

  getEl: function(selector){
    var $el = $(selector);
    $el.on("hidden", this.close);
    return $el;
  },

  showModal: function(view){
    view.on("close", this.hideModal, this);
    this.$el.modal('show');
  },

  hideModal: function(){
    this.$el.modal('hide');
  }
  
});

},{}],53:[function(require,module,exports){
/**
 * VIEW: ProfileCard
 * 
 */
 
var template = require('./templates/card.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "boxxy",
  template: template,

  modelEvents:{
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/card.hbs":56}],54:[function(require,module,exports){
/**
 * VIEW: ProfileCard Edit
 * 
 */
 
var template = require('./templates/cardEdit.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "boxxy",
  template: template,

  ui: {
    "name": "input[name=name]",
    "email": "input[name=email]",
    "bio": "textarea[name=bio]"
  },

  events: {
    "click #save": "saveProfile",
    "click #cancel": "cancel"
  },

  modelEvents:{
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  saveProfile: function(){
    var toSave = {};

    _.each(this.ui, function(ele, type){
      toSave[type] = ele.val();
    }, this);

    this.cleanErrors();

    $("#save", this.$el).button('loading');

    this.model
      .save(toSave, { patch: true, silent: true })
      .error(this.showError.bind(this));
  },

  cancel: function(){
    hackdash.app.router.navigate("/", { trigger: true, replace: true });
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  //TODO: move to i18n
  errors: {
    "name_required": "Name is required",
    "email_required": "Email is required",
    "email_invalid": "Invalid Email"
  },

  showError: function(err){
    $("#save", this.$el).button('reset');

    if (err.responseText === "OK"){
      return;
    }

    var error = JSON.parse(err.responseText).error;

    var ctrl = error.split("_")[0];
    this.ui[ctrl].parents('.control-group').addClass('error');
    this.ui[ctrl].after('<span class="help-inline">' + this.errors[error] + '</span>');
  },

  cleanErrors: function(){
    $(".error", this.$el).removeClass("error");
    $("span.help-inline", this.$el).remove();
  }

});
},{"./templates/cardEdit.hbs":57}],55:[function(require,module,exports){

var 
    template = require("./templates/profile.hbs")
  , ProfileCard = require("./Card")
  , ProfileCardEdit = require("./CardEdit")
  , ProjectList = require("../Project/List");

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container profile-ctn",
  template: template,

  regions: {
    "profileCard": ".profile-card",
    "collections": ".collections-ctn",
    "dashboards": ".dashboards-ctn",
    "projects": ".projects-ctn",
    "contributions": ".contributions-ctn",
    "likes": ".likes-ctn",
  },

  ui: {
    "collectionsLen": ".coll-length",
    "dashboardsLen": ".dash-length",
    "projectsLen": ".proj-length",
    "contributionsLen": ".contrib-length",
    "likesLen": ".likes-length"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){

    if (hackdash.user && this.model.get("_id") === hackdash.user._id){
      this.profileCard.show(new ProfileCardEdit({
        model: this.model
      }));
    }
    else {
      this.profileCard.show(new ProfileCard({
        model: this.model
      }));
    }

    this.collections.show(new ProjectList({
      collection: this.model.get("collections"),
      isCollection: true
    }));

    this.dashboards.show(new ProjectList({
      collection: this.model.get("dashboards"),
      isDashboard: true
    }));

    this.projects.show(new ProjectList({
      collection: this.model.get("projects")
    }));

    this.contributions.show(new ProjectList({
      collection: this.model.get("contributions")
    }));

    this.likes.show(new ProjectList({
      collection: this.model.get("likes")
    }));

    $('.tooltips', this.$el).tooltip({});

    this.model.get("collections").on("reset", this.updateCount.bind(this, "collections"));
    this.model.get("dashboards").on("reset", this.updateCount.bind(this, "dashboards"));
    this.model.get("projects").on("reset", this.updateCount.bind(this, "projects"));
    this.model.get("contributions").on("reset", this.updateCount.bind(this, "contributions"));
    this.model.get("likes").on("reset", this.updateCount.bind(this, "likes"));

  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  updateCount: function(which){
    this.ui[which + "Len"].text(this.model.get(which).length);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"../Project/List":63,"./Card":53,"./CardEdit":54,"./templates/profile.hbs":58}],56:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function";
  return "<h3 class=\"header\">\n  "
    + escapeExpression(((helpers.getProfileImage || (depth0 && depth0.getProfileImage) || helperMissing).call(depth0, depth0, {"name":"getProfileImage","hash":{},"data":data})))
    + "\n  "
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\n</h3>\n<div class=\"profileInfo\">\n  <p><strong>Email: </strong>"
    + escapeExpression(((helper = (helper = helpers.email || (depth0 != null ? depth0.email : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"email","hash":{},"data":data}) : helper)))
    + "</p>\n  <p><strong>Bio: </strong>"
    + escapeExpression(((helper = (helper = helpers.bio || (depth0 != null ? depth0.bio : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"bio","hash":{},"data":data}) : helper)))
    + "</p>\n</div>";
},"useData":true});

},{"hbsfy/runtime":79}],57:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<h3 class=\"header\">Edit Your Profile</h3>\n<div>\n  <form>\n    <div class=\"form-content\">\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <input name=\"name\" type=\"text\" placeholder=\"Name\" value=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\" class=\"input-block-level\"/>\n        </div>\n      </div>\n      <div class=\"control-group\">\n        <div class=\"controls\">      \n          <input name=\"email\" type=\"text\" placeholder=\"Email\" value=\""
    + escapeExpression(((helper = (helper = helpers.email || (depth0 != null ? depth0.email : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"email","hash":{},"data":data}) : helper)))
    + "\" class=\"input-block-level\"/>\n        </div>\n      </div>\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <textarea name=\"bio\" placeholder=\"Some about you\" class=\"input-block-level\">"
    + escapeExpression(((helper = (helper = helpers.bio || (depth0 != null ? depth0.bio : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"bio","hash":{},"data":data}) : helper)))
    + "</textarea>\n        </div>\n      </div>\n    </div>\n    <div class=\"form-actions\">\n      <input id=\"save\" type=\"button\" data-loading-text=\"saving..\" value=\"Save profile\" class=\"btn primary btn-success pull-left\"/>\n      <a id=\"cancel\" class=\"cancel btn btn-cancel pull-right\">Cancel</a>\n    </div>\n  </form>\n</div>";
},"useData":true});

},{"hbsfy/runtime":79}],58:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"span6 span-center\">\n\n  <div class=\"profile-card\"></div>\n\n  <h4>My Collections (<span class=\"coll-length\">0</span>)</h4>\n  <div class=\"collections-ctn\"></div>\n\n  <h4>Dashboards (<span class=\"dash-length\">0</span>)</h4>\n  <div class=\"dashboards-ctn\"></div>\n\n  <h4>Projects created (<span class=\"proj-length\">0</span>)</h4>\n  <div class=\"projects-ctn\"></div>\n\n  <h4>Contributions (<span class=\"contrib-length\">0</span>)</h4>\n  <div class=\"contributions-ctn\"></div>\n\n  <h4>Likes (<span class=\"likes-length\">0</span>)</h4>\n  <div class=\"likes-ctn\"></div>\n  \n</div>\n";
  },"useData":true});

},{"hbsfy/runtime":79}],59:[function(require,module,exports){
/**
 * VIEW: Projects of an Instance
 * 
 */

var Project = require('./index');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: "projects",
  className: "row projects",
  itemView: Project,
  
  collectionEvents: {
    "remove": "render",
    "sort:date": "sortByDate",
    "sort:name": "sortByName",
    "sort:showcase": "sortByShowcase"
  },

  gridSize: {
    columnWidth: 300,
    rowHeight: 220
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  initialize: function(options){
    this.showcaseMode = (options && options.showcaseMode) || false;
    this.showcaseSort = (options && options.showcaseSort) || false;
  },

  onRender: function(){

    var self = this;
    _.defer(function(){
      if (self.showcaseSort) {
        self.updateIsotope("showcase", ".filter-active");
      }
      else {
        self.updateIsotope();
      }

      if (self.showcaseMode){
        self.startSortable();
      }
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  updateShowcaseOrder: function(){
    var itemElems = this.pckry.getItemElements();
    var showcase = [];

    for ( var i=0, len = itemElems.length; i < len; i++ ) {
      var elem = itemElems[i];
      $(elem).data('showcase', i);

      var found = this.collection.where({ _id: elem.id, active: true });
      if (found.length > 0){
        found[0].set({ 
          "showcase": i
        }, { silent: true });
      }

      showcase.push(elem.id);
    }

    this.pckry.destroy();

    return showcase;
  },

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  sortByName: function(){
    this.$el
      .isotope({"filter": ""})
      .isotope({"sortBy": "name"});
  },

  sortByDate: function(){
    this.$el
      .isotope({"filter": ""})
      .isotope({"sortBy": "date"});
  },

  sortByShowcase: function(){
    this.$el
      .isotope({"filter": ".filter-active"})
      .isotope({"sortBy": "showcase"});
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  isotopeInitialized: false,
  updateIsotope: function(sortType, filterType){
    var $projects = this.$el;

    if (this.isotopeInitialized){
      $projects.isotope("destroy");
    }

    $projects.isotope({
        itemSelector: ".project"
      , animationEngine: "jquery"
      , resizable: true
      , sortAscending: true
      , cellsByColumn: this.gridSize
      , getSortData : {
          "name" : function ( $elem ) {
            var name = $elem.data("name");
            return name && name.toLowerCase() || "";
          },
          "date" : function ( $elem ) {
            return $elem.data("date");
          },
          "showcase" : function ( $elem ) {
            var showcase = $elem.data("showcase");
            return (showcase && window.parseInt(showcase)) || 0;
          },
        }
      , sortBy: sortType || "name"
      , filter: filterType || ""
    });
    
    this.isotopeInitialized = true;
  },

  startSortable: function(){
    var $projects = this.$el;

    $projects.addClass("showcase");
    this.sortByShowcase();

    if (this.pckry){
      this.pckry.destroy();
    }

    this.pckry = new Packery( $projects[0], this.gridSize); 

    var itemElems = this.pckry.getItemElements();

    for ( var i=0, len = itemElems.length; i < len; i++ ) {
      var elem = itemElems[i];
      var draggie = new Draggabilly( elem );
      this.pckry.bindDraggabillyEvents( draggie );
    }

    var self = this;
    this.pckry.on( 'dragItemPositioned', function() { 
      self.model.isDirty = true;
    });
  }

});
},{"./index":65}],60:[function(require,module,exports){
/**
 * VIEW: Project
 * 
 */
 
var template = require('./templates/edit.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "span6 span-center",
  template: template,

  ui: {
    "title": "input[name=title]",
    "description": "textarea[name=description]",
    "link": "input[name=link]",
    "tags": "input[name=tags]",
    "status": "select[name=status]",
  },

  events: {
    "click #ghImportBtn": "showGhImport",
    "click #searchGh": "searchRepo",

    "click #save": "save",
    "click #cancel": "cancel"
  },

  templateHelpers: {
    typeForm: function(){
      return (this._id ? "Edit Project" : "Create Project" );
    },
    getTags: function(){
      if (this.tags){
        return this.tags.join(',');
      }
    },
    statuses: function(){
      return window.hackdash.statuses.split(",");
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onDomRefresh: function(){
    this.initSelect2();
    this.initImageDrop();
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  showGhImport: function(e){
    $(".gh-import", this.$el).removeClass('hidden');
    $(e.currentTarget).remove();

    e.preventDefault();
  },

  searchRepo: function(e){
    var repo = $("#txt-repo", this.$el).val();

    if(repo.length) {
      $.ajax({
        url: 'https://api.github.com/repos/' + repo,
        dataType: 'json',
        contentType: 'json',
        context: this
      }).done(this.fillGhProjectForm);
    }

    e.preventDefault();
  },

  save: function(){

    var toSave = {
      title: this.ui.title.val(),
      description: this.ui.description.val(),
      link: this.ui.link.val(),
      tags: this.ui.tags.val().split(','),
      status: this.ui.status.val(),
      cover: this.model.get('cover')
    };

    this.cleanErrors();

    $("#save", this.$el).button('loading');

    this.model
      .save(toSave, { patch: true, silent: true })
      .success(this.redirect.bind(this))
      .error(this.showError.bind(this));
  },

  cancel: function(){
    this.redirect();
  },

  redirect: function(){
    hackdash.app.router.navigate("/", { trigger: true, replace: true });
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  //TODO: move to i18n
  errors: {
    "title_required": "Title is required",
    "description_required": "Description is required"
  },

  showError: function(err){
    $("#save", this.$el).button('reset');

    if (err.responseText === "OK"){
      this.redirect();
      return;
    }

    var error = JSON.parse(err.responseText).error;

    var ctrl = error.split("_")[0];
    this.ui[ctrl].parents('.control-group').addClass('error');
    this.ui[ctrl].after('<span class="help-inline">' + this.errors[error] + '</span>');
  },

  cleanErrors: function(){
    $(".error", this.$el).removeClass("error");
    $("span.help-inline", this.$el).remove();
  },

  initSelect2: function(){
    if (this.model.get('status')){
      this.ui.status.val(this.model.get('status'));
    }
    
    this.ui.status.select2({
      minimumResultsForSearch: 10
    });


    $('a.select2-choice').attr('href', null);

    this.ui.tags.select2({
      tags:[],
      formatNoMatches: function(){ return ''; },
      maximumInputLength: 20,
      tokenSeparators: [","]
    });
  },

  initImageDrop: function(){
    var self = this;
    var $dragdrop = $('#dragdrop', this.$el);
    var input = $('#cover_fall', $dragdrop);

    input.on('click', function(e){
      e.stopPropagation();
    });

    $dragdrop.on('click', function(e){
      input.click();
      e.preventDefault();
      return false;
    });

    $dragdrop.filedrop({
      fallback_id: 'cover_fall',
      url: hackdash.apiURL + '/projects/cover',
      paramname: 'cover',
      allowedfiletypes: ['image/jpeg','image/png','image/gif'],
      maxfiles: 1,
      maxfilesize: 3,
      dragOver: function () {
        $dragdrop.css('background', 'rgb(226, 255, 226)');
      },
      dragLeave: function () {
        $dragdrop.css('background', 'rgb(241, 241, 241)');
      },
      drop: function () {
        $dragdrop.css('background', 'rgb(241, 241, 241)');
      },
      uploadFinished: function(i, file, res) {
        self.model.set({ "cover": res.href }, { silent: true });

        $dragdrop
          .css('background', 'url(' + res.href + ')')
          .addClass("project-image")
          .children('p').hide();
      }
    });
  },

  fillGhProjectForm: function(project) {
    this.ui.title.val(project.name);
    this.ui.description.text(project.description);
    this.ui.link.val(project.html_url);
    this.ui.tags.select2("data", [{id: project.language, text:project.language}]);
    this.ui.status.select2("val", "building");
  }

});
},{"./templates/edit.hbs":66}],61:[function(require,module,exports){
/**
 * VIEW: Full Project view
 * 
 */
 
var template = require('./templates/full.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },

  className: "project",
  template: template,

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    this.$el.addClass(this.model.get("status"));
    $('.tooltips', this.$el).tooltip({});
  }

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/full.hbs":67}],62:[function(require,module,exports){
/**
 * VIEW: Dashboard Projects Layout
 * 
 */

var template = require('./templates/layout.hbs')
  , ProjectsView = require('./Collection');

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  ui: {
    inactiveCtn: ".inactive-ctn"
  },

  regions: {
    "dashboard": "#dashboard-projects",
    "inactives": "#inactive-projects"
  },
  
  modelEvents:{
    "edit:showcase": "onStartEditShowcase",
    "end:showcase": "onEndEditShowcase",
    "save:showcase": "onSaveEditShowcase"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  showcaseMode: false,
  showcaseSort: false,

  onRender: function(){
    
    if (this.showcaseMode){
      this.dashboard.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects.getActives(),
        showcaseMode: true
      }));

      this.ui.inactiveCtn.removeClass("hide");

      this.inactives.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects.getInactives()
      }));

      var self = this;
      hackdash.app.projects.off("change:active").on("change:active", function(){
        self.dashboard.currentView.collection = hackdash.app.projects.getActives();
        self.inactives.currentView.collection = hackdash.app.projects.getInactives();

        self.model.isDirty = true;

        self.dashboard.currentView.render();
        self.inactives.currentView.render();
      });
    }
    else {
      this.ui.inactiveCtn.addClass("hide");

      this.dashboard.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects,
        showcaseMode: false,
        showcaseSort: this.showcaseSort
      }));
    }
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  onStartEditShowcase: function(){
    this.showcaseMode = true;
    this.render();
  },

  onSaveEditShowcase: function(){
    var showcase = this.dashboard.currentView.updateShowcaseOrder();
    this.model.save({ "showcase": showcase });

    this.model.isDirty = false;
    this.onEndEditShowcase();
  },

  onEndEditShowcase: function(){
    this.model.isShowcaseMode = false;
    this.model.trigger("change");

    this.showcaseSort = true;
    this.showcaseMode = false;
    this.render();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./Collection":59,"./templates/layout.hbs":68}],63:[function(require,module,exports){
/**
 * VIEW: Projects of an Instance
 * 
 */

var Project = require('./ListItem');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "ul",
  itemView: Project,

  itemViewOptions: function() {
    return {
      isDashboard: this.isDashboard,
      isCollection: this.isCollection
    };
  },

  showAll: false,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  initialize: function(options){
    this.fullList = options.collection;
    this.isDashboard = (options && options.isDashboard) || false;
    this.isCollection = (options && options.isCollection) || false;
  },

  onBeforeRender: function(){
    if (this.fullList.length > 5){
      if (this.showAll) {
        this.collection = this.fullList;
      }
      else {
        this.collection = new Backbone.Collection(this.fullList.first(5));
      }
    }
  },

  onRender: function(){
    $(".show-more", this.$el).add(".show-less", this.$el).remove();

    if (this.fullList.length > 5){
      var li;
      if (this.showAll){
        li = $('<li class="show-less">Show less</li>');
        li.on("click", this.toggleAll.bind(this)); 
      }
      else {
        li = $('<li class="show-more">Show more</li>');
        li.on("click", this.toggleAll.bind(this));
      }

      this.$el.append(li);
    }
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  toggleAll: function(){
    this.showAll = !this.showAll;
    this.render();
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./ListItem":64}],64:[function(require,module,exports){
/**
 * VIEW: Project
 * 
 */
 
var template = require('./templates/listItem.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "li tooltips",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.isDashboard = (options && options.isDashboard) || false;
    this.isCollection = (options && options.isCollection) || false;
  },

  onRender: function(){
    this.$el
      .addClass(this.model.get("status"))
      .attr({
        "title": this.model.get("status"),
        "data-placement": "left"
      })
      .tooltip({});
  },

  serializeData: function(){
    var url;

    if (this.isDashboard){
      url = "http://" + this.model.get("title")  + "." + hackdash.baseURL; 
    }
    else if(this.isCollection){
      url = "http://" + hackdash.baseURL + "/collections/" + this.model.get("_id");
    }
    else {
      url = "http://" + this.model.get("domain") + "." + hackdash.baseURL + 
        "/projects/" + this.model.get("_id");
    }

    return _.extend({
      url: url
    }, this.model.toJSON());
  }

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/listItem.hbs":69}],65:[function(require,module,exports){
/**
 * VIEW: Project
 * 
 */
 
var template = require('./templates/project.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },
  className: "project tooltips span4",
  template: template,

  ui: {
    "switcher": ".switcher input"
  },

  events: {
    "click .contributor a": "onContribute",
    "click .follower a": "onFollow",
    "click .remove a": "onRemove",

    "click .edit a": "stopPropagation",

    "click .demo a": "stopPropagation",
    "click .switcher": "stopPropagation",
    "click #contributors a": "stopPropagation"
  },

  templateHelpers: {
    instanceURL: function(){
      return "http://" + this.domain + "." + hackdash.baseURL;
    },
    showActions: function(){
      return hackdash.user._id !== this.leader._id;
    },
    isAdminOrLeader: function(){
      var user = hackdash.user;
      return user._id === this.leader._id || user.admin_in.indexOf(this.domain) >= 0;
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    this.$el
      .addClass(this.model.get("status"))
      .attr({
          "title": this.model.get("status")
        , "data-name": this.model.get("title")
        , "data-date": this.model.get("created_at")
        , "data-showcase": this.model.get("showcase")
      })
      .tooltip({});

    if (this.model.get("active")){
      this.$el.addClass('filter-active');
    }
    else {
      this.$el.removeClass('filter-active');
    }

    $('.tooltips', this.$el).tooltip({});

    var url = "http://" + this.model.get("domain") + "." + hackdash.baseURL + 
      "/projects/" + this.model.get("_id");

    this.$el.on("click", function(){
      if (!$('.projects').hasClass("showcase")){
        window.location = url;
      }
    });

    this.initSwitcher();
  },

  serializeData: function(){
    return _.extend({
      isShowcaseMode: hackdash.app.dashboard && hackdash.app.dashboard.isShowcaseMode,
      contributing: this.isContributor(),
      following: this.isFollower()
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  stopPropagation: function(e){
    e.stopPropagation();
  },

  onContribute: function(e){
    if (this.isContributor()){
      this.model.leave();
    }
    else {
      this.model.join();
    }

    e.stopPropagation();
  },

  onFollow: function(e){
    if (this.isFollower()){
      this.model.unfollow();
    }
    else {
      this.model.follow();
    }

    e.stopPropagation();
  },

  onRemove: function(e){
    if (window.confirm("This project is going to be deleted. Are you sure?")){
      this.model.destroy();
    }

    e.stopPropagation();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  initSwitcher: function(){
    var self = this;

    this.ui.switcher
      .bootstrapSwitch()
      .on('switch-change', function (e, data) {
        self.model.set("active", data.value);
      });
  },

  isContributor: function(){
    return this.userExist(this.model.get("contributors"));
  },

  isFollower: function(){
    return this.userExist(this.model.get("followers"));
  },

  userExist: function(arr){

    if (!hackdash.user){
      return false;
    }

    var uid = hackdash.user._id;
    return _.find(arr, function(usr){
      return (usr._id === uid);
    }) ? true : false;
  }

});
},{"./templates/project.hbs":70}],66:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  return "        <div id=\"ghImportHolder\">\n          <a id=\"ghImportBtn\">Import from Github</a>\n\n          <div class=\"gh-import control-group hidden\">\n            <div class=\"controls\">\n              <input id=\"txt-repo\" type=\"text\" placeholder=\"repo user/name\" name=\"repo\" class=\"input-block-level\"/>\n              <button id=\"searchGh\" class=\"btn\">Import</button>\n            </div>\n          </div>\n        </div>\n";
  },"3":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "style=\"background: url("
    + escapeExpression(((helper = (helper = helpers.cover || (depth0 != null ? depth0.cover : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"cover","hash":{},"data":data}) : helper)))
    + ");\" class=\"project-image\"";
},"5":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "              <option value=\""
    + escapeExpression(lambda(depth0, depth0))
    + "\">"
    + escapeExpression(lambda(depth0, depth0))
    + "</option>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"boxxy\">\n  <h3 class=\"header\">"
    + escapeExpression(((helper = (helper = helpers.typeForm || (depth0 != null ? depth0.typeForm : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"typeForm","hash":{},"data":data}) : helper)))
    + "</h3>\n  <div>\n    <form>\n      <div class=\"form-content\">\n";
  stack1 = helpers.unless.call(depth0, (depth0 != null ? depth0._id : depth0), {"name":"unless","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <input type=\"text\" placeholder=\"Title\" name=\"title\" class=\"input-block-level\" value=\""
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "\"/>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <textarea id=\"description\" name=\"description\" rows=\"4\" maxlength=\"400\" placeholder=\"Description\" class=\"input-block-level\">"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</textarea>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <div id=\"dragdrop\" ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.cover : depth0), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "> \n              <p>Drag Photo Here\n                <input type=\"file\" name=\"cover_fall\" id=\"cover_fall\"/>\n              </p>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <input type=\"text\" name=\"link\" id=\"link\" placeholder=\"Link\" class=\"input-block-level\" value=\""
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "\"/>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <input type=\"text\" name=\"tags\" id=\"tags\" placeholder=\"Tags\" style=\"width: 100%\" class=\"input-block-level\" value=\""
    + escapeExpression(((helper = (helper = helpers.getTags || (depth0 != null ? depth0.getTags : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"getTags","hash":{},"data":data}) : helper)))
    + "\"/>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <select name=\"status\" id=\"status\" style=\"width: 100%\" class=\"input-block-level\" value=\""
    + escapeExpression(((helper = (helper = helpers.status || (depth0 != null ? depth0.status : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"status","hash":{},"data":data}) : helper)))
    + "\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.statuses : depth0), {"name":"each","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "            </select>\n          </div>\n        </div>\n\n      </div>\n\n      <div class=\"form-actions\">\n        <input id=\"save\" type=\"button\" value=\"Save\" class=\"btn primary btn-success pull-left\"/>\n        <a id=\"cancel\" data-dismiss=\"modal\" class=\"cancel btn btn-cancel pull-right\">Cancel</a>\n      </div>\n\n    </form>\n  </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":79}],67:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <a href=\""
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"3":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "        <li>"
    + escapeExpression(lambda(depth0, depth0))
    + "</li>\n";
},"5":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "            <a href=\"/users/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\">\n              "
    + escapeExpression(((helpers.getProfileImage || (depth0 && depth0.getProfileImage) || helperMissing).call(depth0, depth0, {"name":"getProfileImage","hash":{},"data":data})))
    + "\n            </a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, lambda=this.lambda, buffer = "<div class=\"well full-project\">\n  \n  <div class=\"well-header\">\n    <h3><a href=\"/\">"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "</a></h3>\n    <h3>"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h3>\n    <p>"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.link : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "  </div>\n\n  <div class=\"row-fluid\">\n\n    <div class=\"well-sidebar span4\">\n      <h6>Created</h6><strong>"
    + escapeExpression(((helpers.timeAgo || (depth0 && depth0.timeAgo) || helperMissing).call(depth0, (depth0 != null ? depth0.created_at : depth0), {"name":"timeAgo","hash":{},"data":data})))
    + "</strong>\n      <h6>State</h6><strong>"
    + escapeExpression(((helper = (helper = helpers.status || (depth0 != null ? depth0.status : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"status","hash":{},"data":data}) : helper)))
    + "</strong>\n      <h6>Tags</h6>\n      <ul>\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.tags : depth0), {"name":"each","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "      </ul>\n    </div>\n\n    <div class=\"well-content span8\">\n\n      <div class=\"span4\">\n        <h5>Managed by</h5>\n        <a href=\"/users/"
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.leader : depth0)) != null ? stack1._id : stack1), depth0))
    + "\">\n          "
    + escapeExpression(((helpers.getProfileImage || (depth0 && depth0.getProfileImage) || helperMissing).call(depth0, (depth0 != null ? depth0.leader : depth0), {"name":"getProfileImage","hash":{},"data":data})))
    + "\n        </a>\n      </div>\n\n      <div class=\"span4\">\n        <h5>Contributors</h5>\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.contributors : depth0), {"name":"each","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "      </div>\n\n      <div class=\"span4\">\n        <h5>"
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.followers : depth0)) != null ? stack1.length : stack1), depth0))
    + " Likes</h5>\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.followers : depth0), {"name":"each","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "      </div>\n\n    </div>\n\n    <div id=\"disqus_thread\" class=\"well-header\"></div>\n    <script src=\"/js/disqus.js\" disqus_shortname=\""
    + escapeExpression(((helper = (helper = helpers.disqus_shortname || (depth0 != null ? depth0.disqus_shortname : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"disqus_shortname","hash":{},"data":data}) : helper)))
    + "\"></script>\n    \n  </div>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":79}],68:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div id=\"dashboard-projects\"></div>\n<div id=\"inactive-projects\" class=\"hide inactive-ctn\"></div>";
  },"useData":true});

},{"hbsfy/runtime":79}],69:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<a href=\""
    + escapeExpression(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"url","hash":{},"data":data}) : helper)))
    + "\" data-bypass>\n  <div class=\"well\">\n    "
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "\n  </div>\n</a>";
},"useData":true});

},{"hbsfy/runtime":79}],70:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"project-image\" style=\"background-image: url('"
    + escapeExpression(((helper = (helper = helpers.cover || (depth0 != null ? depth0.cover : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"cover","hash":{},"data":data}) : helper)))
    + "');\"></div>\n";
},"3":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "      <h4><a href=\""
    + escapeExpression(((helper = (helper = helpers.instanceURL || (depth0 != null ? depth0.instanceURL : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"instanceURL","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "</a></h4>\n";
},"5":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "      <a href=\"/users/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\">\n        "
    + escapeExpression(((helpers.getProfileImage || (depth0 && depth0.getProfileImage) || helperMissing).call(depth0, depth0, {"name":"getProfileImage","hash":{},"data":data})))
    + "\n      </a>\n";
},"7":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"pull-right demo\">\n      <a href=\""
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\" class=\"btn btn-link\" data-bypass>Demo</a>\n    </div>\n";
},"9":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "\n";
  stack1 = ((helper = (helper = helpers.isDashboardView || (depth0 != null ? depth0.isDashboardView : depth0)) != null ? helper : helperMissing),(options={"name":"isDashboardView","hash":{},"fn":this.program(10, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.showActions : depth0), {"name":"if","hash":{},"fn":this.program(13, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"10":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdminOrLeader : depth0), {"name":"if","hash":{},"fn":this.program(11, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"11":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "        <div class=\"pull-right remove\">\n          <a class=\"btn btn-link remove\">Remove</a>\n        </div>\n        <div class=\"pull-right edit\">\n          <a class=\"btn btn-link edit\" href=\"/projects/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "/edit\">Edit</a>\n        </div>\n";
},"13":function(depth0,helpers,partials,data) {
  var stack1, buffer = "      <div class=\"pull-right contributor\">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.contributing : depth0), {"name":"if","hash":{},"fn":this.program(14, data),"inverse":this.program(16, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "      </div>\n      <div class=\"pull-right follower\">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.following : depth0), {"name":"if","hash":{},"fn":this.program(18, data),"inverse":this.program(20, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "      </div>\n";
},"14":function(depth0,helpers,partials,data) {
  return "        <a class=\"btn btn-link leave\">Leave</a>\n";
  },"16":function(depth0,helpers,partials,data) {
  return "        <a class=\"btn btn-link join\">Join</a>\n";
  },"18":function(depth0,helpers,partials,data) {
  return "        <a class=\"btn btn-link unfollow\">Unfollow</a>\n";
  },"20":function(depth0,helpers,partials,data) {
  return "        <a class=\"btn btn-link follow\">Follow</a>\n";
  },"22":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "";
  stack1 = ((helper = (helper = helpers.isDashboardView || (depth0 != null ? depth0.isDashboardView : depth0)) != null ? helper : helperMissing),(options={"name":"isDashboardView","hash":{},"fn":this.program(23, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"23":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isShowcaseMode : depth0), {"name":"if","hash":{},"fn":this.program(24, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"24":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n        <div class=\"switcher tooltips\" data-placement=\"top\" data-original-title=\"Toggle visibility\">\n          <input type=\"checkbox\" ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.active : depth0), {"name":"if","hash":{},"fn":this.program(25, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + " class=\"switch-small\">\n        </div>\n\n";
},"25":function(depth0,helpers,partials,data) {
  return "checked";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, escapeExpression=this.escapeExpression, lambda=this.lambda, buffer = "<div class=\"well\">\n  <div class=\"cover shadow\"> \n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.cover : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "  </div>\n  <div class=\"well-content\">\n";
  stack1 = ((helper = (helper = helpers.isSearchView || (depth0 != null ? depth0.isSearchView : depth0)) != null ? helper : helperMissing),(options={"name":"isSearchView","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isSearchView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "    <h4>"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h4>\n    <br/>\n    ";
  stack1 = ((helpers.markdown || (depth0 && depth0.markdown) || helperMissing).call(depth0, (depth0 != null ? depth0.description : depth0), {"name":"markdown","hash":{},"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n    <div id=\"contributors\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.contributors : depth0), {"name":"each","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "    </div>\n  </div>\n  <div class=\"row-fluid footer-box\">\n    <div class=\"aging activity created_at\">\n      <i rel=\"tooltip\" title=\""
    + escapeExpression(((helpers.timeAgo || (depth0 && depth0.timeAgo) || helperMissing).call(depth0, (depth0 != null ? depth0.created_at : depth0), {"name":"timeAgo","hash":{},"data":data})))
    + "\" class=\"tooltips icon-time icon-1\"></i>\n    </div>\n    <div class=\"activity people\">\n      "
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.followers : depth0)) != null ? stack1.length : stack1), depth0))
    + " \n      <a><i class=\"icon-heart\"></i></a>\n    </div>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.link : depth0), {"name":"if","hash":{},"fn":this.program(7, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(9, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "    \n  </div>\n\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(22, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true});

},{"hbsfy/runtime":79}],71:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;
  return "    <a href=\"/auth/"
    + escapeExpression(lambda(depth0, depth0))
    + "\" class=\"btn btn-large signup-btn signup-"
    + escapeExpression(lambda(depth0, depth0))
    + "\" data-bypass>\n      <i></i>Access with "
    + escapeExpression(((helpers.firstUpper || (depth0 && depth0.firstUpper) || helperMissing).call(depth0, depth0, {"name":"firstUpper","hash":{},"data":data})))
    + "\n    </a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n<div class=\"modal-header\">\n  <button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close\">×</button>\n  <h3>Log in</h3>\n</div>\n<div class=\"row\">\n  <div class=\"span4 offset1\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.providers : depth0), {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":79}],72:[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

Handlebars['default'] = Handlebars;

exports["default"] = Handlebars;
},{"./handlebars/base":73,"./handlebars/exception":74,"./handlebars/runtime":75,"./handlebars/safe-string":76,"./handlebars/utils":77}],73:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "2.0.0";
exports.VERSION = VERSION;var COMPILER_REVISION = 6;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn) {
    if (toString.call(name) === objectType) {
      if (fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function(name) {
    delete this.helpers[name];
  },

  registerPartial: function(name, partial) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function(name) {
    delete this.partials[name];
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(/* [args, ]options */) {
    if(arguments.length === 1) {
      // A missing field in a {{foo}} constuct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new Exception("Missing helper: '" + arguments[arguments.length-1].name + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
        options = {data: data};
      }

      return fn(context, options);
    }
  });

  instance.registerHelper('each', function(context, options) {
    if (!options) {
      throw new Exception('Must pass iterator to #each');
    }

    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    var contextPath;
    if (options.data && options.ids) {
      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));

            if (contextPath) {
              data.contextPath = contextPath + i;
            }
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) {
              data.key = key;
              data.index = i;
              data.first = (i === 0);

              if (contextPath) {
                data.contextPath = contextPath + key;
              }
            }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    var fn = options.fn;

    if (!Utils.isEmpty(context)) {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
        options = {data:data};
      }

      return fn(context, options);
    } else {
      return options.inverse(this);
    }
  });

  instance.registerHelper('log', function(message, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, message);
  });

  instance.registerHelper('lookup', function(obj, field) {
    return obj && obj[field];
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, message) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, message);
      }
    }
  }
};
exports.logger = logger;
var log = logger.log;
exports.log = log;
var createFrame = function(object) {
  var frame = Utils.extend({}, object);
  frame._parent = object;
  return frame;
};
exports.createFrame = createFrame;
},{"./exception":74,"./utils":77}],74:[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var line;
  if (node && node.firstLine) {
    line = node.firstLine;

    message += ' - ' + line + ':' + node.firstColumn;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (line) {
    this.lineNumber = line;
    this.column = node.firstColumn;
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],75:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;
var createFrame = require("./base").createFrame;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new Exception("No environment passed to template");
  }
  if (!templateSpec || !templateSpec.main) {
    throw new Exception('Unknown template object: ' + typeof templateSpec);
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  var invokePartialWrapper = function(partial, indent, name, context, hash, helpers, partials, data, depths) {
    if (hash) {
      context = Utils.extend({}, context, hash);
    }

    var result = env.VM.invokePartial.call(this, partial, name, context, helpers, partials, data, depths);

    if (result == null && env.compile) {
      var options = { helpers: helpers, partials: partials, data: data, depths: depths };
      partials[name] = env.compile(partial, { data: data !== undefined, compat: templateSpec.compat }, env);
      result = partials[name](context, options);
    }
    if (result != null) {
      if (indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    }
  };

  // Just add water
  var container = {
    lookup: function(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function(i) {
      return templateSpec[i];
    },

    programs: [],
    program: function(i, data, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths) {
        programWrapper = program(this, i, fn, data, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(this, i, fn);
      }
      return programWrapper;
    },

    data: function(data, depth) {
      while (data && depth--) {
        data = data._parent;
      }
      return data;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = Utils.extend({}, common, param);
      }

      return ret;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  var ret = function(context, options) {
    options = options || {};
    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths;
    if (templateSpec.useDepths) {
      depths = options.depths ? [context].concat(options.depths) : [context];
    }

    return templateSpec.main.call(container, context, container.helpers, container.partials, data, depths);
  };
  ret.isTop = true;

  ret._setup = function(options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
    }
  };

  ret._child = function(i, data, depths) {
    if (templateSpec.useDepths && !depths) {
      throw new Exception('must pass parent depths');
    }

    return program(container, i, templateSpec[i], data, depths);
  };
  return ret;
}

exports.template = template;function program(container, i, fn, data, depths) {
  var prog = function(context, options) {
    options = options || {};

    return fn.call(container, context, container.helpers, container.partials, options.data || data, depths && [context].concat(depths));
  };
  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data, depths) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data, depths: depths };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? createFrame(data) : {};
    data.root = context;
  }
  return data;
}
},{"./base":73,"./exception":74,"./utils":77}],76:[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],77:[function(require,module,exports){
"use strict";
/*jshint -W004 */
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
/* istanbul ignore next */
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (string == null) {
    return "";
  } else if (!string) {
    return string + '';
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}

exports.appendContextPath = appendContextPath;
},{"./safe-string":76}],78:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":72}],79:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":78}]},{},[6]);
