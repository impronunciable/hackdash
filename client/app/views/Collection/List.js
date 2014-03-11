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