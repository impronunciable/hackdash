
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

})();
