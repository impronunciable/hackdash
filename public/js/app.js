$(function(){

  $('.projects').masonry({
    itemSelector: '.project',
    columnWidth: function( containerWidth ) {
      return containerWidth / 4;
    }

  });
  $('.modal').modal({show: false});

  $('.join').click(function(e){
    e.preventDefault();
    var self = this;
    if(!window.username) window.location = 'http://local.host:3000/auth/twitter';
    $.get($(this).attr('href'), function(data){
      if(data == 1) {
        $(self).attr('href', $(self).attr('href').replace('join','leave'));
        $(self).text('Leave project');
      } else if(data == 2) {
        $(self).attr('href', $(self).attr('href').replace('leave','join'));
        $(self).text('Join project');
        $(self).parent().siblings('.users').children('li').each(function(){
          var src = $(this).find('span').text();
          src = src.substr(1);
          if(src ===  window.username) $(this).remove();
        });
      }
    });   
  });

  $('.edit').click(function(e){
    if(!window.username.length) window.location = 'http://local.host:3000/auth/twitter';
    e.preventDefault();
    $('#editProject').load($(this).attr('href'), function(){
      $('#editProject').modal('show');
    });
  });

  $('.read').click(function(e){
    if(!window.username.length) window.location = 'http://local.host:3000/auth/twitter';
    e.preventDefault();
    $(this).next().show();
    $(this).remove();
  });

  $('.accept,.decline').live('click', function(e){
    if(!window.username.length) window.location = 'http://local.host:3000/auth/twitter';
    e.preventDefault();
    var self = this;
    $.get($(this).attr('href'), function(){
      $(self).parents('tr').remove();
    });
  });

  $('.project').hover(function(){
    $(this).css('overflow', 'visible');
  }, function(){
    $(this).css('overflow', 'hidden');
  });
});
