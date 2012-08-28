$(function(){

  $projects = $('#projects');

  $projects.isotope({
    itemSelector: '.project'
    , animationEngine: 'jquery'
    , resizable: false
    , masonry: {
      columnWidth: $projects.width() / 4
    },  getSortData : {
      date : function ( $elem ) {
        return $elem.attr('data-date');
    }, name : function ( $elem ) {
        return $elem.attr('data-name');
    }, contribs : function ( $elem ) {
        return $elem.attr('data-contribs');
    }

  }});

$(window).smartresize(function(){
  $projects.isotope({
    masonry: { columnWidth: $projects.width() / 4 }
  });
});


$('#newProject').click(function(){if(!window.username.length) window.location="http://hackdash.hhba.info/auth/twitter"; })

  $('.modal').modal({show: false});

  $('.join').click(function(e){
    e.preventDefault();
    var self = this;
    if(!window.username.length) window.location = 'http://hackdash.hhba.info/auth/twitter';
    $.get($(this).attr('href'), function(data){
      if(data == 1) {
        $(self).removeAttr('href');
        $(self).text('Pendiente de aprobación');
      } else if(data == 2) {
        $(self).attr('href', $(self).attr('href').replace('leave','join'));
        $(self).text('Unirse al proyecto');
        $(self).parent().siblings('.users').children('li').each(function(){
          var src = $(this).find('span').text();
          src = src.substr(1);
          if(src ===  window.username) $(this).remove();
        });
      }
    });   
  });

  $('.edit').click(function(e){
    if(!window.username.length) window.location = 'http://hackdash.hhba.info/auth/twitter';
    e.preventDefault();
    $('#editProject').load($(this).attr('href'), function(){
      $('#editProject').modal('show');
    });
  });

  $('.read').click(function(e){
    if(!window.username.length) window.location = 'http://hackdash.hhba.info/auth/twitter';
    e.preventDefault();
    $(this).next().show();
    $(this).remove();
  });

  $('.accept,.decline').live('click', function(e){
    if(!window.username.length) window.location = 'http://hackdash.hhba.info/auth/twitter';
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

  $('.sort').click(function(){
    var vid = $(this).attr('id');
    var asc = vid === 'name';
    $('.projects').isotope({'sortBy': vid, 'sortAscending': asc });
  });

  twttr.anywhere(function (T) {
    T('.users a').hovercards({linkify: false});
  });

});
