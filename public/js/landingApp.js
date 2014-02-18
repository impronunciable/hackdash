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
			"App.js": function (exports, module, require) {
				/**
				 * Landing Application
				 *
				 */

				var 
				    Search = require('./views/Search')
				  , Projects = require('./models/Projects')
				  , ProjectsView = require('./views/Projects');

				var app = module.exports = new Backbone.Marionette.Application();

				app.addInitializer( function () {

				  app.addRegions({
				    leftHeader: "div#left-header",
				    main: "#main"
				  });

				  app.projects = new Projects();
				  
				  app.leftHeader.show(new Search());
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

				});
			},
			"Initializer.js": function (exports, module, require) {
				
				module.exports = function(){

				  // Init Handlebars Helpers
				  require('./helpers/handlebars');

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

				  //require('./helpers/backboneOverrides');
				  //require('./helpers/jQueryOverrides');
				  
				  window.hackdash.apiURL = "/api/v2";

				  window.hackdash.app = require('./App');
				  window.hackdash.app.start();
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
					
					Handlebars.registerHelper('isLoggedIn', function() {
					  return window.hackdash.user ? true : false;
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
					    "click .follower a": "onFollow"
					  },

					  templateHelpers: {
					    instanceURL: function(){
					      return "http://" + this.domain + "." + hackdash.baseURL;
					    },
					    showActions: function(){
					      var show = false;

					      if (hackdash.user){
					        show = true;

					        if (hackdash.user._id === this.leader){
					          show = false;
					        }
					      }

					      return show;
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
					    "reset": "render"
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

					  updateIsotope: function(){
					    var $projects = this.$el;
					    var self = this;

					    $projects.imagesLoaded(function() {
					      $projects.isotope('destroy').isotope({
					          itemSelector: '.project'
					        , animationEngine: 'jquery'
					        , resizable: true
					        , masonry: { columnWidth: self.projectColumnWidth() }
					        /*
					        , sortAscending: true
					        , getSortData : {
					            'name' : function ( $elem ) {
					              return $elem.data('name').toLowerCase();
					            },
					            'date' : function ( $elem ) {
					              return $elem.data('date');
					            }
					          }
					        , sortBy: 'name'
					        */
					      });
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
					    "keyup #searchInput": "search"
					  },

					  //--------------------------------------
					  //+ INHERITED / OVERRIDES
					  //--------------------------------------

					  onRender: function(){
					    var query = hackdash.getQueryVariable("q");
					    if (query && query.length > 0){
					      this.ui.searchbox.val(query);
					    }
					  },

					  //--------------------------------------
					  //+ PUBLIC METHODS / GETTERS / SETTERS
					  //--------------------------------------

					  //--------------------------------------
					  //+ EVENT HANDLERS
					  //--------------------------------------

					  search: function(){
					    var self = this;
					    window.clearTimeout(this.timer);

					    this.timer = window.setTimeout(function(){
					      var keyword = self.ui.searchbox.val();

					      var opts = {
					        reset: true
					      };

					      if (keyword.length > 0) {
					        opts.data = $.param({ q: keyword });
					        window.history.pushState({}, "", "isearch?q=" + keyword);
					      }
					      else {
					        window.history.pushState({}, "", "isearch");
					      }

					      hackdash.app.projects.fetch(opts);
					    }, 300);
					  }

					  //--------------------------------------
					  //+ PRIVATE AND PROTECTED METHODS
					  //--------------------------------------

					});
				},
				"templates": {
					"project.hbs.js": function (exports, module, require) {
						module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
						  this.compilerInfo = [4,'>= 1.0.0'];
						helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
						  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

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
						  buffer += "\n      <img class=\"avatar tooltips\" rel=\"tooltip\" \n        src=\"";
						  if (stack1 = helpers.picture) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.picture; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\" data-id=\"";
						  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\" title=\"";
						  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\">\n    ";
						  return buffer;
						  }

						function program5(depth0,data) {
						  
						  var buffer = "", stack1;
						  buffer += "\n    <div class=\"pull-right edit\">\n      <a href=\"";
						  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.link; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\" target=\"_blank\" class=\"btn btn-link\">Demo</a>\n    </div>\n    ";
						  return buffer;
						  }

						function program7(depth0,data) {
						  
						  var buffer = "", stack1;
						  buffer += "\n    <div class=\"pull-right contributor\">\n      ";
						  stack1 = helpers['if'].call(depth0, depth0.contributing, {hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),data:data});
						  if(stack1 || stack1 === 0) { buffer += stack1; }
						  buffer += "\n    </div>\n    <div class=\"pull-right follower\">\n      ";
						  stack1 = helpers['if'].call(depth0, depth0.following, {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),data:data});
						  if(stack1 || stack1 === 0) { buffer += stack1; }
						  buffer += "\n    </div>\n    ";
						  return buffer;
						  }
						function program8(depth0,data) {
						  
						  
						  return "\n      <a class=\"btn btn-link leave\">Leave</a>\n      ";
						  }

						function program10(depth0,data) {
						  
						  
						  return "\n      <a class=\"btn btn-link join\">Join</a>\n      ";
						  }

						function program12(depth0,data) {
						  
						  
						  return "\n      <a class=\"btn btn-link unfollow\">Unfollow</a>\n      ";
						  }

						function program14(depth0,data) {
						  
						  
						  return "\n      <a class=\"btn btn-link follow\">Follow</a>\n      ";
						  }

						  buffer += "<div class=\"well\">\n  <div class=\"cover shadow\"> \n    ";
						  stack1 = helpers['if'].call(depth0, depth0.cover, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
						  if(stack1 || stack1 === 0) { buffer += stack1; }
						  buffer += "\n  </div>\n  <div class=\"well-content\">\n    <h3><a href=\"";
						  if (stack1 = helpers.instanceURL) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.instanceURL; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "\">";
						  if (stack1 = helpers.domain) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.domain; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "</a></h3>\n    <h4>";
						  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
						  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
						  buffer += escapeExpression(stack1)
						    + "</h4>\n    <br/>\n    ";
						  options = {hash:{},data:data};
						  stack2 = ((stack1 = helpers.markdown || depth0.markdown),stack1 ? stack1.call(depth0, depth0.description, options) : helperMissing.call(depth0, "markdown", depth0.description, options));
						  if(stack2 || stack2 === 0) { buffer += stack2; }
						  buffer += "\n    ";
						  stack2 = helpers.each.call(depth0, depth0.contributors, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
						  if(stack2 || stack2 === 0) { buffer += stack2; }
						  buffer += "\n  </div>\n  <div class=\"row-fluid footer-box\">\n    <div class=\"aging activity created_at\">\n      <i rel=\"tooltip\" title=\"";
						  options = {hash:{},data:data};
						  buffer += escapeExpression(((stack1 = helpers.timeAgo || depth0.timeAgo),stack1 ? stack1.call(depth0, depth0.created_at, options) : helperMissing.call(depth0, "timeAgo", depth0.created_at, options)))
						    + "\" class=\"tooltips icon-time icon-1\"></i>\n    </div>\n    <div class=\"activity people\">\n      "
						    + escapeExpression(((stack1 = ((stack1 = depth0.followers),stack1 == null || stack1 === false ? stack1 : stack1.length)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
						    + " \n      <a><i class=\"icon-heart\"></i></a>\n    </div>\n\n    ";
						  stack2 = helpers['if'].call(depth0, depth0.link, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
						  if(stack2 || stack2 === 0) { buffer += stack2; }
						  buffer += "\n\n    ";
						  stack2 = helpers['if'].call(depth0, depth0.showActions, {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
						  if(stack2 || stack2 === 0) { buffer += stack2; }
						  buffer += "\n  </div>\n</div>\n";
						  return buffer;
						  })
						;
					},
					"search.hbs.js": function (exports, module, require) {
						module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
						  this.compilerInfo = [4,'>= 1.0.0'];
						helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
						  var buffer = "", stack1, self=this;

						function program1(depth0,data) {
						  
						  
						  return "\n<div class=\"orderby\">\n  <div class=\"btn-group\">\n    <button data-option-value=\"name\" class=\"sort btn\">Order by name</button>\n    <button data-option-value=\"date\" class=\"sort btn\">Order by date</button>\n  </div>\n</div>\n";
						  }

						  buffer += "<i class=\"icon-large icon-search\"></i>\n<input id=\"searchInput\" type=\"text\" class=\"search-query input-large\"/>\n";
						  stack1 = helpers['if'].call(depth0, depth0.showSort, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
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
