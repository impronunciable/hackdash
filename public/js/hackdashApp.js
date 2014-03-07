/*! 
* Hackdash - v0.4.0
* Copyright (c) 2014 Hackdash 
*  
*/ 

(function (modules) {
	var resolve, getRequire, require, notFoundError, findFile
	  , extensions = {".js":[],".json":[],".css":[],".html":[]};
	notFoundError = function (path) {
		var error = new Error("Could not find module '" + path + "'");
		error.code = 'MODULE_NOT_FOUND';
		return error;
	};
	findFile = function (scope, name, extName) {
		var i, ext;
		if (typeof scope[name + extName] === 'function') return name + extName;
		for (i = 0; (ext = extensions[extName][i]); ++i) {
			if (typeof scope[name + ext] === 'function') return name + ext;
		}
		return null;
	};
	resolve = function (scope, tree, path, fullpath, state) {
		var name, dir, exports, module, fn, found, i, ext;
		path = path.split('/');
		name = path.pop();
		if ((name === '.') || (name === '..')) {
			path.push(name);
			name = '';
		}
		while ((dir = path.shift()) != null) {
			if (!dir || (dir === '.')) continue;
			if (dir === '..') {
				scope = tree.pop();
			} else {
				tree.push(scope);
				scope = scope[dir];
			}
			if (!scope) throw notFoundError(fullpath);
		}
		if (name && (typeof scope[name] !== 'function')) {
			found = findFile(scope, name, '.js');
			if (!found) found = findFile(scope, name, '.json');
			if (!found) found = findFile(scope, name, '.css');
			if (!found) found = findFile(scope, name, '.html');
			if (found) {
				name = found;
			} else if ((state !== 2) && (typeof scope[name] === 'object')) {
				tree.push(scope);
				scope = scope[name];
				name = '';
			}
		}
		if (!name) {
			if ((state !== 1) && scope[':mainpath:']) {
				return resolve(scope, tree, scope[':mainpath:'], fullpath, 1);
			}
			return resolve(scope, tree, 'index', fullpath, 2);
		}
		fn = scope[name];
		if (!fn) throw notFoundError(fullpath);
		if (fn.hasOwnProperty('module')) return fn.module.exports;
		exports = {};
		fn.module = module = { exports: exports };
		fn.call(exports, exports, module, getRequire(scope, tree));
		return module.exports;
	};
	require = function (scope, tree, fullpath) {
		var name, path = fullpath, t = fullpath.charAt(0), state = 0;
		if (t === '/') {
			path = path.slice(1);
			scope = modules['/'];
			tree = [];
		} else if (t !== '.') {
			name = path.split('/', 1)[0];
			scope = modules[name];
			if (!scope) throw notFoundError(fullpath);
			tree = [];
			path = path.slice(name.length + 1);
			if (!path) {
				path = scope[':mainpath:'];
				if (path) {
					state = 1;
				} else {
					path = 'index';
					state = 2;
				}
			}
		}
		return resolve(scope, tree, path, fullpath, state);
	};
	getRequire = function (scope, tree) {
		return function (path) { return require(scope, [].concat(tree), path); };
	};
	return getRequire(modules, []);
})({
	"client": {
		"app": {
			"HackdashApp.js": function (exports, module, require) {
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
			},
			"HackdashRouter.js": function (exports, module, require) {
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
				  , ProjectsView = require("./views/Project/Collection")
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

				  showDashboard: function() {
				    this.removeHomeLayout();

				    var app = window.hackdash.app;
				    app.type = "dashboard";

				    app.dashboard = new Dashboard();
				    app.projects = new Projects();

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

				    $.when( app.dashboard.fetch(), app.projects.fetch(this.getSearchQuery()) )
				      .then(function() {
				        app.projects.buildShowcase(app.dashboard.get("showcase"));
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
			},
			"Initializer.js": function (exports, module, require) {
				
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
			},
			"helpers": {
				"backboneOverrides.js": function (exports, module, require) {
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
				},
				"handlebars.js": function (exports, module, require) {
					/**
					 * HELPER: Handlebars Template Helpers
					 * 
					 */
					
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
				}
			},
			"index.js": function (exports, module, require) {
				jQuery(function() {
				  require('./Initializer')();
				});
			},
			"models": {
				"Admins.js": function (exports, module, require) {
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

					});

				},
				"Collection.js": function (exports, module, require) {
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

				},
				"Collections.js": function (exports, module, require) {
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

				},
				"Dashboard.js": function (exports, module, require) {
					/**
					 * MODEL: Project
					 *
					 */

					var Admins = require("./Admins");

					module.exports = Backbone.Model.extend({

					  defaults: {
					    admins: null
					  },

					  url: function(){
					    return hackdash.apiURL + "/"; 
					  },

					  idAttribute: "_id", 

					  initialize: function(){
					    this.set("admins", new Admins());
					  },

					});

				},
				"Dashboards.js": function (exports, module, require) {
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

				},
				"Profile.js": function (exports, module, require) {
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
				},
				"Project.js": function (exports, module, require) {
					/**
					 * MODEL: Project
					 *
					 */

					module.exports = Backbone.Model.extend({

					  idAttribute: "_id",

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

				},
				"Projects.js": function (exports, module, require) {
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
					    return hackdash.apiURL + '/projects'; 
					  },

					  parse: function(response){
					    var projects = [];

					    // only parse projects actives if no user or user not admin of dash
					    _.each(response, function(project){

					      if (hackdash.app.type === "dashboard"){
					        var user = hackdash.user;
					        var isAdmin = user && (user._id === project.leader._id || user.admin_in.indexOf(this.domain) >= 0);
					        if (isAdmin || project.active){
					          projects.push(project);
					        }
					      }
					      else if (project.active) {
					        projects.push(project);
					      }

					    });

					    return projects;
					  },

					  buildShowcase: function(showcase){
					    _.each(showcase, function(id, i){
					      var found = this.where({ _id: id });
					      if (found.length > 0){
					        found[0].set("showcase", i);
					      }
					    }, this);

					    this.trigger("reset");
					  },

					  getOnlyActives: function(){
					    return new Projects(
					      this.filter(function(project){
					        return project.get("active");
					      })
					    );
					  }

					});

				},
				"User.js": function (exports, module, require) {
					/**
					 * MODEL: User
					 *
					 */

					module.exports = Backbone.Model.extend({

					  idAttribute: "_id",

					});
				},
				"Users.js": function (exports, module, require) {
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

				}
			},
			"views": {
				"Collection": {
					"Collection.js": function (exports, module, require) {
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
					},
					"List.js": function (exports, module, require) {
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
						    "description": "input[name=description]"
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

						});
					},
					"ListItem.js": function (exports, module, require) {
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

						  events: {
						    "click .view-collection": "viewCollection"
						  },

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

						    this.$el.on("click", this.toggleDashboard.bind(this));
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

						  viewCollection: function(e){
						    e.stopPropagation();
						    hackdash.app.modals.close();
						  },

						  toggleDashboard: function(){
						    if (this.hasDashboard()){
						      this.model.removeDashboard(this.dashboardId);
						    }
						    else {
						      this.model.addDashboard(this.dashboardId);
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
					},
					"index.js": function (exports, module, require) {
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
					},
					"templates": {
						"collection.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


							  buffer += "<div class=\"well\">\n  <div class=\"well-content\">\n    <h4>";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</h4>\n    ";
							  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\n  </div>\n  <div class=\"row-fluid footer-box\">\n    <div class=\"aging activity created_at\">\n      <i rel=\"tooltip\" title=\"";
							  options = {hash:{},data:data};
							  buffer += escapeExpression(((stack1 = helpers.timeAgo || depth0.timeAgo),stack1 ? stack1.call(depth0, depth0.created_at, options) : helperMissing.call(depth0, "timeAgo", depth0.created_at, options)))
							    + "\" class=\"tooltips icon-time icon-1\"></i>\n    </div>\n  </div>\n</div>\n";
							  return buffer;
							  })
							;
						},
						"list.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  


							  return "<div class=\"modal-header\">\n  <button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close\">×</button>\n  <h3>My Collections</h3>\n</div>\n<div class=\"modal-body\">\n  <ul class=\"collections\"></ul>\n</div>\n<div class=\"modal-footer\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div class=\"span10\">\n        <input type=\"text\" name=\"title\" placeholder=\"Enter Title\" class=\"input-medium pull-left\" style=\"margin-right: 10px;\">\n        <input type=\"text\" name=\"description\" placeholder=\"Enter Description\" class=\"input-medium pull-left\">\n        <input type=\"button\" class=\"btn primary btn-success pull-left btn-add\" value=\"Add\">\n      </div>\n      <div class=\"span2\">\n        <input type=\"button\" class=\"btn primary pull-right\" data-dismiss=\"modal\" value=\"Close\">\n      </div>\n    </div>\n  </div>\n</div>";
							  })
							;
						},
						"listItem.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


							  buffer += "<label class=\"pull-left\">\n  ";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\n</label>\n\n<a class=\"pull-right view-collection\" href=\"/collections/";
							  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">View</a>";
							  return buffer;
							  })
							;
						}
					}
				},
				"Dashboard": {
					"Collection.js": function (exports, module, require) {
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
					},
					"index.js": function (exports, module, require) {
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
					},
					"templates": {
						"dashboard.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing, helperMissing=helpers.helperMissing;

							function program1(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n    <div class=\"pull-right demo\">\n      <a href=\"";
							  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" target=\"_blank\" class=\"btn btn-link\">Site</a>\n    </div>\n    ";
							  return buffer;
							  }

							function program3(depth0,data) {
							  
							  var buffer = "", stack1, options;
							  buffer += "\n      ";
							  options = {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data};
							  if (stack1 = helpers.isLoggedIn) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isLoggedIn; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n    ";
							  return buffer;
							  }
							function program4(depth0,data) {
							  
							  
							  return "\n      <div class=\"pull-right add\">\n        <a class=\"btn btn-link add\">Add to Collections</a>\n      </div>\n      ";
							  }

							  buffer += "<div class=\"well\">\n  <div class=\"well-content\">\n    <h4>";
							  if (stack1 = helpers.domain) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.domain; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</h4>\n    <h4>";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</h4>\n    ";
							  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\n    <br/>\n  </div>\n  <div class=\"row-fluid footer-box\">\n    <div class=\"aging activity created_at\">\n      <i rel=\"tooltip\" title=\"";
							  options = {hash:{},data:data};
							  buffer += escapeExpression(((stack1 = helpers.timeAgo || depth0.timeAgo),stack1 ? stack1.call(depth0, depth0.created_at, options) : helperMissing.call(depth0, "timeAgo", depth0.created_at, options)))
							    + "\" class=\"tooltips icon-time icon-1\"></i>\n    </div>\n\n    ";
							  stack2 = helpers['if'].call(depth0, depth0.link, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n\n    ";
							  stack2 = helpers.unless.call(depth0, depth0.hideAdd, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n    \n  </div>\n</div>\n";
							  return buffer;
							  })
							;
						}
					}
				},
				"Footer": {
					"User.js": function (exports, module, require) {
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
					},
					"Users.js": function (exports, module, require) {
						/**
						 * VIEW: Collection of Users
						 * 
						 */

						var User = require('./User');

						module.exports = Backbone.Marionette.CollectionView.extend({

						  //--------------------------------------
						  //+ PUBLIC PROPERTIES / CONSTANTS
						  //--------------------------------------

						  tagName: "ul",
						  itemView: User
						  
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
					},
					"index.js": function (exports, module, require) {
						
						var 
						    template = require('./templates/footer.hbs')
						  , Users = require('./Users');

						module.exports = Backbone.Marionette.Layout.extend({

						  //--------------------------------------
						  //+ PUBLIC PROPERTIES / CONSTANTS
						  //--------------------------------------

						  className: "container",
						  template: template,

						  regions: {
						    "admins": ".admins-ctn"
						  },

						  //--------------------------------------
						  //+ INHERITED / OVERRIDES
						  //--------------------------------------

						  onRender: function(){
						    var isDashboard = (hackdash.app.type === "dashboard" ? true : false);
						    
						    if (isDashboard){

						      this.admins.show(new Users({
						        collection: this.model.get("admins")
						      }));

						      this.model.get("admins").fetch();
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
					},
					"templates": {
						"footer.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  


							  return "<h4>Admins</h4>\n<div class=\"well-content admins-ctn\"></div>";
							  })
							;
						},
						"user.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


							  buffer += "<a href=\"/users/";
							  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">\n  <img class=\"avatar tooltips\" rel=\"tooltip\" \n    src=\"";
							  if (stack1 = helpers.picture) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.picture; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" data-id=\"";
							  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" title=\"";
							  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">\n</a>";
							  return buffer;
							  })
							;
						}
					}
				},
				"Header": {
					"Collection.js": function (exports, module, require) {
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
					},
					"Collections.js": function (exports, module, require) {
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
					},
					"Dashboard.js": function (exports, module, require) {
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
						    "link": "#dashboard-link",
						    "switcher": ".dashboard-switcher input",
						    "showcase": ".showcase-switcher input"
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
						        this.initSwitcher();
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

						  initSwitcher: function(){
						    var self = this;

						    this.ui.switcher
						      .bootstrapSwitch()
						      .on('switch-change', function (e, data) {
						        self.model.set({ "open": data.value}, { trigger: false });
						        self.model.save({ wait: true });
						      });

						    this.ui.showcase
						      .bootstrapSwitch()
						      .on('switch-change', function (e, data) {
						        if (data.value){
						          self.model.trigger("edit:showcase");
						        }
						        else {
						          self.model.trigger("end:showcase"); 
						        }
						      });
						  }

						});
					},
					"Dashboards.js": function (exports, module, require) {
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
					},
					"Search.js": function (exports, module, require) {
						
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
						      showSort: this.showSort
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
					},
					"index.js": function (exports, module, require) {
						
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
						  },

						  //--------------------------------------
						  //+ INHERITED / OVERRIDES
						  //--------------------------------------

						  onRender: function(){
						    var type = window.hackdash.app.type;
						    
						    var self = this;
						    function showSearch(){
						      self.search.show(new Search({
						        showSort: type === "dashboard",
						        collection: self.collection
						      }));
						    }

						    switch(type){
						      case "isearch":
						        showSearch();
						        this.ui.pageTitle.text("Search Projects");
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
						        }
						        break;

						      case "collections":
						        showSearch();
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
					},
					"templates": {
						"collection.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

							function program1(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n\n  <h1>\n    <a id=\"collection-title\">";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</a>\n  </h1>\n\n  <p class=\"lead collection-lead\">\n    <a id=\"collection-description\">";
							  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</a>\n  </p>\n\n";
							  return buffer;
							  }

							function program3(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n\n  ";
							  stack1 = helpers['if'].call(depth0, depth0.title, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n  ";
							  stack1 = helpers['if'].call(depth0, depth0.description, {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n";
							  return buffer;
							  }
							function program4(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n  <h1>\n    ";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\n  </h1>\n  ";
							  return buffer;
							  }

							function program6(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n  <p class=\"lead\">";
							  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</p>\n  ";
							  return buffer;
							  }

							  stack1 = helpers['if'].call(depth0, depth0.isAdmin, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
							  if(stack1 || stack1 === 0) { return stack1; }
							  else { return ''; }
							  })
							;
						},
						"collections.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, options, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

							function program1(depth0,data) {
							  
							  
							  return "\n  <a class=\"btn btn-large\" href=\"/dashboards\">Create a Collection</a>\n";
							  }

							function program3(depth0,data) {
							  
							  
							  return "\n  <a class=\"btn btn-large\" href=\"/login\">Login to manage collections</a>\n";
							  }

							  buffer += "<h1>Search Collections</h1>\n\n";
							  options = {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data};
							  if (stack1 = helpers.isLoggedIn) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isLoggedIn; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n";
							  return buffer;
							  })
							;
						},
						"dashboard.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

							function program1(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n    \n    ";
							  stack1 = helpers['if'].call(depth0, depth0.title, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n    ";
							  stack1 = helpers['if'].call(depth0, depth0.description, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n";
							  return buffer;
							  }
							function program2(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n    <h1>\n      ";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\n\n      ";
							  stack1 = helpers['if'].call(depth0, depth0.link, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n    </h1>\n    ";
							  return buffer;
							  }
							function program3(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n      <a class=\"dashboard-link\" href=\"";
							  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" target=\"_blank\" data-bypass>site</a>\n      ";
							  return buffer;
							  }

							function program5(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n    <p class=\"lead\">";
							  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</p>\n    ";
							  return buffer;
							  }

							function program7(depth0,data) {
							  
							  var buffer = "", stack1, options;
							  buffer += "\n\n  ";
							  stack1 = helpers['if'].call(depth0, depth0.isAdmin, {hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n  ";
							  options = {hash:{},inverse:self.program(20, program20, data),fn:self.program(12, program12, data),data:data};
							  if (stack1 = helpers.isLoggedIn) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isLoggedIn; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n";
							  return buffer;
							  }
							function program8(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n\n    <h1>\n      <a id=\"dashboard-title\">";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</a>\n    </h1>\n\n    <p class=\"lead dashboard-lead\">\n      <a id=\"dashboard-description\">";
							  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</a>\n    </p>\n\n    <p class=\"dashboard-link\">\n      <a id=\"dashboard-link\">";
							  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</a>\n    </p>\n\n  ";
							  return buffer;
							  }

							function program10(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n\n    ";
							  stack1 = helpers['if'].call(depth0, depth0.title, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n    ";
							  stack1 = helpers['if'].call(depth0, depth0.description, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n  ";
							  return buffer;
							  }

							function program12(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n\n    ";
							  stack1 = helpers['if'].call(depth0, depth0.open, {hash:{},inverse:self.program(15, program15, data),fn:self.program(13, program13, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n    ";
							  stack1 = helpers['if'].call(depth0, depth0.isAdmin, {hash:{},inverse:self.noop,fn:self.program(17, program17, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n  ";
							  return buffer;
							  }
							function program13(depth0,data) {
							  
							  
							  return "\n    <a class=\"btn btn-large\" href=\"/projects/create\">New Project</a>\n    ";
							  }

							function program15(depth0,data) {
							  
							  
							  return "\n    <h4 class=\"tooltips dashboard-closed\" \n      data-placement=\"bottom\" data-original-title=\"Dashboard closed for creating projects\">Dashboard Closed</h4>\n    ";
							  }

							function program17(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n    <div class=\"tooltips dashboard-switcher\"\n      data-placement=\"top\" data-original-title=\"Toggle creation of projects on this Dashboard\">\n      \n      <input type=\"checkbox\" ";
							  stack1 = helpers['if'].call(depth0, depth0.open, {hash:{},inverse:self.noop,fn:self.program(18, program18, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += " class=\"switch-large\"\n        data-off-label=\"CLOSE\" data-on-label=\"OPEN\">\n    </div>\n\n    <div class=\"tooltips showcase-switcher-ctn\"\n        data-placement=\"top\" data-original-title=\"Toggle sort edition of projects for showcase\">\n      <h5>Edit Showcase mode</h5>\n      <div class=\"showcase-switcher\">      \n        <input type=\"checkbox\" class=\"switch-large\" data-off-label=\"OFF\" data-on-label=\"ON\">\n      </div>\n    </div>\n\n    <a class=\"btn export\" href=\"/api/v2/csv\" target=\"_blank\" data-bypass>Export CSV</a>\n    ";
							  return buffer;
							  }
							function program18(depth0,data) {
							  
							  
							  return "checked";
							  }

							function program20(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n\n    ";
							  stack1 = helpers['if'].call(depth0, depth0.open, {hash:{},inverse:self.program(23, program23, data),fn:self.program(21, program21, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n  ";
							  return buffer;
							  }
							function program21(depth0,data) {
							  
							  
							  return "\n    <a class=\"btn btn-large\" href=\"/login\">Login to create a project</a>\n    ";
							  }

							function program23(depth0,data) {
							  
							  
							  return "\n    <a class=\"btn btn-large\" href=\"/login\">Login to join/follow projects</a>\n    ";
							  }

							  stack1 = helpers['if'].call(depth0, depth0.readOnly, {hash:{},inverse:self.program(7, program7, data),fn:self.program(1, program1, data),data:data});
							  if(stack1 || stack1 === 0) { return stack1; }
							  else { return ''; }
							  })
							;
						},
						"dashboards.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, options, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

							function program1(depth0,data) {
							  
							  
							  return "\n  \n";
							  }

							function program3(depth0,data) {
							  
							  
							  return "\n  <a class=\"btn btn-large\" href=\"/login\">Login to manage collections</a>\n";
							  }

							  buffer += "<h1>Search Dashboards</h1>\n\n";
							  options = {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data};
							  if (stack1 = helpers.isLoggedIn) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isLoggedIn; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n";
							  return buffer;
							  })
							;
						},
						"header.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

							function program1(depth0,data) {
							  
							  var buffer = "", stack1, options;
							  buffer += "\n  <a class=\"btn-profile\" href=\"/users/profile\">\n    <img class=\"avatar tooltips\" src=\"";
							  options = {hash:{},data:data};
							  buffer += escapeExpression(((stack1 = helpers.user || depth0.user),stack1 ? stack1.call(depth0, "picture", options) : helperMissing.call(depth0, "user", "picture", options)))
							    + "\" rel=\"tooltip\" data-placement=\"bottom\" data-original-title=\"Edit profile\">\n  </a>  \n  <a class=\"btn logout\" href=\"/logout\" data-bypass>Logout</a>\n  ";
							  return buffer;
							  }

							  buffer += "<div class=\"search-ctn\"></div>\n\n<div class=\"createProject pull-right btn-group\">\n  ";
							  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
							  if (stack1 = helpers.isLoggedIn) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isLoggedIn; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n</div>\n\n<a class=\"logo\" href=\"";
							  if (stack1 = helpers.hackdashURL) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.hackdashURL; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" data-bypass></a>\n\n<div class=\"page-ctn\"></div>\n<h1 class=\"page-title\"></h1>";
							  return buffer;
							  })
							;
						},
						"search.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, options, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

							function program1(depth0,data) {
							  
							  
							  return "\n<div class=\"orderby\">\n  <div class=\"btn-group\">\n    <button data-option-value=\"name\" class=\"sort btn\">Order by name</button>\n    <button data-option-value=\"date\" class=\"sort btn\">Order by date</button>\n  </div>\n  <br/>\n  <div class=\"btn-group\">\n    <button data-option-value=\"showcase\" class=\"sort btn\" style=\"margin-top: 5px;\">Order for Showcase</button>\n  </div>\n</div>\n";
							  }

							  buffer += "<i class=\"icon-large icon-search\"></i>\n<input id=\"searchInput\" type=\"text\" class=\"search-query input-large\" placeholder=\"Type here\"/>\n\n";
							  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
							  if (stack1 = helpers.isDashboardView) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isDashboardView; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  return buffer;
							  })
							;
						}
					}
				},
				"Home": {
					"index.js": function (exports, module, require) {
						
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
					},
					"templates": {
						"home.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, options, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

							function program1(depth0,data) {
							  
							  
							  return "\n        <form>\n          <p class=\"control-group\">\n            <input class=\"input-xlarge\" id=\"domain\" maxlength=\"10\"\n              placeholder=\"Hackathon domain Name (5-10 chars)\" type=\"text\">\n            <label>(5-10 lowercase letters/numbers)</label>\n          </p>\n\n          <p>\n            <input id=\"create-dashboard\" class=\"btn btn-large btn-custom disabled\" type=\"button\" value=\"Create a Dashboard\">\n          </p>\n        </form>\n        ";
							  }

							function program3(depth0,data) {
							  
							  
							  return "\n        <p>\n          <a class=\"btn btn-large btn-custom\" href=\"/login\">Log in to create a Hackathon</a>\n        </p>\n        ";
							  }

							  buffer += "\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n      \n    <section class=\"brand\">\n      <header>\n        <h1><a href=\"#\">HackDash</a></h1>\n      </header>\n\n      <div class=\"content\">\n        <h2>Ideas for a hackathon</h2>\n        <p>Upload your project. Add colaborators. Inform status. Share your app.</p>\n\n        ";
							  options = {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data};
							  if (stack1 = helpers.isLoggedIn) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isLoggedIn; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n      </div>\n    </section>\n  </div>\n</div>\n\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n    <div class=\"span6\">\n      <section class=\"block\">\n        <header>\n          <h3>Find Projects</h3>\n        </header>\n\n        <div class=\"content span12\">\n          <p class=\"control-group\">\n            <input class=\"input-large search-box\" id=\"search-projects\"\n              placeholder=\"name or description\" type=\"text\">\n            <button class=\"btn btn-large btn-custom disabled search-btn\" id=\"search-projects-btn\">Search</button>\n          </p>\n        </div>\n      </section>\n    </div>\n\n    <div class=\"span6\">\n      <section class=\"block\">\n        <header>\n          <h3>Find Collections</h3>\n        </header>\n\n        <div class=\"content span12\">\n          <p class=\"control-group\">\n            <input class=\"input-large search-box\" id=\"search-collections\"\n              placeholder=\"name or description\" type=\"text\">\n            <button class=\"btn btn-large btn-custom disabled search-btn\" id=\"search-collections-btn\">Search</button>\n            <button class=\"btn btn-large btn-custom disabled search-btn\" id=\"create-collections-btn\">Create</button>\n          </p>\n        </div>\n      </section>\n    </div>\n\n  </div>\n</div>\n\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n    <section class=\"block\">\n      <header>\n        <h3>About</h3>\n      </header>\n\n      <div class=\"content span11\">\n        <p>The HackDash was born by accident and by a need.\n        We were looking for platform to track ideas through\n        hackathons in the line to the Hacks/Hackers Media\n        Party organized by @HacksHackersBA where hackers\n        and journalists share ideas. We spread the idea\n        through Twitter and that was the context of the\n        HackDash born. @blejman had an idea and\n        @danzajdband was interested in implement that idea.\n        So we started building the app hoping we can get to\n        the Buenos Aires media party with something that\n        doesn't suck. The Media Party Hackathon day came\n        followed by a grateful surprise. Not only the\n        people liked the HackDash implementation but a\n        couple of coders added the improvement of the\n        HackDash as a Hackaton project. After the Media\n        Party we realized that this small app is filling a\n        real need. The Dashboard has been used now in\n        several ways like Node.js Argentina meetup,\n        HacksHackersBA, La Nación DataFest and\n        HackasHackersCL (using it as a Wordpress theme).\n        Now, the HackDash will be an standard for\n        hackathons through the PinLatAm program, for news\n        innovation in Latin America. Create your own\n        hackathon.</p>\n      </div>\n    </section>\n  </div>\n</div>\n\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n    <section class=\"block\">\n      <header>\n        <h3>Why Hackdash?</h3>\n      </header>\n\n      <div class=\"content\">\n        <div class=\"row-fluid\">\n          <div class=\"span10 offset1 brand-why\">\n            <div class=\"span3\">\n              <div class=\"icon quick\"></div>\n              <h5>Quick and Easy</h5>\n            </div>\n\n            <div class=\"span3\">\n              <div class=\"icon nerds\"></div>\n              <h5>For Nerds</h5>\n            </div>\n\n            <div class=\"span3\">\n              <div class=\"icon fast\"></div>\n              <h5>Fast</h5>\n            </div>\n\n            <div class=\"span3\">\n              <div class=\"icon geeks\"></div>\n              <h5>Love &amp; Geeks</h5>\n            </div>\n          </div>\n        </div>\n      </div>\n    </section>\n  </div>\n</div>\n\n<div class=\"row-fluid\">\n  <div class=\"span12\">\n    <section class=\"block\">\n      <header>\n        <h3>Partners</h3>\n      </header>\n\n      <div class=\"content\">\n        <div class=\"row-fluid\">\n          <div class=\"span10 offset2 partners\">\n            <div class=\"span5 hhba\"></div>\n            <div class=\"span5 nxtp\"></div>\n          </div>\n        </div>\n      </div>\n    </section>\n  </div>\n</div>\n";
							  return buffer;
							  })
							;
						}
					}
				},
				"Login.js": function (exports, module, require) {
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
				},
				"ModalRegion.js": function (exports, module, require) {
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
				},
				"Profile": {
					"Card.js": function (exports, module, require) {
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
					},
					"CardEdit.js": function (exports, module, require) {
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
					},
					"index.js": function (exports, module, require) {
						
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
					},
					"templates": {
						"card.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


							  buffer += "<h3 class=\"header\">\n  <img src=\"";
							  if (stack1 = helpers.picture) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.picture; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" style=\"margin-right: 10px;\" class=\"avatar\">\n  ";
							  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\n</h3>\n<div class=\"profileInfo\">\n  <p><strong>Email: </strong>";
							  if (stack1 = helpers.email) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.email; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</p>\n  <p><strong>Bio: </strong>";
							  if (stack1 = helpers.bio) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.bio; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</p>\n</div>";
							  return buffer;
							  })
							;
						},
						"cardEdit.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


							  buffer += "<h3 class=\"header\">Edit Your Profile</h3>\n<div>\n  <form>\n    <div class=\"form-content\">\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <input name=\"name\" type=\"text\" placeholder=\"Name\" value=\"";
							  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" class=\"input-block-level\"/>\n        </div>\n      </div>\n      <div class=\"control-group\">\n        <div class=\"controls\">      \n          <input name=\"email\" type=\"text\" placeholder=\"Email\" value=\"";
							  if (stack1 = helpers.email) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.email; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" class=\"input-block-level\"/>\n        </div>\n      </div>\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <textarea name=\"bio\" placeholder=\"Some about you\" class=\"input-block-level\">";
							  if (stack1 = helpers.bio) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.bio; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</textarea>\n        </div>\n      </div>\n    </div>\n    <div class=\"form-actions\">\n      <input id=\"save\" type=\"button\" data-loading-text=\"saving..\" value=\"Save profile\" class=\"btn primary btn-success pull-left\"/>\n      <a id=\"cancel\" class=\"cancel btn btn-cancel pull-right\">Cancel</a>\n    </div>\n  </form>\n</div>";
							  return buffer;
							  })
							;
						},
						"profile.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  


							  return "<div class=\"span6 span-center\">\n\n  <div class=\"profile-card\"></div>\n\n  <h4>My Collections (<span class=\"coll-length\">0</span>)</h4>\n  <div class=\"collections-ctn\"></div>\n\n  <h4>Dashboards (<span class=\"dash-length\">0</span>)</h4>\n  <div class=\"dashboards-ctn\"></div>\n\n  <h4>Projects created (<span class=\"proj-length\">0</span>)</h4>\n  <div class=\"projects-ctn\"></div>\n\n  <h4>Contributions (<span class=\"contrib-length\">0</span>)</h4>\n  <div class=\"contributions-ctn\"></div>\n\n  <h4>Likes (<span class=\"likes-length\">0</span>)</h4>\n  <div class=\"likes-ctn\"></div>\n  \n</div>\n";
							  })
							;
						}
					}
				},
				"Project": {
					"Collection.js": function (exports, module, require) {
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

						  modelEvents:{
						    "edit:showcase": "onStartEditShowcase",
						    "end:showcase": "onEndEditShowcase"
						  },

						  //--------------------------------------
						  //+ INHERITED / OVERRIDES
						  //--------------------------------------
						  
						  showcaseMode: false,

						  onRender: function(){
						    var self = this;
						    _.defer(function(){
						      self.updateIsotope();

						      if (self.showcaseMode){
						        self.startSortable();
						      }
						    });
						  },

						  //--------------------------------------
						  //+ PUBLIC METHODS / GETTERS / SETTERS
						  //--------------------------------------

						  //--------------------------------------
						  //+ EVENT HANDLERS
						  //--------------------------------------

						  onStartEditShowcase: function(){
						    this.collection = hackdash.app.projects.getOnlyActives();
						    this.showcaseMode = true;
						    this.render();
						  },

						  onEndEditShowcase: function(){
						    this.saveShowcase();
						    this.collection = hackdash.app.projects;
						    this.showcaseMode = false;
						    this.render();
						  },

						  //--------------------------------------
						  //+ PRIVATE AND PROTECTED METHODS
						  //--------------------------------------

						  sortByName: function(){
						    this.$el.isotope({"sortBy": "name"});
						  },

						  sortByDate: function(){
						    this.$el.isotope({"sortBy": "date"});
						  },

						  sortByShowcase: function(){
						    this.$el.isotope({"sortBy": "showcase"});
						  },

						  gridSize: {
						    columnWidth: 300,
						    rowHeight: 220
						  },

						  isotopeInitialized: false,
						  updateIsotope: function(sortType){
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
						  },
						/*
						  endSortable: function(){
						    var $projects = this.$el;

						    this.saveShowcase();

						    this.pckry.destroy();
						    $projects.removeClass("showcase");

						    this.updateIsotope("showcase");
						  },
						*/
						  saveShowcase: function(){
						    var itemElems = this.pckry.getItemElements();
						    var showcase = [];

						    for ( var i=0, len = itemElems.length; i < len; i++ ) {
						      var elem = itemElems[i];
						      $(elem).data('showcase', i);

						      var found = this.collection.where({ _id: elem.id });
						      if (found.length > 0){
						        found[0].set({ "showcase": i}, { silent: true });
						      }

						      showcase.push(elem.id);
						    }

						    this.model.save({ "showcase": showcase });

						    this.pckry.destroy();
						    this.$el.removeClass("showcase");
						    this.updateIsotope("showcase");
						  }

						});
					},
					"Edit.js": function (exports, module, require) {
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
						    this.ui.status.select2({
						      minimumResultsForSearch: 10
						    });

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
					},
					"Full.js": function (exports, module, require) {
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

						  className: "project tooltips",
						  template: template,

						  modelEvents: {
						    "change": "render"
						  },

						  //--------------------------------------
						  //+ INHERITED / OVERRIDES
						  //--------------------------------------

						  onRender: function(){
						    this.$el
						      .addClass(this.model.get("status"))
						      .attr({ "title": this.model.get("status") })
						      .tooltip({});

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
					},
					"List.js": function (exports, module, require) {
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
					},
					"ListItem.js": function (exports, module, require) {
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
						      url = "/collections/" + this.model.get("_id");
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
					},
					"index.js": function (exports, module, require) {
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
						    },
						    isDashboardAdmin: function(){
						      return hackdash.user && hackdash.user.admin_in.indexOf(this.domain) >= 0;
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
						        self.model.save({ silent: true });
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
					},
					"templates": {
						"edit.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

							function program1(depth0,data) {
							  
							  
							  return "\n        <div id=\"ghImportHolder\">\n          <a id=\"ghImportBtn\" href=\"#\">Import from Github</a>\n\n          <div class=\"gh-import control-group hidden\">\n            <div class=\"controls\">\n              <input id=\"txt-repo\" type=\"text\" placeholder=\"repo user/name\" name=\"repo\" class=\"input-block-level\"/>\n              <button id=\"searchGh\" class=\"btn\">Import</button>\n            </div>\n          </div>\n        </div>\n        ";
							  }

							function program3(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "style=\"background: url(";
							  if (stack1 = helpers.cover) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.cover; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + ");\" class=\"project-image\"";
							  return buffer;
							  }

							function program5(depth0,data) {
							  
							  var buffer = "";
							  buffer += "\n              <option value=\""
							    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
							    + "\">"
							    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
							    + "</option>\n              ";
							  return buffer;
							  }

							  buffer += "<div class=\"boxxy\">\n  <h3 class=\"header\">";
							  if (stack1 = helpers.typeForm) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.typeForm; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</h3>\n  <div>\n    <form>\n      <div class=\"form-content\">\n        ";
							  stack1 = helpers.unless.call(depth0, depth0._id, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <input type=\"text\" placeholder=\"Title\" name=\"title\" class=\"input-block-level\" value=\"";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\"/>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <textarea id=\"description\" name=\"description\" rows=\"4\" maxlength=\"400\" placeholder=\"Description\" class=\"input-block-level\">";
							  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</textarea>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <div id=\"dragdrop\" ";
							  stack1 = helpers['if'].call(depth0, depth0.cover, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "> \n              <p>Drag Photo Here\n                <input type=\"file\" name=\"cover_fall\" id=\"cover_fall\"/>\n              </p>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <input type=\"text\" name=\"link\" id=\"link\" placeholder=\"Link\" class=\"input-block-level\" value=\"";
							  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\"/>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <input type=\"text\" name=\"tags\" id=\"tags\" placeholder=\"Tags\" style=\"width: 100%\" class=\"input-block-level\" value=\"";
							  if (stack1 = helpers.getTags) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.getTags; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\"/>\n          </div>\n        </div>\n\n        <div class=\"control-group\">\n          <div class=\"controls\">\n            <select name=\"status\" id=\"status\" style=\"width: 100%\" class=\"input-block-level\" value=\"";
							  if (stack1 = helpers.status) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.status; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">\n              ";
							  stack1 = helpers.each.call(depth0, depth0.statuses, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n            </select>\n          </div>\n        </div>\n\n      </div>\n\n      <div class=\"form-actions\">\n        <input id=\"save\" type=\"button\" value=\"Save\" class=\"btn primary btn-success pull-left\"/>\n        <a id=\"cancel\" data-dismiss=\"modal\" class=\"cancel btn btn-cancel pull-right\">Cancel</a>\n      </div>\n\n    </form>\n  </div>\n</div>";
							  return buffer;
							  })
							;
						},
						"full.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

							function program1(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n    <a href=\"";
							  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">";
							  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</a>\n    ";
							  return buffer;
							  }

							function program3(depth0,data) {
							  
							  var buffer = "";
							  buffer += "\n        <li>"
							    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
							    + "</li>\n        ";
							  return buffer;
							  }

							function program5(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n            <a href=\"/users/";
							  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">\n              <img class=\"tooltips\" rel=\"tooltip\" \n                src=\"";
							  if (stack1 = helpers.picture) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.picture; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" data-id=\"";
							  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" title=\"";
							  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">\n            </a>\n          ";
							  return buffer;
							  }

							  buffer += "<div class=\"well\">\n  \n  <div class=\"well-header\">\n    <h3><a href=\"/\">";
							  if (stack1 = helpers.domain) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.domain; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</a></h3>\n    <h3>";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</h3>\n    <p>";
							  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</p>\n    ";
							  stack1 = helpers['if'].call(depth0, depth0.link, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n  </div>\n\n  <div class=\"row-fluid\">\n\n    <div class=\"well-sidebar span4\">\n      <h6>Created</h6><strong>";
							  options = {hash:{},data:data};
							  buffer += escapeExpression(((stack1 = helpers.timeAgo || depth0.timeAgo),stack1 ? stack1.call(depth0, depth0.created_at, options) : helperMissing.call(depth0, "timeAgo", depth0.created_at, options)))
							    + "</strong>\n      <h6>State</h6><strong>";
							  if (stack2 = helpers.status) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
							  else { stack2 = depth0.status; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
							  buffer += escapeExpression(stack2)
							    + "</strong>\n      <h6>Tags</h6>\n      <ul>\n        ";
							  stack2 = helpers.each.call(depth0, depth0.tags, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n      </ul>\n    </div>\n\n    <div class=\"well-content span8\">\n\n      <div class=\"span4\">\n        <h5>Managed by</h5>\n        <a href=\"/users/"
							    + escapeExpression(((stack1 = ((stack1 = depth0.leader),stack1 == null || stack1 === false ? stack1 : stack1._id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
							    + "\">\n          <img src=\""
							    + escapeExpression(((stack1 = ((stack1 = depth0.leader),stack1 == null || stack1 === false ? stack1 : stack1.picture)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
							    + "\" title=\""
							    + escapeExpression(((stack1 = ((stack1 = depth0.leader),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
							    + "\" rel=\"tooltip\" class=\"tooltips\"/>\n        </a>\n      </div>\n\n      <div class=\"span4\">\n        <h5>Contributors</h5>\n          ";
							  stack2 = helpers.each.call(depth0, depth0.contributors, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n      </div>\n\n      <div class=\"span4\">\n        <h5>"
							    + escapeExpression(((stack1 = ((stack1 = depth0.followers),stack1 == null || stack1 === false ? stack1 : stack1.length)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
							    + " Likes</h5>\n          ";
							  stack2 = helpers.each.call(depth0, depth0.followers, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n      </div>\n\n    </div>\n\n    <div id=\"disqus_thread\" class=\"well-header\"></div>\n    <script src=\"/js/disqus.js\" disqus_shortname=\"";
							  if (stack2 = helpers.disqus_shortname) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
							  else { stack2 = depth0.disqus_shortname; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
							  buffer += escapeExpression(stack2)
							    + "\"></script>\n    \n  </div>\n</div>\n";
							  return buffer;
							  })
							;
						},
						"listItem.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


							  buffer += "<a href=\"";
							  if (stack1 = helpers.url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">\n  <div class=\"well\">\n    ";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\n  </div>\n</a>";
							  return buffer;
							  })
							;
						},
						"project.hbs.js": function (exports, module, require) {
							module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
							  this.compilerInfo = [4,'>= 1.0.0'];
							helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
							  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing, helperMissing=helpers.helperMissing;

							function program1(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n    <div class=\"project-image\" style=\"background-image: url('";
							  if (stack1 = helpers.cover) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.cover; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "');\"></div>\n    ";
							  return buffer;
							  }

							function program3(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n      <h4><a href=\"";
							  if (stack1 = helpers.instanceURL) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.instanceURL; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">";
							  if (stack1 = helpers.domain) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.domain; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</a></h4>\n    ";
							  return buffer;
							  }

							function program5(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n      <a href=\"/users/";
							  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">\n        <img class=\"avatar tooltips\" rel=\"tooltip\" \n          src=\"";
							  if (stack1 = helpers.picture) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.picture; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" data-id=\"";
							  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" title=\"";
							  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\">\n      </a>\n    ";
							  return buffer;
							  }

							function program7(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n    <div class=\"pull-right demo\">\n      <a href=\"";
							  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "\" target=\"_blank\" class=\"btn btn-link\" data-bypass>Demo</a>\n    </div>\n    ";
							  return buffer;
							  }

							function program9(depth0,data) {
							  
							  var buffer = "", stack1, options;
							  buffer += "\n\n      ";
							  options = {hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data};
							  if (stack1 = helpers.isDashboardView) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isDashboardView; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n      ";
							  stack1 = helpers['if'].call(depth0, depth0.showActions, {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n\n    ";
							  return buffer;
							  }
							function program10(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n        ";
							  stack1 = helpers['if'].call(depth0, depth0.isAdminOrLeader, {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n      ";
							  return buffer;
							  }
							function program11(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n        <div class=\"pull-right remove\">\n          <a class=\"btn btn-link remove\">Remove</a>\n        </div>\n        <div class=\"pull-right edit\">\n          <a class=\"btn btn-link edit\" href=\"/projects/";
							  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "/edit\">Edit</a>\n        </div>\n        ";
							  return buffer;
							  }

							function program13(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n      <div class=\"pull-right contributor\">\n        ";
							  stack1 = helpers['if'].call(depth0, depth0.contributing, {hash:{},inverse:self.program(16, program16, data),fn:self.program(14, program14, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n      </div>\n      <div class=\"pull-right follower\">\n        ";
							  stack1 = helpers['if'].call(depth0, depth0.following, {hash:{},inverse:self.program(20, program20, data),fn:self.program(18, program18, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n      </div>\n      ";
							  return buffer;
							  }
							function program14(depth0,data) {
							  
							  
							  return "\n        <a class=\"btn btn-link leave\">Leave</a>\n        ";
							  }

							function program16(depth0,data) {
							  
							  
							  return "\n        <a class=\"btn btn-link join\">Join</a>\n        ";
							  }

							function program18(depth0,data) {
							  
							  
							  return "\n        <a class=\"btn btn-link unfollow\">Unfollow</a>\n        ";
							  }

							function program20(depth0,data) {
							  
							  
							  return "\n        <a class=\"btn btn-link follow\">Follow</a>\n        ";
							  }

							function program22(depth0,data) {
							  
							  var buffer = "", stack1, options;
							  buffer += "\n    ";
							  options = {hash:{},inverse:self.noop,fn:self.program(23, program23, data),data:data};
							  if (stack1 = helpers.isDashboardView) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isDashboardView; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n  ";
							  return buffer;
							  }
							function program23(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n      ";
							  stack1 = helpers['if'].call(depth0, depth0.isDashboardAdmin, {hash:{},inverse:self.noop,fn:self.program(24, program24, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n    ";
							  return buffer;
							  }
							function program24(depth0,data) {
							  
							  var buffer = "", stack1;
							  buffer += "\n\n        <div class=\"switcher tooltips\" data-placement=\"top\" data-original-title=\"Toggle visibility\">\n          <input type=\"checkbox\" ";
							  stack1 = helpers['if'].call(depth0, depth0.active, {hash:{},inverse:self.noop,fn:self.program(25, program25, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += " class=\"switch-small\">\n        </div>\n\n       ";
							  return buffer;
							  }
							function program25(depth0,data) {
							  
							  
							  return "checked";
							  }

							  buffer += "<div class=\"well\">\n  <div class=\"cover shadow\"> \n    ";
							  stack1 = helpers['if'].call(depth0, depth0.cover, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n  </div>\n  <div class=\"well-content\">\n    ";
							  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data};
							  if (stack1 = helpers.isSearchView) { stack1 = stack1.call(depth0, options); }
							  else { stack1 = depth0.isSearchView; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  if (!helpers.isSearchView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
							  if(stack1 || stack1 === 0) { buffer += stack1; }
							  buffer += "\n    <h4>";
							  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
							  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
							  buffer += escapeExpression(stack1)
							    + "</h4>\n    <br/>\n    ";
							  options = {hash:{},data:data};
							  stack2 = ((stack1 = helpers.markdown || depth0.markdown),stack1 ? stack1.call(depth0, depth0.description, options) : helperMissing.call(depth0, "markdown", depth0.description, options));
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n    <div id=\"contributors\">\n    ";
							  stack2 = helpers.each.call(depth0, depth0.contributors, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n    </div>\n  </div>\n  <div class=\"row-fluid footer-box\">\n    <div class=\"aging activity created_at\">\n      <i rel=\"tooltip\" title=\"";
							  options = {hash:{},data:data};
							  buffer += escapeExpression(((stack1 = helpers.timeAgo || depth0.timeAgo),stack1 ? stack1.call(depth0, depth0.created_at, options) : helperMissing.call(depth0, "timeAgo", depth0.created_at, options)))
							    + "\" class=\"tooltips icon-time icon-1\"></i>\n    </div>\n    <div class=\"activity people\">\n      "
							    + escapeExpression(((stack1 = ((stack1 = depth0.followers),stack1 == null || stack1 === false ? stack1 : stack1.length)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
							    + " \n      <a><i class=\"icon-heart\"></i></a>\n    </div>\n\n    ";
							  stack2 = helpers['if'].call(depth0, depth0.link, {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n\n    ";
							  options = {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data};
							  if (stack2 = helpers.isLoggedIn) { stack2 = stack2.call(depth0, options); }
							  else { stack2 = depth0.isLoggedIn; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
							  if (!helpers.isLoggedIn) { stack2 = blockHelperMissing.call(depth0, stack2, options); }
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n    \n  </div>\n\n  ";
							  options = {hash:{},inverse:self.noop,fn:self.program(22, program22, data),data:data};
							  if (stack2 = helpers.isLoggedIn) { stack2 = stack2.call(depth0, options); }
							  else { stack2 = depth0.isLoggedIn; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
							  if (!helpers.isLoggedIn) { stack2 = blockHelperMissing.call(depth0, stack2, options); }
							  if(stack2 || stack2 === 0) { buffer += stack2; }
							  buffer += "\n</div>\n";
							  return buffer;
							  })
							;
						}
					}
				},
				"templates": {
					"login.hbs.js": function (exports, module, require) {
						module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
						  this.compilerInfo = [4,'>= 1.0.0'];
						helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
						  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

						function program1(depth0,data) {
						  
						  var buffer = "", stack1, options;
						  buffer += "\n    <a href=\"/auth/"
						    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
						    + "\" class=\"btn btn-large signup-btn signup-"
						    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
						    + "\" data-bypass>\n      <i></i>Access with ";
						  options = {hash:{},data:data};
						  buffer += escapeExpression(((stack1 = helpers.firstUpper || depth0.firstUpper),stack1 ? stack1.call(depth0, depth0, options) : helperMissing.call(depth0, "firstUpper", depth0, options)))
						    + "\n    </a>\n    ";
						  return buffer;
						  }

						  buffer += "\n<div class=\"modal-header\">\n  <button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"close\">×</button>\n  <h3>Log in</h3>\n</div>\n<div class=\"row\">\n  <div class=\"span4 offset1\">\n    ";
						  stack1 = helpers.each.call(depth0, depth0.providers, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
						  if(stack1 || stack1 === 0) { buffer += stack1; }
						  buffer += "\n  </div>\n</div>";
						  return buffer;
						  })
						;
					}
				}
			}
		}
	}
})("client/app/index");
