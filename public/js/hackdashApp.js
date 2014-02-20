/*! 
* Hackdash - v0.0.1
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

				var 
				    Header = require('./views/Header')
				  , Projects = require('./models/Projects')
				  , ProjectsView = require('./views/Projects');

				module.exports = function(type){

				  var app = module.exports = new Backbone.Marionette.Application();

				  app.addRegions({
				    header: "header",
				    main: "#main"
				  });

				  function initISearch() {
				  
				    app.projects = new Projects();
				    
				    app.header.show(new Header());

				    app.main.show(new ProjectsView({
				      collection: app.projects
				    }));

				    var query = hackdash.getQueryVariable("q");
				    if (query && query.length > 0){
				      app.projects.fetch({ data: $.param({ q: query }) });
				    }

				  }

				  function initDashboard() {
				  
				    app.projects = new Projects();

				    app.header.show(new Header());

				    app.main.show(new ProjectsView({
				      collection: app.projects
				    }));

				    var query = hackdash.getQueryVariable("q");
				    if (query && query.length > 0){
				      app.projects.fetch({ data: $.param({ q: query }) });
				    }
				    else {
				      app.projects.fetch(); 
				    }

				  }

				  switch(type){
				    case "dashboard": 
				      app.addInitializer(initDashboard);
				      break;
				    case "isearch":
				      app.addInitializer(initISearch);
				      break;
				  }

				  window.hackdash.app = app;
				  window.hackdash.app.type = type;
				  window.hackdash.app.start();

				};
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

				   // Init Handlebars Helpers
				  require('./helpers/handlebars');
				  
				  //require('./helpers/backboneOverrides');
				  //require('./helpers/jQueryOverrides');
				  
				  window.hackdash.apiURL = "/api/v2";

				  window.hackdash.startApp = require('./HackdashApp');
				};
			},
			"helpers": {
				"handlebars.js": function (exports, module, require) {
					/**
					 * HELPER: Handlebars Template Helpers
					 * 
					 */
					
					Handlebars.registerHelper('markdown', function(md) {
					  return markdown.toHTML(md);
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
				"Project.js": function (exports, module, require) {
					/**
					 * MODEL: Project
					 *
					 */

					module.exports = Backbone.Model.extend({

					  idAttribute: "_id",

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

					module.exports = Backbone.Collection.extend({

					  model: Project,

					  idAttribute: "_id",
					  
					  url: function(){
					    return hackdash.apiURL + '/projects'; 
					  },

					});

				}
			},
			"views": {
				"DashboardDetails.js": function (exports, module, require) {
					/**
					 * VIEW: DashboardHeader Layout
					 * 
					 */

					var 
					    template = require('./templates/dashboardDetails.hbs');

					module.exports = Backbone.Marionette.ItemView.extend({

					  //--------------------------------------
					  //+ PUBLIC PROPERTIES / CONSTANTS
					  //--------------------------------------

					  template: template

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
				"Header.js": function (exports, module, require) {
					
					var 
					    template = require('./templates/header.hbs')
					  , Search = require('./Search')
					  , DashboardDetails = require('./DashboardDetails');

					module.exports = Backbone.Marionette.Layout.extend({

					  //--------------------------------------
					  //+ PUBLIC PROPERTIES / CONSTANTS
					  //--------------------------------------

					  className: "container",
					  template: template,

					  regions: {
					    "search": ".search-ctn",
					    "dashboard": ".dashboard-ctn"
					  },

					  //--------------------------------------
					  //+ INHERITED / OVERRIDES
					  //--------------------------------------

					  onRender: function(){
					    this.search.show(new Search({
					      showSort: true
					    }));

					    this.dashboard.show(new DashboardDetails({
					      model: new Backbone.Model({

					      })
					    }));

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
				"Project.js": function (exports, module, require) {
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

					  events: {
					    "click .contributor a": "onContribute",
					    "click .follower a": "onFollow",
					    "click .remove a": "onRemove",
					    "click .demo a": "onDemo"
					  },

					  templateHelpers: {
					    instanceURL: function(){
					      return "http://" + this.domain + "." + hackdash.baseURL;
					    },
					    showActions: function(){
					      return hackdash.user._id !== this.leader;
					    },
					    isAdminOrLeader: function(){
					      var user = hackdash.user;
					      return user._id === this.leader || user.admin_in.indexOf(this.domain) >= 0;
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
					      })
					      .tooltip({});

					    $('.tooltips', this.$el).tooltip({});

					    var url = "http://" + this.model.get("domain") + "." + hackdash.baseURL + 
					      "/p/" + this.model.get("_id");

					    this.$el.on("click", function(){
					      window.location = url;
					    });
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

					  onDemo: function(e){
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
				"Projects.js": function (exports, module, require) {
					/**
					 * VIEW: Projects of an Instance
					 * 
					 */

					var Project = require('./Project');

					module.exports = Backbone.Marionette.CollectionView.extend({

					  //--------------------------------------
					  //+ PUBLIC PROPERTIES / CONSTANTS
					  //--------------------------------------

					  id: "projects",
					  className: "row projects",
					  itemView: Project,
					  
					  collectionEvents: {
					    "reset remove": "render",
					    "sort:date": "sortByDate",
					    "sort:name": "sortByName"
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

					  sortByName: function(){
					    this.$el.isotope({"sortBy": "name"});
					  },

					  sortByDate: function(){
					    this.$el.isotope({"sortBy": "date"});
					  },

					  isotopeInitialized: false,
					  updateIsotope: function(){
					    var $projects = this.$el;
					    var self = this;

					    $projects.imagesLoaded(function() {

					      if (this.isotopeInitialized){
					        $projects.isotope("destroy");
					      }

					      $projects.isotope({
					          itemSelector: ".project"
					        , animationEngine: "jquery"
					        , resizable: true
					        , masonry: { columnWidth: self.projectColumnWidth() }
					        , sortAscending: true
					        , getSortData : {
					            "name" : function ( $elem ) {
					              return $elem.data("name").toLowerCase();
					            },
					            "date" : function ( $elem ) {
					              return $elem.data("date");
					            }
					          }
					        , sortBy: "name"
					      });
					      
					      this.isotopeInitialized = true;
					    });
					  },

					  projectColumnWidth: function () {
					    var $projects = this.$el;
					    
					    return ($projects.width() >= 1200) ? 
					            300
					          :
					          ($projects.width() === 960) ?
					            $projects.width() / 3
					          :
					          ($projects.width() === 744) ?
					            $projects.width() / 2
					          :
					            $projects.width();
					  }

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
					    hackdash.app.projects.trigger("sort:" + val);
					  },

					  search: function(){
					    var self = this;
					    window.clearTimeout(this.timer);

					    this.timer = window.setTimeout(function(){
					      var keyword = self.ui.searchbox.val();

					      if (keyword !== self.lastSearch) {
					        self.lastSearch = keyword;

					        var opts = {
					          reset: true
					        };

					        if (keyword.length > 0) {
					          opts.data = $.param({ q: keyword });
					          
					          var baseURL = (hackdash.app.type === "isearch" ? "isearch" : "search");
					          window.history.pushState({}, "", baseURL + "?q=" + keyword);

					          hackdash.app.projects.fetch(opts);
					        }
					        else {
					          if (hackdash.app.type === "isearch"){
					            hackdash.app.projects.reset();
					          }
					          else {
					            hackdash.app.projects.fetch();
					          }
					          window.history.pushState({}, "", hackdash.app.type === "isearch" ? "isearch" : "");
					        }
					      }
					      
					    }, 300);
					  }

					  //--------------------------------------
					  //+ PRIVATE AND PROTECTED METHODS
					  //--------------------------------------

					});
				},
				"templates": {
					"dashboardDetails.hbs.js": function (exports, module, require) {
						module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
						  this.compilerInfo = [4,'>= 1.0.0'];
						helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
						  


						  return "<h1>Dashboard Title</h1>\n<p class=\"lead\">dashboard description asjnd akjsdnaskjdnaskj dnask jdnas dkjnas dkjans dkjas dnksaj dnas kjdnasd kjsn adkjs adnkasj nd askjndaskjasdn kjas dnasd kjnas dkjsn adkjasd njk asdn</p>";
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
						    + "?s=50\" rel=\"tooltip\" data-placement=\"bottom\" data-original-title=\"Edit profile\">\n  </a>  \n  <a class=\"btn logout\" href=\"/logout\">Logout</a>\n  ";
						  return buffer;
						  }

						function program3(depth0,data) {
						  
						  var buffer = "", stack1, options;
						  buffer += "\n  <div class=\"dashboard-ctn\"></div>\n\n  ";
						  options = {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),data:data};
						  if (stack1 = helpers.isLoggedIn) { stack1 = stack1.call(depth0, options); }
						  else { stack1 = depth0.isLoggedIn; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
						  if(stack1 || stack1 === 0) { buffer += stack1; }
						  buffer += "\n";
						  return buffer;
						  }
						function program4(depth0,data) {
						  
						  
						  return "\n  <a class=\"btn btn-large\" href=\"/projects/create\">New Project</a>\n  ";
						  }

						function program6(depth0,data) {
						  
						  
						  return "\n  <a class=\"btn btn-large\" href=\"/login\">Login to create a project</a>\n  ";
						  }

						  buffer += "<div class=\"search-ctn\"></div>\n\n<div class=\"createProject pull-right btn-group\">\n  ";
						  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
						  if (stack1 = helpers.isLoggedIn) { stack1 = stack1.call(depth0, options); }
						  else { stack1 = depth0.isLoggedIn; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  if (!helpers.isLoggedIn) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
						  if(stack1 || stack1 === 0) { buffer += stack1; }
						  buffer += "\n</div>\n\n<a class=\"logo\" href=\"/\"></a>\n\n";
						  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data};
						  if (stack1 = helpers.isDashboardView) { stack1 = stack1.call(depth0, options); }
						  else { stack1 = depth0.isDashboardView; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  if (!helpers.isDashboardView) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
						  if(stack1 || stack1 === 0) { buffer += stack1; }
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
						  buffer += "\n    <img src=\"";
						  if (stack1 = helpers.cover) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.cover; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\" alt=\"";
						  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\"/>\n    ";
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
						  buffer += "\n      <img class=\"avatar tooltips\" rel=\"tooltip\" \n        src=\"";
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
						    + "\">\n    ";
						  return buffer;
						  }

						function program7(depth0,data) {
						  
						  var buffer = "", stack1;
						  buffer += "\n    <div class=\"pull-right demo\">\n      <a href=\"";
						  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\" target=\"_blank\" class=\"btn btn-link\">Demo</a>\n    </div>\n    ";
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
						  buffer += "\n        <div class=\"pull-right remove\">\n          <a class=\"btn btn-link remove\">Remove</a>\n        </div>\n        <div class=\"pull-right edit\">\n          <a class=\"btn btn-link edit\" href=\"/projects/edit/";
						  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0._id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\">Edit</a>\n        </div>\n        ";
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
						  buffer += "\n    ";
						  stack2 = helpers.each.call(depth0, depth0.contributors, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
						  if(stack2 || stack2 === 0) { buffer += stack2; }
						  buffer += "\n  </div>\n  <div class=\"row-fluid footer-box\">\n    <div class=\"aging activity created_at\">\n      <i rel=\"tooltip\" title=\"";
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
						  buffer += "\n    \n  </div>\n</div>\n";
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
						  
						  
						  return "\n<div class=\"orderby\">\n  <div class=\"btn-group\">\n    <button data-option-value=\"name\" class=\"sort btn\">Order by name</button>\n    <button data-option-value=\"date\" class=\"sort btn\">Order by date</button>\n  </div>\n</div>\n";
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
			}
		}
	}
})("client/app/index");
