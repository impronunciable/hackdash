
;(function(){

  var $submitBtn = $('input[type=submit]');

  $('#domain').keyup(function(){
    var name = $(this).val();
    if(/^[a-z0-9]{5,10}$/.test(name)) {
      $(this).parent().addClass('success').removeClass('error');
      $submitBtn.removeClass('disabled');
    } else {
      $(this).parent().addClass('error').removeClass('success');
      $submitBtn.addClass('disabled');
    }
  });


  function goToSearchProjects(){
    var q = $('#search-projects').val();
    window.location = '/isearch?q=' + q;
  }

  $('#search-projects-btn').on("click", goToSearchProjects);
  $('#search-projects').on("keyup", function(e){
    var key = e.keyCode || e.which;
    if (key === 13) goToSearchProjects();
  });


  function goToSearchCollections(){
    var q = $('#search-collections').val();
    window.location = '/csearch?q=' + q;
  }

  $('#search-collections-btn').on("click", goToSearchCollections);
  $('#search-collections').on("keyup", function(e){
    var key = e.keyCode || e.which;
    if (key === 13) goToSearchCollections();
  });


  function goToSearchInstances(){
    var q = $('#search-instances').val();
    window.location = '/dashboards?q=' + q;
  }

  $('#search-instances-btn').on("click", goToSearchInstances);
  $('#search-instances').on("keyup", function(e){
    var key = e.keyCode || e.which;
    if (key === 13) goToSearchInstances();
  });

})();