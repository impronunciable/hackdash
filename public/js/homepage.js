
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


function goToSearch(){
  var q = $('#search-projects').val();
  window.location = '/isearch?q=' + q;
}

$('#search-projects-btn').on("click", goToSearch);
$('#search-projects').on("keyup", function(e){
  var key = e.keyCode || e.which;
  if (key === 13) goToSearch();
});

})();
