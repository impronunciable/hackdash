
function setTitle(value){
  window.document.title = value;
}

function setDesc(value){
  var metaDesc = $('meta[name=description]', 'head');
  
  if (metaDesc.length === 0){
    metaDesc = $('<meta name="description" content="">');
    $('head').append(metaDesc);
  }

  metaDesc.prop('content', value);
}

module.exports = function(){

  return {

    title: function(value){
      var val = value ? value + ' - ' : '';
      setTitle(val + 'HackDash');
      return this;
    },

    desc: function(value){
      setDesc(value || '');
      return this;
    }

  };

};