/**
 * VIEW: Share Popover
 *
 */

/*jshint scripturl: true */

var template = require('./templates/sharer.hbs'),
  DashboardEmbed = require("./Dashboard/Share"),
  ProjectEmbed = require("./Project/Share");

var Sharer = module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: 'sharer-dialog',
  className: "sharer",
  template: template,

  events: {
    "click .embed": "showEmbed",
    "click .facebook": "showFBShare",
    "click .close": "destroy"
  },

  shareText: {
    dashboard: 'Hacking ',
    project: ''
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.type = (options && options.type) || '';
  },

  serializeData: function(){
    return _.extend({
      networks: this.getNetworks()
    }, (this.model && this.model.toJSON()) || {});
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  showEmbed: function(){
    var Share;

    switch(this.type){
      case 'dashboard': Share = DashboardEmbed; break;
      case 'project': Share = ProjectEmbed; break;
    }

    if (Share){
      hackdash.app.modals.show(new Share({
        model: this.model
      }));
    }

    this.destroy();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  enc: function(str){
    return window.encodeURI(str);
  },

  getTwitterLink: function(){
    var link = 'https://twitter.com/intent/tweet?'
      , people = ''
      , url = 'url=' + window.location.protocol + "//" + window.location.host
      , hashtags = 'hashtags='
      , text = 'text=';

    var domain = this.model.get('domain');
    var title = this.model.get('title');

    function getPeople(list){
      return _.map(list, function(user){

        if (hackdash.user && hackdash.user._id === user._id){
          // remove me
          return '';
        }

        if (user.provider === 'twitter'){
          return '@' + user.username;
        }
        else {
          return user.name;
        }

        return '';

      }).join(' ');
    }

    if (this.type === 'dashboard'){
      people = getPeople(this.model.get('admins').toJSON());
      url += '/dashboards/' + domain;
    }

    else if (this.type === 'project'){
      people = getPeople(this.model.get('contributors'));
      url += '/projects/' + this.model.get('_id');
    }

    hashtags += ['hackdash', domain].join(',');
    text += 'Hacking at ' + (title || domain) + ' via ' + people;

    link += this.enc(url) + '&' + this.enc(hashtags) + '&' + this.enc(text);
    return link;
  },

  showFBShare: function(e){
    e.preventDefault();

    var people = ''
      , url = '' + window.location.protocol + "//" + window.location.host
      , text = ''
      , picture = '';

    var domain = this.model.get('domain');
    var title = this.model.get('title');

    function getPeople(list){
      return _.map(list, function(user){

        if (hackdash.user && hackdash.user._id === user._id){
          // remove me
          return '';
        }

        return user.name;

      }).join(', ');
    }

    if (this.type === 'dashboard'){
      people = getPeople(this.model.get('admins').toJSON());

      var covers = this.model.get('covers');
      picture = url + ((covers && covers.length && covers[0]) || '/images/logohack.png');

      url += '/dashboards/' + domain;
    }

    else if (this.type === 'project'){
      people = getPeople(this.model.get('contributors'));

      var cover = this.model.get('cover');
      picture = url + (cover || '/images/logohack.png');

      url += '/projects/' + this.model.get('_id');
    }

    var textShort = 'Hacking at ' + (title || domain);
    text += textShort + ' via ' + people;
    text += ' ' + ['#hackdash', domain].join(' #');

    window.FB.ui({
      method: 'feed',
      name: textShort,
      link: url,
      picture: picture,
      caption: text
    }, function( response ) {
      console.log(response);
    });
  },

  getNetworks: function(){

    var networks = [{
      name: 'twitter',
      link: this.getTwitterLink()
    }];

    if (window.hackdash.fbAppId){
      networks.push({
        name: 'facebook'
      });
    }

    return networks.concat([{
      name: 'linkedin',
      link: 'http://linkedin.com'
    }, {
      name: 'google-plus',
      link: 'http://googleplus.com'
    }]);

  }

}, {

  show: function(el, options){

    var sharer = new Sharer(options);
    sharer.render();

    $('body').append(sharer.$el);

    var clickOutside = function(e){
      var $target = $(e.target);
      if ($target.hasClass('share') || $target.hasClass('fa-share-alt')){
        return;
      }

      var id = '#' + sharer.$el.get(0).id;

      if(!$target.closest(id).length && $(id).is(":visible")) {
        sharer.destroy();
      }
    };

    $('html').on('click', clickOutside);

    var $el = $(el),
      offset = $el.offset(),
      w = sharer.$el.width()/2 - $el.width()/2,
      h = sharer.$el.height()/2 - $el.height()/2;

    sharer.$el.css({
      top: offset.top - h,
      left: offset.left - w
    });

    sharer.on('close destroy', function(){
      sharer.$el.remove();
      $('html').off('click', clickOutside);
    });

    return sharer;
  }

});