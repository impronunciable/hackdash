
;(function(){

	var socket = io.connect();

	var $timeline = $('#timeline');

	socket.on('post', function(data){
		$('#timeline').prepend('<li>'+data+'</li>');
	});
	
})();
