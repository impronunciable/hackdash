/*! 
* Hackdash - v0.8.2
* Copyright (c) 2015 Hackdash 
*  
*/ 


(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Embed Application
 *
 */

var EmbedRouter = require('./EmbedRouter');

module.exports = function(){

  var app = module.exports = new Backbone.Marionette.Application();

  app.source = "embed";

  function initRegions(){
    app.addRegions({
      header: "header",
      main: "#main",
      footer: "footer"
    });
  }

  function initRouter(){
    app.router = new EmbedRouter();
    Backbone.history.start({ pushState: true });
  }

  app.addInitializer(initRegions);
  app.addInitializer(initRouter);

  window.hackdash.app = app;
  window.hackdash.app.start();
};
},{"./EmbedRouter":2}],2:[function(require,module,exports){
/*
 * Hackdash Router
 */

var Dashboard = require("./models/Dashboard")
  , Project = require("./models/Project")
  , Projects = require("./models/Projects")

  , Header = require("./views/Header")
  , Footer = require("./views/Footer")

  , ProjectView = require("./views/Project/Embed")
  , DashboardView = require("./views/Dashboard/Embed")
  ;

module.exports = Backbone.Marionette.AppRouter.extend({

  routes : {

      "embed/dashboards/:dash": "showDashboard"
    , "embed/projects/:pid" : "showProject"

  },

  showDashboard: function(dash) {

    var app = window.hackdash.app;
    app.type = "dashboard";

    app.dashboard = new Dashboard();
    app.projects = new Projects();

    if (dash){
      app.dashboard.set('domain', dash);
      app.projects.domain = dash;
    }

    app.dashboard.fetch().done(function(){
      app.projects.fetch({}, { parse: true })
        .done(function(){
          app.projects.buildShowcase(app.dashboard.get("showcase"));

          app.header.show(new Header({
            model: app.dashboard,
            collection: app.projects
          }));

          app.main.show(new DashboardView({
            model: app.dashboard
          }));

          app.footer.show(new Footer({
            model: app.dashboard
          }));

        });
    });

  },

  showProject: function(pid){

    var app = window.hackdash.app;
    app.type = "project";

    app.project = new Project({ _id: pid });

    app.project.fetch().done(function(){
      app.main.show(new ProjectView({
        model: app.project
      }));
    });
  },

});

},{"./models/Dashboard":8,"./models/Project":9,"./models/Projects":10,"./views/Dashboard/Embed":15,"./views/Footer":25,"./views/Header":29,"./views/Project/Embed":36}],3:[function(require,module,exports){

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

  window.smoothScroll.init({
    speed: 100,
    easing: 'Linear'
  });

  Dropzone.autoDiscover = false;

  window.hackdash.apiURL = "/api/v2";
};

},{"./helpers/backboneOverrides":4,"./helpers/handlebars":5}],4:[function(require,module,exports){
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

Handlebars.registerHelper('firstLetter', function(text) {
  if (text){
    return text.charAt(0);
  }
  return "";
});

Handlebars.registerHelper('markdown', function(md) {
  if (md){
    return markdown.toHTML(md);
  }
  return "";
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

Handlebars.registerHelper('isLandingView', function(options) {
  if (window.hackdash.app.type === "landing"){
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

function getProfileImageHex(user) {

  if (!user){
    return '';
  }

  var img = new window.Image();

  $(img)
    .load(function () { })
    .error(function () {
      $('.' + this.id)
        .css('background-image', 'url(http://avatars.io/' + user.provider + '/' + user.username + ')');
    })
    .prop({
      src: user.picture,
      id: 'pic-' + user._id
    });

  var div = $('<div>')
    .prop({
      'data-id': user._id,
      title: user.name,
      class: 'avatar tooltips pic-' + user._id,
      rel: 'tooltip'
    })
    .css('background-image', 'url(' + user.picture + ')')
    .addClass('hexagon');

  div.append('<div class="hex-top"></div><div class="hex-bottom"></div>');

  return new Handlebars.SafeString(div[0].outerHTML);
}

Handlebars.registerHelper('getProfileImageHex', getProfileImageHex);

Handlebars.registerHelper('getMyProfileImageHex', function() {
  return getProfileImageHex(window.hackdash.user);
});

Handlebars.registerHelper('each_upto', function(ary, max, options) {
    if(!ary || ary.length === 0) {
      return options.inverse(this);
    }

    var result = [];
    for(var i = 0; i < max && i < ary.length; ++i) {
      result.push(options.fn(ary[i]));
    }

    return result.join('');
});

Handlebars.registerHelper('each_upto_rnd', function(ary, max, options) {
    if(!ary || ary.length === 0) {
      return options.inverse(this);
    }

    var picks = [];
    function pick(max){
      var rnd = Math.floor(Math.random() * max);
      if (picks.indexOf(rnd) === -1) {
        picks.push(rnd);
        return rnd;
      }
      return pick(max);
    }

    var result = [];
    for(var i = 0; i < max && i < ary.length; ++i) {
      result.push( options.fn(ary[pick(ary.length)]) );
    }

    return result.join('');
});


},{"hbsfy/runtime":46}],6:[function(require,module,exports){
jQuery(function() {
  require('./Initializer')();
  window.hackdash.startApp = require('./EmbedApp');
});
},{"./EmbedApp":1,"./Initializer":3}],7:[function(require,module,exports){
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
    return hackdash.apiURL + '/' + this.domain + '/admins';
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


},{"./User":11,"./Users":12}],8:[function(require,module,exports){
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
      throw new Error('Unkonw Dashboard domain name');
    }
  },

  idAttribute: "domain",

  initialize: function(){
    this.set("admins", new Admins());
    this.on('change:domain', this.setAdminDomains.bind(this));
    this.setAdminDomains();
  },

  setAdminDomains: function(){
    var admins = this.get("admins");
    admins.domain = this.get('domain');
    this.set("admins", admins);
  }

});


},{"./Admins":7}],9:[function(require,module,exports){
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
    if (!hackdash.user){
      return;
    }

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

  toggleContribute: function(){
    if (this.isContributor()){
      return this.leave();
    }

    this.join();
  },

  toggleFollow: function(){
    if (this.isFollower()){
      return this.unfollow();
    }

    this.follow();
  },

  isContributor: function(){
    return this.userExist(this.get("contributors"));
  },

  isFollower: function(){
    return this.userExist(this.get("followers"));
  },

  userExist: function(arr){

    if (!hackdash.user){
      return false;
    }

    var uid = hackdash.user._id;
    return arr && _.find(arr, function(usr){
      return (usr._id === uid);
    }) ? true : false;
  },

});


},{}],10:[function(require,module,exports){
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

    this.allItems = response;

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
  },

  search: function(keywords){

    if (keywords.length === 0){
      this.reset(this.allItems);
      return;
    }

    var regex = new RegExp(keywords, 'i');
    var items = [];

    _.each(this.allItems, function(project){
      if (
        regex.test(project.title) ||
        regex.test(project.description) ||
        regex.test(project.tags.join(' '))
        ) {

          return items.push(project);
      }
    });

    this.reset(items);
  }

});


},{"./Project":9}],11:[function(require,module,exports){
/**
 * MODEL: User
 *
 */

module.exports = Backbone.Model.extend({

  idAttribute: "_id",

});

},{}],12:[function(require,module,exports){
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


},{"./User":11}],13:[function(require,module,exports){
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

  className: "add-admins-modal",
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
      this.destroy();
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
},{"../../models/Users":12,"./templates/addAdmin.hbs":19}],14:[function(require,module,exports){
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

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  placeholders: {
    title: "Hackathon Title",
    description: "brief description of this hackathon",
    link: "url to hackathon site"
  },

  initEditables: function(){
    this.initEditable("title", '<input type="text" maxlength="30">');
    this.initEditable("description", '<textarea maxlength="250"></textarea>', 'textarea');
    this.initEditable("link");
  },

  initEditable: function(type, template, control){
    var ph = this.placeholders;
    var self = this;

    if (this.ui[type].length > 0){

      this.ui[type].editable({
        type: control || 'text',
        title: ph[type],
        emptytext: ph[type],
        placeholder: ph[type],
        tpl: template,
        success: function(response, newValue) {
          self.model.set(type, newValue);
          self.model.save();
        }
      });
    }
  },

});
},{"./templates/dashboard.hbs":20}],15:[function(require,module,exports){
/**
 * VIEW: Dashboard
 *
 */

var Dashboard = require('./index');

module.exports = Dashboard.extend({

 // TODO: Dashboard Overrides for Embed

});
},{"./index":18}],16:[function(require,module,exports){
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
},{"./templates/user.hbs":22}],17:[function(require,module,exports){
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

  childViewContainer: "ul",
  childView: User,

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

  onRender: function(){
    $('.tooltips', this.$el).tooltip({});
  },

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
},{"./AddAdmin":13,"./User":16,"./templates/users.hbs":23}],18:[function(require,module,exports){
/**
 * VIEW: Dashboard Projects Layout
 *
 */

var template = require('./templates/index.hbs')
  , UsersView = require('./Users')
  , DashboardView = require('./Dashboard')
  , ProjectsView = require('../Project/Collection');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "page-ctn dashboard",
  template: template,

  ui: {
    inactiveCtn: ".inactive-ctn"
  },

  regions: {
    "dashboard": ".dash-details",
    "admins": ".dash-admins",
    "projects": "#dashboard-projects",
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
    var self = this;

    this.dashboard.show(new DashboardView({
      model: this.model
    }));

    this.model.get("admins").fetch().done(function(){
      self.admins.show(new UsersView({
        model: self.model,
        collection: self.model.get("admins")
      }));
    });

    if (this.showcaseMode){
      this.projects.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects.getActives(),
        showcaseMode: true
      }));

      this.ui.inactiveCtn.removeClass("hide");

      this.inactives.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects.getInactives()
      }));

      hackdash.app.projects.off("change:active").on("change:active", function(){
        self.projects.currentView.collection = hackdash.app.projects.getActives();
        self.inactives.currentView.collection = hackdash.app.projects.getInactives();

        self.model.isDirty = true;

        self.projects.currentView.render();
        self.inactives.currentView.render();
      });
    }
    else {
      this.ui.inactiveCtn.addClass("hide");

      this.projects.show(new ProjectsView({
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
    var showcase = this.projects.currentView.updateShowcaseOrder();
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
},{"../Project/Collection":35,"./Dashboard":14,"./Users":17,"./templates/index.hbs":21}],19:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"modal-header\">\n  <button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close\">×</button>\n  <h3>Add Dashboard Admin</h3>\n</div>\n<div class=\"modal-body\">\n  <div class=\"input-prepend\">\n    <span class=\"add-on\" style=\"padding: 10px;\">\n      <i class=\"icon-user\"></i>\n    </span>\n    <input id=\"txtUser\" type=\"text\" class=\"input-xlarge\" placeholder=\"type name or username\" autocomplete=\"off\" style=\"padding: 10px;\">\n  </div>\n</div>\n<div class=\"modal-footer\">\n  <input id=\"save\" type=\"button\" class=\"btn primary btn-success pull-right\" style=\"margin-left: 10px;\" value=\"Save\">\n  <input type=\"button\" class=\"btn primary pull-right\" data-dismiss=\"modal\" value=\"Cancel\">\n</div>";
  },"useData":true});

},{"hbsfy/runtime":46}],20:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "\n  <h1>\n    <a id=\"dashboard-title\">"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</a>\n  </h1>\n\n  <p>\n    <a id=\"dashboard-description\">"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</a>\n  </p>\n\n  <p>\n    <a id=\"dashboard-link\">"
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
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
  return "  <h1>"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h1>\n";
},"6":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <p>"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdmin : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true});

},{"hbsfy/runtime":46}],21:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "        <a class=\"link\" href=\""
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\" data-bypass>\n          <i class=\"fa fa-link\"></i>\n        </a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n<div class=\"header\">\n  <div class=\"container\">\n    <div class=\"dash-details\"></div>\n    <div class=\"dash-admins\"></div>\n\n    <div class=\"dash-buttons\">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.link : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "      <a class=\"share\">\n        <i class=\"fa fa-share-alt\"></i>\n      </a>\n    </div>\n\n  </div>\n</div>\n\n<div class=\"body\">\n\n  <div class=\"container\">\n\n    <div id=\"dashboard-projects\"></div>\n    <div id=\"inactive-projects\" class=\"hide inactive-ctn\"></div>\n\n  </div>\n\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":46}],22:[function(require,module,exports){
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

},{"hbsfy/runtime":46}],23:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  return "<a class=\"tooltips add-admins\" title=\"Add admins\">\n  <i class=\"fa fa-plus\"></i>\n</a>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<ul></ul>\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdmin : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":46}],24:[function(require,module,exports){
/**
 * VIEW: A Embed code
 * 
 */
 
var template = require('./templates/embed.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "",
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
},{"./templates/embed.hbs":26}],25:[function(require,module,exports){

var
    template = require('./templates/footer.hbs')
  , Embed = require('./Embed')
  , Dashboard = require('../../models/Dashboard');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "footer",
  template: template,

  ui: {
    "switcher": ".dashboard-btn",
    "showcaseMode": ".btn-showcase-mode",
    "createShowcase": ".btn-new-project",
    "footerToggle": ".footer-toggle-ctn",
    "up": ".up-button"
  },

  events: {
    "click .dashboard-btn": "onClickSwitcher",
    "click .embed-btn": "showEmbedModal",
    "click .btn-showcase-mode": "changeShowcaseMode",
    "click @ui.up": "goTop"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return user && user.admin_in.indexOf(this.domain) >= 0 || false;
    },
    isDashboard: function(){
      return (hackdash.app.type === "dashboard");
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    $('.tooltips', this.$el).tooltip({});
    this.setStatics();
/*
    if (hackdash.app.type !== "dashboard"){
      this.$el.addClass('unlocked');
    }
*/
  },

  serializeData: function(){

    if (this.model && this.model instanceof Dashboard){

      var msg = "This Dashboard is open: click to close";

      if (!this.model.get("open")) {
        msg = "This Dashboard is closed: click to reopen";
      }

      return _.extend({
        switcherMsg: msg
      }, this.model.toJSON());
    }

    return (this.model && this.model.toJSON()) || {};
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

  upBlocked: false,
  goTop: function(){

    if (!this.upBlocked){
      this.upBlocked = true;

      var body = $("html, body"), self = this;
      body.animate({ scrollTop:0 }, 1500, 'swing', function() {
        self.upBlocked = false;
      });
    }
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
        .html("<i class='btn-danger txt'>off</i><div>Edit Showcase</div>")
        .removeClass("on");

      this.ui.createShowcase.removeClass("hide");
      this.ui.footerToggle.removeClass("hide");
    }
    else {
      this.model.isShowcaseMode = true;
      this.model.trigger("edit:showcase");

      this.ui.showcaseMode
        .text("Save Showcase")
        .addClass("btn btn-success on");

      this.ui.createShowcase.addClass("hide");
      this.ui.footerToggle.addClass("hide");
    }
  },

  setStatics: function(){
    var statics = ['project', 'profile'];

    if (statics.indexOf(hackdash.app.type) > -1){
      this.$el.addClass('static');
      return;
    }

    function isAdmin(domain){
      var user = hackdash.user;
      return user && user.admin_in.indexOf(domain) >= 0 || false;
    }

    if (hackdash.app.type === 'dashboard' && !isAdmin(this.model.get('domain')) ){
      this.$el.addClass('static');
    }
  }

});
},{"../../models/Dashboard":8,"./Embed":24,"./templates/footer.hbs":27}],26:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"modal-header\">\n  <button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close\">×</button>\n  <h3>Embed code</h3>\n</div>\n<div class=\"modal-body\">\n  <textarea rows=\"2\" style=\"width:90%;\">"
    + escapeExpression(((helper = (helper = helpers.embedCode || (depth0 != null ? depth0.embedCode : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"embedCode","hash":{},"data":data}) : helper)))
    + "</textarea>\n</div>\n<div class=\"modal-footer\">\n  <input type=\"button\" class=\"btn primary pull-right\" data-dismiss=\"modal\" value=\"Cancel\">\n</div>";
},"useData":true});

},{"hbsfy/runtime":46}],27:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdmin : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"2":function(depth0,helpers,partials,data) {
  return "dashboard-footer";
  },"4":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAdmin : depth0), {"name":"if","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"5":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "  <div class=\"footer-dash-ctn\">\n\n\n    <div class=\"footer-toggle-ctn\">\n\n      <a href=\"/api/v2/dashboards/"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "/csv\" target=\"_blank\" data-bypass>\n        <i class=\"fa fa-download\"></i>\n        <div>Export .CSV File</div>\n      </a>\n\n      <a class=\"embed-btn\">\n        <i class=\"fa fa-share-alt\"></i>\n        <div>Embed</div>\n      </a>\n\n      <a data-placement=\"top\" data-original-title=\""
    + escapeExpression(((helper = (helper = helpers.switcherMsg || (depth0 != null ? depth0.switcherMsg : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"switcherMsg","hash":{},"data":data}) : helper)))
    + "\"\n        class=\"tooltips dashboard-btn ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.open : depth0), {"name":"if","hash":{},"fn":this.program(6, data),"inverse":this.program(8, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n        <i class=\"txt ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.open : depth0), {"name":"if","hash":{},"fn":this.program(10, data),"inverse":this.program(12, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.open : depth0), {"name":"if","hash":{},"fn":this.program(14, data),"inverse":this.program(16, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</i>\n        <div>Dashboard Status</div>\n      </a>\n\n    </div>\n\n    <a class=\"btn-showcase-mode\">\n      <i class=\"btn-danger txt\">off</i><div>Edit Showcase</div>\n    </a>\n\n  </div>\n";
},"6":function(depth0,helpers,partials,data) {
  return "dash-open";
  },"8":function(depth0,helpers,partials,data) {
  return "dash-close";
  },"10":function(depth0,helpers,partials,data) {
  return "btn-success";
  },"12":function(depth0,helpers,partials,data) {
  return "btn-danger";
  },"14":function(depth0,helpers,partials,data) {
  return "Open";
  },"16":function(depth0,helpers,partials,data) {
  return "Close";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n<a class=\"brand ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isDashboard : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n  <div class=\"logo\"></div>\n  <h3>hackdash.org</h3>\n</a>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isDashboard : depth0), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n<a class=\"up-button\">\n  <i class=\"fa fa-long-arrow-up\"></i>\n  <span>up</span>\n</a>";
},"useData":true});

},{"hbsfy/runtime":46}],28:[function(require,module,exports){

var
  template = require('./templates/search.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "search",
  template: template,

  ui: {
    searchbox: "#search"
  },

  events: {
    "keyup @ui.searchbox": "search",
    "click .btn-group>.btn": "sortClicked",
    "click .login": "showLogin"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  lastSearch: "",

  initialize: function(options){
    this.showSort = (options && options.showSort) || false;
    this.collection = options && options.collection;
    this.placeholder = (options && options.placeholder) || "Enter your keywords";
  },

  onRender: function(){
    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      this.ui.searchbox.val(query);
      this.search();
    }
  },

  serializeData: function(){
    return _.extend({
      showSort: this.showSort,
      placeholder: this.placeholder
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  showLogin: function(){
    hackdash.app.showLogin();
  },

  sortClicked: function(e){
    e.preventDefault();
    var val = $('input[type=radio]', e.currentTarget)[0].id;
    this.collection.trigger("sort:" + val);
  },

  search: function(){
    var self = this;
    window.clearTimeout(this.timer);

    this.timer = window.setTimeout(function(){
      var keyword = self.ui.searchbox.val();
      var currentSearch = decodeURI(Backbone.history.location.search);
      var fragment = Backbone.history.fragment.replace(currentSearch, "");

      if (keyword !== self.lastSearch) {
        self.lastSearch = keyword;

        var url = fragment + "?q=" + keyword;
        if (keyword.length === 0) {
          url = fragment;
        }

        hackdash.app.router.navigate(url);
        self.collection.search(keyword);

        var top = $('#dashboard-projects').offset().top;
        var offset = self.$el.parent().height();
        var pos = (top - offset >= 0 ? top - offset : 0);
        $(window).scrollTop(pos);
      }

    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./templates/search.hbs":31}],29:[function(require,module,exports){
var
    template = require('./templates/header.hbs')
  , Search = require('./Search');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container-fluid",
  template: template,

  regions: {
    "search": ".search-ctn"
  },

  events: {
    "click .login": "showLogin"
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

    switch(hackdash.app.type){

      case "dashboard":
        this.search.show(new Search({
          showSort: true,
          placeholder: "Enter your keywords",
          model: this.model,
          collection: this.collection
        }));
        break;
    }

    $('.tooltips', this.$el).tooltip({});
    this.$el.addClass(hackdash.app.type);
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  showLogin: function(){
    hackdash.app.showLogin();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
},{"./Search":28,"./templates/header.hbs":30}],30:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"pull-right col-xs-3 col-md-3\">\n      <a class=\"btn-profile\" href=\"/users/profile\">\n        "
    + escapeExpression(((helper = (helper = helpers.getMyProfileImageHex || (depth0 != null ? depth0.getMyProfileImageHex : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"getMyProfileImageHex","hash":{},"data":data}) : helper)))
    + "\n      </a>\n      <a class=\"logout\" href=\"/logout\" data-bypass>Log out</a>\n    </div>\n";
},"3":function(depth0,helpers,partials,data) {
  return "    <a class=\"login\">Log in</a>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, escapeExpression=this.escapeExpression, buffer = "\n<div class=\"row main-header\">\n\n  <div class=\"hidden-xs col-sm-10 col-md-10 col-lg-10 col-sm-offset-1 col-md-offset-1 search-ctn\"></div>\n\n  <div class=\"col-xs-2 col-sm-1 col-md-1 col-lg-1 my-profile\">\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\n\n  <a class=\"logo\" href=\""
    + escapeExpression(((helper = (helper = helpers.hackdashURL || (depth0 != null ? depth0.hackdashURL : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"hackdashURL","hash":{},"data":data}) : helper)))
    + "\" data-bypass></a>\n\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":46}],31:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<div class=\"btn-group col-xs-6 col-sm-7 col-sm-offset-1 col-md-5 col-md-offset-0 col-lg-4\" data-toggle=\"buttons\">\n  <label class=\"btn btn-default col-xs-4 col-md-4\">\n    <input type=\"radio\" name=\"options\" id=\"name\" autocomplete=\"off\"> By Name\n  </label>\n  <label class=\"btn btn-default col-xs-4 col-md-4 active\">\n    <input type=\"radio\" name=\"options\" id=\"date\" autocomplete=\"off\"> By Date\n  </label>\n  <label class=\"btn btn-default col-xs-4 col-md-4\">\n    <input type=\"radio\" name=\"options\" id=\"showcase\" autocomplete=\"off\"> Showcase\n  </label>\n</div>\n\n<div class=\"col-sm-4 col-md-3 col-lg-4\">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.open : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"2":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "  <h3 class=\"create-project\">\n    <i class=\"fa fa-plus\"></i>\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(3, data),"inverse":this.program(5, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </h3>\n";
},"3":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <a href=\"/dashboards/"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "/create\">Create Project</a>\n";
},"5":function(depth0,helpers,partials,data) {
  return "    <a class=\"login\">Create Project</a>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "<div class=\"hidden-sm col-md-4 col-lg-4\">\n\n  <div class=\"input-group\">\n    <input id=\"search\" type=\"text\" class=\"form-control\" placeholder=\""
    + escapeExpression(((helper = (helper = helpers.placeholder || (depth0 != null ? depth0.placeholder : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"placeholder","hash":{},"data":data}) : helper)))
    + "\">\n    <span class=\"input-group-btn\">\n      <button class=\"btn btn-primary\" type=\"button\">\n        <i class=\"fa fa-search\"></i>\n      </button>\n    </span>\n  </div>\n\n</div>\n\n";
  stack1 = ((helper = (helper = helpers.isDashboardView || (depth0 != null ? depth0.isDashboardView : depth0)) != null ? helper : helperMissing),(options={"name":"isDashboardView","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":46}],32:[function(require,module,exports){
/**
 * VIEW: An Item of HOME Search
 *
 */

var template = require('./templates/item.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){ return this.model.get("_id"); },
  tagName: 'a',
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  // Overrided method by an Entity
  getURL: function(){ return false; },
  afterRender: function(){ },

  onRender: function(){

    var url = this.getURL();

    if (url !== false){
      this.$el.attr({ 'href': url });
    }

    if (hackdash.app.type === 'landing'){
      this.$el.attr({ 'data-bypass': true });
      $('.tooltips', this.$el).tooltip({ container: '.tab-content' });
    }
    else {
      $('.tooltips', this.$el).tooltip({ container: '.container' });
    }

    this.afterRender();
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
},{"./templates/item.hbs":33}],33:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div>"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "</div>";
},"useData":true});

},{"hbsfy/runtime":46}],34:[function(require,module,exports){
/**
 * VIEW: An Project of HOME Search
 *
 */

var template = require('./templates/card.hbs');
var ItemView = require('../Home/Item.js');

module.exports = ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: 'entity project',
  template: template,

  ui: {
    "switcher": ".switcher input",
    "contribute": ".contribute",
    "follow": ".follow"
  },

  events: {
    "click @ui.contribute": "onContribute",
    "click @ui.follow": "onFollow",
    "click .contributors a": "stopPropagation",
    "click .demo-link": "stopPropagation"
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  getURL: function(){

    if (this.isShowcaseMode()){
      return false;
    }

    return "/projects/" + this.model.get("_id");
  },

  afterRender: function(){
    this.$el.attr({
        "data-id": this.model.get("_id")
      , "data-name": this.model.get("title")
      , "data-date": this.model.get("created_at")
      , "data-showcase": this.model.get("showcase")
    });

    if (this.model.get("active")){
      this.$el.addClass('filter-active');
    }
    else {
      this.$el.removeClass('filter-active');
    }

    this.initSwitcher();
  },

  serializeData: function(){
    var me = (hackdash.user && hackdash.user._id) || '';

    return _.extend({
      isShowcaseMode: this.isShowcaseMode(),
      contributing: this.model.isContributor(),
      following: this.model.isFollower(),
      isOwner: (this.model.get('leader')._id === me ? true : false)
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
    e.preventDefault();
    e.stopPropagation();

    if (!window.hackdash.user){
      hackdash.app.showLogin();
      return;
    }

    this.ui.contribute.button('loading');
    this.model.toggleContribute();
  },

  onFollow: function(e){
    e.preventDefault();
    e.stopPropagation();

    if (!window.hackdash.user){
      hackdash.app.showLogin();
      return;
    }

    this.ui.follow.button('loading');
    this.model.toggleFollow();
  },

  initSwitcher: function(){
    var self = this;

    if (this.ui.switcher.length > 0){
      this.ui.switcher
        .bootstrapSwitch({
          size: 'mini',
          onColor: 'success',
          offColor: 'danger',
          onSwitchChange: function(event, state){
            self.model.set("active", state);
          }
        });
    }
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  isShowcaseMode: function(){
    return hackdash.app.dashboard && hackdash.app.dashboard.isShowcaseMode;
  }

});
},{"../Home/Item.js":32,"./templates/card.hbs":37}],35:[function(require,module,exports){
/**
 * VIEW: Projects of an Instance
 *
 */

var Project = require('./Card');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "entities",
  childView: Project,

  collectionEvents: {
    "remove": "render",
    "sort:date": "sortByDate",
    "sort:name": "sortByName",
    "sort:showcase": "sortByShowcase"
  },

  gutter: 5,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.showcaseMode = (options && options.showcaseMode) || false;
    this.showcaseSort = (options && options.showcaseSort) || false;
  },

  onRender: function(){
    _.defer(this.onEndRender.bind(this));
  },

  onEndRender: function(){
    this.updateGrid();
    this.refresh();
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  updateShowcaseOrder: function(){
    var showcase = [];

    $('.entity', this.$el).sort(function (a, b) {

      var av = ( isNaN(+a.dataset.showcase) ? +a.dataset.delay : +a.dataset.showcase +1);
      var bv = ( isNaN(+b.dataset.showcase) ? +b.dataset.delay : +b.dataset.showcase +1);

      return av - bv;
    }).each(function(i, e){
      showcase.push(e.dataset.id);
    });

    return showcase;
  },

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  sortByName: function(){
    this.wall.sortBy(function(a, b) {
      return $(a).attr('data-name') > $(b).attr('data-name');
    }).filter('*');

    this.fixSize();
  },

  sortByDate: function(){
    this.wall.sortBy(function(a, b) {
      return $(a).attr('data-date') < $(b).attr('data-date');
    }).filter('*');

    this.fixSize();
  },

  sortByShowcase: function(){
    this.wall.sortBy(function(a, b) {
      return $(a).attr('data-showcase') - $(b).attr('data-showcase');
    }).filter('.filter-active');

    this.fixSize();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  updateGrid: function(){
    var self = this;

    if (!this.wall){
      this.wall = new window.freewall(this.$el);
    }

    this.wall.reset({
      draggable: this.showcaseMode,
      animate: true,
      keepOrder: false,
      selector: '.entity',
      cellW: 200,
      cellH: 200,
      gutterY: this.gutter,
      gutterX: this.gutter,
      onResize: this.refresh.bind(this),
      onComplete: function(/*lastItem, lastBlock, setting*/) { },
      onBlockDrop: function() {

        var cols = self.$el.attr('data-total-col');
        var pos = $(this).attr('data-position');
        var ps = pos.split('-');

        var row = parseInt(ps[0],10);
        var showcase = ((row*cols) + parseInt(ps[1],10));

        $(this).attr('data-showcase', showcase+1);
        self.model.isDirty = true;
      }
    });

    if (this.showcaseMode){
      this.$el.addClass("showcase");
      this.sortByShowcase();
      return;
    }

    this.sortByDate();

  },

  refresh: function(){
    this.wall.fitWidth();
    this.wall.refresh();
    this.fixSize();
  },

  fixSize: function(){
    this.$el.height(this.$el.height() + this.gutter*4);
  },

});
},{"./Card":34}],36:[function(require,module,exports){
/**
 * VIEW: An Embed Project
 *
 */

var template = require('./templates/embed.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){ return this.model.get("_id"); },

  tagName: 'a',
  className: 'entity project',
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    var url = "/projects/" + this.model.get("_id");
    this.$el.attr({
      'target': '_blank',
      'href': url
    });

    $('.tooltips', this.$el).tooltip({
      container: 'body',
      placement: 'top'
    });
  },

  serializeData: function(){
    return _.extend({
      settings: this.getSettings()
    }, this.model.toJSON());
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

  getSettings: function(){
    var settings = ['prg', 'pic', 'title', 'desc', 'contrib','acnbar'];
    var hide = hackdash.getQueryVariable('hide');
    hide = (hide && hide.split(',')) || [];

    hide = _.difference(settings, hide);
    var values = _.range(hide.length).map(function () { return 1; });

    return _.object(hide, values);
  }

});
},{"./templates/embed.hbs":38}],37:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <div class=\"item-cover\" style=\"background-image: url("
    + escapeExpression(((helper = (helper = helpers.cover || (depth0 != null ? depth0.cover : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"cover","hash":{},"data":data}) : helper)))
    + ");\"></div>\n";
},"3":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <i class=\"item-letter\">"
    + escapeExpression(((helpers.firstLetter || (depth0 && depth0.firstLetter) || helperMissing).call(depth0, (depth0 != null ? depth0.title : depth0), {"name":"firstLetter","hash":{},"data":data})))
    + "</i>\n";
},"5":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "  <li>\n    <a href=\"/users/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\" ";
  stack1 = ((helper = (helper = helpers.isLandingView || (depth0 != null ? depth0.isLandingView : depth0)) != null ? helper : helperMissing),(options={"name":"isLandingView","hash":{},"fn":this.program(6, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLandingView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + ">\n      "
    + escapeExpression(((helpers.getProfileImage || (depth0 && depth0.getProfileImage) || helperMissing).call(depth0, depth0, {"name":"getProfileImage","hash":{},"data":data})))
    + "\n    </a>\n  </li>\n";
},"6":function(depth0,helpers,partials,data) {
  return "data-bypass";
  },"8":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.contributing : depth0), {"name":"if","hash":{},"fn":this.program(9, data),"inverse":this.program(11, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.following : depth0), {"name":"if","hash":{},"fn":this.program(13, data),"inverse":this.program(15, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"9":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "    <a\n      class=\"tooltips contribute\"\n      data-loading-text=\"leaving...\"\n      data-original-title=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.contributors : depth0)) != null ? stack1.length : stack1), depth0))
    + " contributors\">Leave</a>\n";
},"11":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "    <a\n      class=\"tooltips contribute\"\n      data-loading-text=\"joining...\"\n      data-original-title=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.contributors : depth0)) != null ? stack1.length : stack1), depth0))
    + " contributors\">Join</a>\n";
},"13":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "    <a\n      class=\"tooltips follow\"\n      data-loading-text=\"unfollowing...\"\n      data-original-title=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.followers : depth0)) != null ? stack1.length : stack1), depth0))
    + " followers\">Unfollow</a>\n";
},"15":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "    <a\n      class=\"tooltips follow\"\n      data-loading-text=\"following...\"\n      data-original-title=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.followers : depth0)) != null ? stack1.length : stack1), depth0))
    + " followers\">Follow</a>\n";
},"17":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <a class=\"demo-link\" href=\""
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\" data-bypass>Demo</a>\n";
},"19":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isShowcaseMode : depth0), {"name":"if","hash":{},"fn":this.program(20, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"20":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n  <div class=\"switcher tooltips\" data-placement=\"top\" data-original-title=\"Toggle visibility\">\n    <input type=\"checkbox\" ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.active : depth0), {"name":"if","hash":{},"fn":this.program(21, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + " class=\"switch-small\">\n  </div>\n\n";
},"21":function(depth0,helpers,partials,data) {
  return "checked";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "\n<div class=\"progress\" title=\""
    + escapeExpression(((helper = (helper = helpers.status || (depth0 != null ? depth0.status : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"status","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"progress-bar progress-bar-success progress-bar-striped "
    + escapeExpression(((helper = (helper = helpers.status || (depth0 != null ? depth0.status : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"status","hash":{},"data":data}) : helper)))
    + "\" role=\"progressbar\">\n  </div>\n</div>\n\n<div class=\"cover\">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.cover : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "</div>\n\n<div class=\"details\">\n  <div>\n    <h2>"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h2>\n    <h3><a href=\"/dashboards/"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "\" data-bypass>"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "</a></h3>\n    <p class=\"description\">"
    + escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n  </div>\n</div>\n\n<ul class=\"contributors\">\n";
  stack1 = ((helpers.each_upto || (depth0 && depth0.each_upto) || helperMissing).call(depth0, (depth0 != null ? depth0.contributors : depth0), 5, {"name":"each_upto","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "</ul>\n\n<div class=\"action-bar text-right\">\n\n  <i class=\"fa fa-clock-o timer tooltips\"\n    data-original-title=\""
    + escapeExpression(((helpers.timeAgo || (depth0 && depth0.timeAgo) || helperMissing).call(depth0, (depth0 != null ? depth0.created_at : depth0), {"name":"timeAgo","hash":{},"data":data})))
    + "\"></i>\n\n";
  stack1 = helpers.unless.call(depth0, (depth0 != null ? depth0.isOwner : depth0), {"name":"unless","hash":{},"fn":this.program(8, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.link : depth0), {"name":"if","hash":{},"fn":this.program(17, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "</div>\n\n";
  stack1 = ((helper = (helper = helpers.isLoggedIn || (depth0 != null ? depth0.isLoggedIn : depth0)) != null ? helper : helperMissing),(options={"name":"isLoggedIn","hash":{},"fn":this.program(19, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":46}],38:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"progress\" title=\""
    + escapeExpression(((helper = (helper = helpers.status || (depth0 != null ? depth0.status : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"status","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"progress-bar progress-bar-success progress-bar-striped "
    + escapeExpression(((helper = (helper = helpers.status || (depth0 != null ? depth0.status : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"status","hash":{},"data":data}) : helper)))
    + "\" role=\"progressbar\">\n  </div>\n</div>\n";
},"3":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.cover : depth0), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.program(6, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"4":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"item-cover\" style=\"background-image: url("
    + escapeExpression(((helper = (helper = helpers.cover || (depth0 != null ? depth0.cover : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"cover","hash":{},"data":data}) : helper)))
    + ");\"></div>\n";
},"6":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <i class=\"item-letter\">"
    + escapeExpression(((helpers.firstLetter || (depth0 && depth0.firstLetter) || helperMissing).call(depth0, (depth0 != null ? depth0.title : depth0), {"name":"firstLetter","hash":{},"data":data})))
    + "</i>\n";
},"8":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <i class=\"item-letter\">"
    + escapeExpression(((helpers.firstLetter || (depth0 && depth0.firstLetter) || helperMissing).call(depth0, (depth0 != null ? depth0.title : depth0), {"name":"firstLetter","hash":{},"data":data})))
    + "</i>\n";
},"10":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <div class=\"details\">\n    <div>\n      <h2>"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h2>\n      <h3><a href=\"/dashboards/"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">"
    + escapeExpression(((helper = (helper = helpers.domain || (depth0 != null ? depth0.domain : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"domain","hash":{},"data":data}) : helper)))
    + "</a></h3>\n    </div>\n  </div>\n";
},"12":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing, buffer = "<div class=\"description\">";
  stack1 = ((helpers.markdown || (depth0 && depth0.markdown) || helperMissing).call(depth0, (depth0 != null ? depth0.description : depth0), {"name":"markdown","hash":{},"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"14":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing, buffer = "<ul class=\"contributors\">\n";
  stack1 = ((helpers.each_upto || (depth0 && depth0.each_upto) || helperMissing).call(depth0, (depth0 != null ? depth0.contributors : depth0), 5, {"name":"each_upto","hash":{},"fn":this.program(15, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</ul>\n";
},"15":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <li>\n    <a href=\"/users/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">\n      "
    + escapeExpression(((helpers.getProfileImage || (depth0 && depth0.getProfileImage) || helperMissing).call(depth0, depth0, {"name":"getProfileImage","hash":{},"data":data})))
    + "\n    </a>\n  </li>\n";
},"17":function(depth0,helpers,partials,data) {
  var stack1, helper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", lambda=this.lambda, buffer = "<div class=\"action-bar text-right\">\n\n  <i class=\"fa fa-clock-o timer tooltips\"\n    data-original-title=\""
    + escapeExpression(((helpers.timeAgo || (depth0 && depth0.timeAgo) || helperMissing).call(depth0, (depth0 != null ? depth0.created_at : depth0), {"name":"timeAgo","hash":{},"data":data})))
    + "\"></i>\n\n    <a href=\"/projects/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\"\n      class=\"tooltips contribute\" target=\"_blank\"\n      data-original-title=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.contributors : depth0)) != null ? stack1.length : stack1), depth0))
    + " contributors\">Join</a>\n    <a href=\"/projects/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\"\n      class=\"tooltips follow\" target=\"_blank\"\n      data-original-title=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.followers : depth0)) != null ? stack1.length : stack1), depth0))
    + " followers\">Follow</a>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.link : depth0), {"name":"if","hash":{},"fn":this.program(18, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"18":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <a class=\"demo-link\" href=\""
    + escapeExpression(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"link","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">Demo</a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.settings : depth0)) != null ? stack1.prg : stack1), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n<div class=\"cover\">\n";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.settings : depth0)) != null ? stack1.pic : stack1), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.program(8, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.settings : depth0)) != null ? stack1.title : stack1), {"name":"if","hash":{},"fn":this.program(10, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n</div>\n\n";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.settings : depth0)) != null ? stack1.desc : stack1), {"name":"if","hash":{},"fn":this.program(12, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.settings : depth0)) != null ? stack1.contrib : stack1), {"name":"if","hash":{},"fn":this.program(14, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.settings : depth0)) != null ? stack1.acnbar : stack1), {"name":"if","hash":{},"fn":this.program(17, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

},{"hbsfy/runtime":46}],39:[function(require,module,exports){
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
},{"./handlebars/base":40,"./handlebars/exception":41,"./handlebars/runtime":42,"./handlebars/safe-string":43,"./handlebars/utils":44}],40:[function(require,module,exports){
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
},{"./exception":41,"./utils":44}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
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
},{"./base":40,"./exception":41,"./utils":44}],43:[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],44:[function(require,module,exports){
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
},{"./safe-string":43}],45:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":39}],46:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":45}]},{},[6]);
