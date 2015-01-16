var callbackIndex = 0;

module.exports = {

  fetch: function(url, callback) {
    var script = document.createElement('script'),
      cbProp = 'c' + callbackIndex;

    window.hackdashEmbed.jsonpCallbacks[ cbProp ] = function() {
      callback.apply(null, arguments);
      script.parentNode.removeChild( script );
      script = null;
      delete window.hackdashEmbed.jsonpCallbacks[ cbProp ];
    };

    script.type = 'text/javascript';
    script.src = url + '.jsonp?callback=hackdashEmbed.jsonpCallbacks.' + cbProp;
    document.body.insertBefore( script, document.body.firstChild );

    callbackIndex++;
  }

};