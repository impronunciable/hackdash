$(function(){

  $('.modal').modal({show: false});

  $('.join').click(function(e){
    e.preventDefault();
    var self = this;

    $.get($(this).attr('href'), function(data){
      if(data == 1) {
        $(self).attr('href', $(self).attr('href').replace('join','leave'));
        $(self).text('Leave project');
      } else if(data == 2) {
        $(self).attr('href', $(self).attr('href').replace('leave','join'));
        $(self).text('Join project');
      }
    });   
  });

  $('.edit').click(function(e){
    e.preventDefault();
    $('#editProject').load($(this).attr('href'), function(){
      $('#editProject').modal('show');
    });
  });

});
