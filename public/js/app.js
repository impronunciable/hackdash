$(function(){

  $('.modal').modal({show: false});

  $('.join').click(function(e){
    e.preventDefault();
    var self = this;

    $.get($(this).attr('href'), function(data){
      if(data == 1) {
        $(self).attr('href', $(self).attr('href').replace('join','leave'));
        $(self).text('Leave project');
        $(self).parent().siblings('.users').append('<li><a href="https://twitter.com/"'+window.username+'><img src="http://avatars.io/twitter/'+ window.username +'" />@'+window.user+'</a></li>'); 
      } else if(data == 2) {
        $(self).attr('href', $(self).attr('href').replace('leave','join'));
        $(self).text('Join project');
        $(self).parent().siblings('.users').children('li').each(function(){
          var src = $(this).find('img').attr('src');
          src = src.split('/');
          src = src[src.length - 1];
          console.log(src);
          if(src ===  window.username) $(this).remove();
        });
      }
    });   
  });

  $('.edit').click(function(e){
    e.preventDefault();
    $('#editProject').load($(this).attr('href'), function(){
      $('#editProject').modal('show');
    });
  });

  $('.read').click(function(e){
    e.preventDefault();

    $(this).next().show();
    $(this).remove();
    
  });

});
