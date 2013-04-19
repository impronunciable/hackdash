;(function(){

  var hd = window.hd = {};

  var routes = {}
    , request = superagent;

  var $projects = $('#projects')
    , $project = $('.project')
    , $ajaxForm = $('.ajaxForm')
    , $newProject = $('#newProject')
    , $editProject = $('#editProject')
    , $fullProject = $('#fullProject')
    , $logIn = $('#logIn')
    , $modals = $('.modal')
    , $searchInput = $('#searchInput')
    , $formSearch = $('.formSearch')
    , $sort = $('.sort')
    , $tooltips = $('.tooltips')
    , $cancel = $('.cancel')
    , $slogan = $('#slogan')
    , $dragdrop = $('#dragdrop') 
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
      $projects.html(res.body.html);
      next();
    }); 
  };

  var loadSearchProjects = function(ctx, next) { 
    $searchInput.val(ctx.querystring.split('&')[0].replace('q=',''));
    request
    .get('/api/search?' + ctx.querystring)
    .end(function(res){ 
      $projects.html(res.body.html);
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

    $modals.modal('hide');
    if($projects.hasClass('isotope')) $projects.isotope('destroy');

    $projects.imagesLoaded(function() {
      $projects.isotope({
          itemSelector: '.project'
        , animationEngine: 'jquery'
        , resizable: false
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
    $newProject.modal('show');
    initSelect2();
    initImageDrop();
  };

  var editProject = function(ctx) {
    superagent
    .get('/api/projects/edit/' + ctx.params.project_id)
    .end(function(res){
      //fix me

      $editProject.html(res.body.html);
      $editProject.modal('show');
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
      $fullProject.html(res.body.html)
                  .modal('show');
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
  page('/p/:project_id', projectInfo);

  page();

  /*
   * Event listeners
   */

  $(window).smartresize(function(){
    $projects.isotope({
      masonry: masonryIsotope
    });
  });

  $cancel.on('click', function(e){
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
      fields[field].after('<span class="help-inline">Requerido</span>');
    }
  };

  var formSuccess = function(){
    $modals.modal('hide');
    cleanErrors();
    $dragdrop.css('background', 'none').children('input').show(); 
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

  $ajaxForm.ajaxForm({
    error: formError,
    success: formSuccess,
    resetForm: true,
    beforeSubmit: formValidate
  });

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
    if(e.target.tagName !== 'A' && $(this).data('id')) {
      page('/p/' + $(this).data('id'));
    }
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
