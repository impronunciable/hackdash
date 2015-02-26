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

Handlebars.registerHelper('getProfileImageHex', function(user) {

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
});
