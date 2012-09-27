
;(function(){

  var hd = window.hd = {
  };

  var routes = {}
    , request = superagent;

  var $projects = $('#projects')
    , $editProject = $('#editProject')
    , $modals = $('.modal')
    , $searchInput = $('#searchInput');

  var loadProjects = function(ctx, next) {
    request
    .get('/projects')
    .end(function(res){
      $projects.html(res.text);
      next();
    }); 
  };

  var loadSearchProjects = function(ctx, next) {
    request
    .get('/search?q=' + $searchInput.val())
    .end(function(res){
      $projects.html(res.text);
      next();
    }); 
  };

  var isotopeDashboard = function() {
    $modals.modal('hide');
    if($projects.hasClass('isotope')) $projects.isotope('destroy');
    $projects.isotope({
        itemSelector: '.project'
      , animationEngine: 'jquery'
      , resizable: false
      , masonry: {
          columnWidth: $projects.width() / 4
        }
      , getSortData : {
            date : function ( $elem ) {
              return $elem.attr('data-date');
            }  
          , name : function ( $elem ) {
              return $elem.attr('data-name');
            }
          , contribs : function ( $elem ) {
              return $elem.attr('data-contribs');
            }
        }
    });
  };

  var editProject = function(ctx) {
    superagent
    .get('/projects/edit/' + ctx.params.project_id)
    .end(function(res){
      $editProject.html(res.text);
      $editProject.modal('show');
    });
  };

  var removeProject = function(ctx) {
    superagent
    .get('/projects/remove/' + ctx.params.project_id)
    .end(function(res){
      page('/');
    });
  };

  page('/', loadProjects, isotopeDashboard);
  page('/search', loadSearchProjects, isotopeDashboard);
  page('/projects/edit/:project_id', editProject);
  page('/projects/remove/:project_id', removeProject);
  page();

  $(window).smartresize(function(){
    $projects.isotope({
      masonry: { columnWidth: $projects.width() / 4 }
    });
  });

})();


/*

$('#newProject').click(function(){if(!window.username.length) window.location="http://local.host:3000/auth/twitter"; })

  $('.modal').modal({show: false});

  $('.join').click(function(e){
    e.preventDefault();
    var self = this;
    if(!window.username.length) window.location = 'http://local.host:3000/auth/twitter';
    $.get($(this).attr('href'), function(data, state, res){
      data = parseInt(res.responseText);
      if(data == 1) {
        $(self).attr('href', $(self).attr('href').replace('join', 'leave'));
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

  $('.sort').click(function(){
    var vid = $(this).attr('id');
    var asc = vid === 'name';
    $('.projects').isotope({'sortBy': vid, 'sortAscending': asc });
  });

  twttr.anywhere(function (T) {
    T('.users a').hovercards({linkify: false});
  });

!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

*/
