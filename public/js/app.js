;(function(){

  var hd = window.hd = {};

  var routes = {}
    , request = superagent;

  var $projects = $('#projects')
    , $project = $('.project')
    , $ajaxForm = $('.ajaxForm')
    , $newProject = $('#newProject')
    , $editProject = $('#editProject')
    , $main = $('#main')
    , $fullProject = $('#fullProject')
    , $logIn = $('#logIn')
    , $modals = $('.modal')
    , $searchInput = $('#searchInput')
    , $formSearch = $('.formSearch')
    , $sort = $('.sort')
    , $tooltips = $('.tooltips')
    , $logo = $('h1 a')
    , $cancel = $('.cancel')
    , $slogan = $('#slogan')
    , $dragdrop = $('#dragdrop') 
    , $ghImportBtn = $('#ghImportBtn')
    , $searchGh = $('#searchGh')
    , masonryIsotope = {
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
      };

  /*
   * Route helpers
   */

  var loadProjects = function(ctx, next) {
    request
    .get('/api/projects')
    .end(function(res){
      $main.html(res.body.html);
      next();
    }); 
  };

  var loadSearchProjects = function(ctx, next) { 
    $searchInput.val(ctx.querystring.split('&')[0].replace('q=',''));
    request
    .get('/api/search?' + ctx.querystring)
    .end(function(res){ 
      $main.html(res.body.html);
      next();
    }); 
  };

  var logIn = function(ctx, next) {
    $logIn.modal('show');
  };

  var cleanSearch = function(ctx, next){
    $searchInput.val('');
    next();
  };

  var isotopeDashboard = function() {
    $('.tooltips').tooltip({});
    var $projects = $('#projects');

    $modals.modal('hide');
    if($projects.hasClass('isotope')) 
      $projects.isotope('destroy');

    $projects.imagesLoaded(function() {
      $('#projects').isotope({
          itemSelector: '.project'
        , animationEngine: 'jquery'
        , resizable: true
        , masonry: masonryIsotope
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
    });
  };

  var initSelect2 = function(){
    $('#status').select2({
      minimumResultsForSearch: 10
    });

    $('#tags').select2({
      tags:[],
      formatNoMatches: function(){ return ''; },
      maximumInputLength: 20,
      tokenSeparators: [","]
    });
  };

  var createProject = function(ctx) {
    $main.html($newProject.html());
    initSelect2();
    initImageDrop();

    $('.ajaxForm').ajaxForm({
      error: formError,
      success: formSuccess,
      resetForm: true,
      beforeSubmit: formValidate
    });

  };

  var editProject = function(ctx) {
    superagent
    .get('/api/projects/edit/' + ctx.params.project_id)
    .end(function(res){
    $('.tooltip').remove();
      $main.html(res.body.html);
      initSelect2();
      initImageDrop();

      $('.ajaxForm').ajaxForm({
        error: formError,
        success: formSuccess,
        resetForm: true,
        beforeSubmit: formValidate
      });

    });
  };

  var removeProject = function(ctx) {
    if (window.confirm("This action will remove the project. Are you sure?")){
      superagent
        .get('/api/projects/remove/' + ctx.params.project_id)
        .end(function(res){
          page('/');
        });
    }
    else 
      page('/');
  };

  var joinProject = function(ctx) {
    request
    .get('/api/projects/join/' + ctx.params.project_id)
    .end(function(res){
      page('/');
    });
  };

  var leaveProject = function(ctx) {
    request
    .get('/api/projects/leave/' + ctx.params.project_id)
    .end(function(res){
      page('/');
    });
  };

  var projectInfo = function(ctx) {
    request
    .get('/api/p/' + ctx.params.project_id)
    .end(function(res){
      $main.html(res.body.html);
      $('.tooltips').tooltip({});
    });
  };

  var followProject = function(ctx) {
    request
    .get('/api/projects/follow/' + ctx.params.project_id)
    .end(function(res){
      page('/');
    });
  };

  var unfollowProject = function(ctx) {
    request
    .get('/api/projects/unfollow/' + ctx.params.project_id)
    .end(function(res){
      page('/');
    });
  };

  var getMyProfile = function() {
    request
    .get('/api/users/profile')
    .end(function(res){
      $main.html(res.body.html);
      $('.ajaxForm').ajaxForm({
        error: formError,
        success: formSuccess,
        resetForm: true,
        beforeSubmit: formValidate
      });
    });
  };

  var getUserProfile = function(ctx) {
    request
    .get('/api/users/' + ctx.params.user_id)
    .end(function(res){
      $main.html(res.body.html);
    });
  };

  var personaLogin = function() {
    navigator.id.get(function(assertion) {
      if (assertion) {
        request
        .post('/auth/persona')
        .send({'assertion':assertion})
        .end(function(res){
          location.href = location.href.replace('auth/persona', '');
        });
      } else {
        location.reload();
      }
    });
  };


  page('/', loadProjects, cleanSearch, isotopeDashboard);
  page('/login', logIn);
  page('/search', loadSearchProjects, isotopeDashboard);
  page('/projects/create', createProject);
  page('/projects/edit/:project_id', editProject);
  page('/projects/remove/:project_id', removeProject);
  page('/projects/follow/:project_id', followProject);
  page('/projects/unfollow/:project_id', unfollowProject);
  page('/projects/join/:project_id', joinProject);
  page('/projects/leave/:project_id', leaveProject);
  page('/users/profile', getMyProfile);
  page('/users/:user_id', getUserProfile);
  page('/p/:project_id', projectInfo);
  page('/auth/persona', personaLogin);

  page();

  /*
   * Event listeners
   */

  $(window).smartresize(function(){
    $projects.isotope({
      masonry: masonryIsotope
    });
  });

  $main.on('click','.cancel', function(e){
    page('/');
    e.preventDefault();
  });

  var getRequiredFields = function(){
    return {
      title: $('[name=title]'),
      description: $('[name=description]')
    };
  };

  var cleanErrors = function(){
    var fields = getRequiredFields();

    _.each(fields, function(field){
      field.parents('.control-group').removeClass('error');
      field.next('span.help-inline').remove();
    });
  };

  var formError = function(field) {
    cleanErrors();
    var fields = getRequiredFields();

    if (field){
      fields[field].parents('.control-group').addClass('error');
      fields[field].after('<span class="help-inline">Required</span>');
    }
  };

  var formSuccess = function(){
    cleanErrors();
    $dragdrop.css('background', 'none').children('input').show(); 
    page('/');
  };
  
  var formValidate = function(arr, $form, options){
    for(var i = 0; i < arr.length; i++) {
      if(arr[i]['name'] === "title" && !arr[i].value.length) {
        formError("title");
        return false;
      } else if(arr[i]['name'] === "description" && !arr[i].value.length) {
        formError("description");
        return false;  
      }
    }
  
    if(cover_path)
      arr.push({name: 'cover', 'value': cover_path});
  };

  var fillGhProjectForm = function(project, $form) {
    $form.find('input[name=title]').val(project.name);
    $form.find('textarea[name=description]').text(project.description);
    $form.find('input[name=link]').val(project.html_url);
    $form.find('#tags').select2("data", [{id: project.language,
text:project.language}]);
    $form.find('#status').select2("val", "building");
  };

  $modals.live('hidden', function(){
    page('/');
  });

  $searchInput.on('keyup', function(e){
    $(this).parents('form').submit();
  });

  $formSearch.submit(function(e){
    page('/search?q=' + $searchInput.val() + '&type=title');
    e.preventDefault();
  });

  $project.live('click', function(e){
    $('.tooltip').remove();
    if($(e.target).hasClass('avatar')) {
      page('/users/' + $(e.target).data('id'));
    } else if(e.target.tagName !== 'A' && e.target.tagName !== 'SPAN'  && $(this).data('id')) {
      page('/p/' + $(this).data('id'));
    }
  });

  $ghImportBtn.live('click', function(e){
    $(this).next().removeClass('hidden');
    e.preventDefault();
  });

  $searchGh.live('click', function(e){
    var self = this;
    var repo = $(this).prev().val();
    if(repo.length) {
      request
      .get('https://api.github.com/repos/' + repo)
      .end(function(res){
        fillGhProjectForm(res.body, $(self).parents('#page').find('form'));
      });
    }
    e.preventDefault();
  });

  $logo.click(function(){
    page.stop();
  });
  
  var cover_path = null;

  function initImageDrop(){
    var $dragdrop = $('#dragdrop');
    var input = $('#cover_fall', $dragdrop);

    input.on('click', function(e){
      e.stopPropagation();
    });

    $dragdrop.on('click', function(e){
      input.click();
      e.preventDefault();
      return false;
    });

    $dragdrop.filedrop({
      fallback_id: 'cover_fall',
      url: '/api/cover',
      paramname: 'cover',
      allowedfiletypes: ['image/jpeg','image/png','image/gif'],
      maxfiles: 1,
      maxfilesize: 3,
      dragOver: function () {
        $dragdrop.css('background', 'rgb(226, 255, 226)');
      },
      dragLeave: function () {
        $dragdrop.css('background', 'rgb(241, 241, 241)');
      },
      drop: function () {
        $dragdrop.css('background', 'rgb(241, 241, 241)');
      },
      uploadFinished: function(i, file, res, time) {
        cover_path = res.href;
        $dragdrop
          .css('background', 'url('+res.href+') center center')
          .css('background-size', '100% 100%')
          .children('p').hide();
      }
    });
  }

})();
