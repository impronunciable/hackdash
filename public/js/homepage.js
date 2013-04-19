
;(function(){

$('#create-dashbord').submit(function(){
  if(!/\w{5,10}/.test($(this).find('input').val())) {
    $(this).find('p.error').text('Please provide 5 or more letters').show();
    return false;
  }
});

})();
