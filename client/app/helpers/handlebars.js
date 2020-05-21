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

Handlebars.registerHelper('discourseUrl', function() {
  return window.hackdash.discourseUrl;
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

Handlebars.registerHelper('isEmbed', function(options) {
  if (window.hackdash.app.source === "embed"){
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
      $('.' + this.id).attr('src', '//avatars.io/' + user.provider + '/' + user.username);
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
        .css('background-image', 'url(//avatars.io/' + user.provider + '/' + user.username + ')');
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

Handlebars.registerHelper('__', function(key) {
  return window.__(key);
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
