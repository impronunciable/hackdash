
;(function(){

  var hd = window.hd = {};

  var routes = {}
    , request = superagent;

  var $projects = $('#projects')
    , $project = $('.project')
    , $newProject = $('#newProject')
    , $editProject = $('#editProject')
    , $logIn = $('#logIn')
    , $modals = $('.modal')
    , $searchInput = $('#searchInput')
    , $sort = $('.sort')
    , $cancel = $('.cancel')
    , $slogan = $('#slogan')
    , $follow = $('.follow')
    , $unfollow = $('.unfollow');

  var loadProjects = function(ctx, next) {
    request
    .get('/api/projects')
    .end(function(res){
      $projects.html(res.text);
      next();
    }); 
  };

  var loadSearchProjects = function(ctx, next) {
    request
    .get('/api/search?q=' + $searchInput.val())
    .end(function(res){
      $projects.html(res.text);
      next();
    }); 
  };

  var logIn = function(ctx, next) {
    $logIn.modal('show');
  };

  var isotopeDashboard = function() {
    $modals.modal('hide');
    if($projects.hasClass('isotope')) $projects.isotope('destroy');
    $projects.isotope({
        itemSelector: '.project'
      , animationEngine: 'jquery'
      , resizable: false
      , masonry: {
          columnWidth:  
            ($projects.width() >= 1200) ?
              300
            : 
            ($projects.width() == 960) ?
              $projects.width() / 3
            :
            ($projects.width() == 744) ?
              $projects.width() / 2
            :
              $projects.width()
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

  var createProject = function(ctx) {
    $newProject.modal('show');
  };

  var editProject = function(ctx) {
    superagent
    .get('/api/projects/edit/' + ctx.params.project_id)
    .end(function(res){
      $editProject.html(res.text);
      $editProject.modal('show');
    });
  };

  var removeProject = function(ctx) {
    superagent
    .get('/api/projects/remove/' + ctx.params.project_id)
    .end(function(res){
      page('/');
    });
  };

  var joinProject = function(ctx) {
    request
    .get('/api/projects/' + ctx.params.project_id + '/join')
    .end(function(res){
      page('/');
    });
  };

  var leaveProject = function(ctx) {
    request
    .get('/api/projects/' + ctx.params.project_id + '/join')
    .end(function(res){
      page('/');
    });
  };

  var projectInfo = function(ctx) {
    request
    .get('/api/p/' + ctx.params.project_id)
    .end(function(res){
      $projects.html(res.text);
    });

  };

  var followProject = function(e) {
    var self = this;

    request
    .get($(self).attr('href'))
    .end(function(res){
      $(self).parents('.project').html($(res.text).html());
    });

    e.preventDefault();
  };

  var unfollowProject = function(e) {
    var self = this;

    request
    .get($(self).attr('href'))
    .end(function(res){
      $(self).parents('.project').html($(res.text).html());
    });

    e.preventDefault();
  };

  page('/', loadProjects, isotopeDashboard);
  page('/login', logIn);
  page('/search', loadSearchProjects, isotopeDashboard);
  page('/projects/create', createProject);
  page('/projects/edit/:project_id', editProject);
  page('/projects/remove/:project_id', removeProject);
  page('/projects/:project_id/follow', followProject);
  page('/projects/:project_id/unfollow', unfollowProject);
  page('/p/:project_id', projectInfo);

  page();

  /*
   * Event listeners
   */
  $(window).smartresize(function(){
    $projects.isotope({
        masonry: {
          columnWidth:  
            ($projects.width() >= 1200) ?
              300
            : 
            ($projects.width() == 960) ?
              $projects.width() / 3
            :
            ($projects.width() == 744) ?
              $projects.width() / 2
            :
              $projects.width()
        }
    });
  });

  $sort.click(function(){
    var vid = $(this).attr('id');
    var asc = vid === 'name';
    $projects.isotope({'sortBy': vid, 'sortAscending': asc });
  });

  $modals.live('hidden', function(e){
    page('/');
  });

  $cancel.on('click', function(e){
    page('/');
    e.preventDefault();
  });

  $follow.live('click', followProject);
  $unfollow.live('click', unfollowProject);

  var forwho = ['for people','for geeks','for mutants','for your wife'];
  var i = 0;
  setInterval(function(){
    var rand = forwho[++i % forwho.length];
    $slogan.fadeOut('fast', function(){
      $(this).text(rand).fadeIn();
    });
  }, 5000);

})();
