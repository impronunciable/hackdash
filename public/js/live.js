
;(function(){

	var socket = io.connect();

	var $timeline = $('#timeline');

	socket.on('post', function(data){
		var html;
		switch(data.type) {
			case 'project_created':
				html = "A project named <a target='_blank' href='"+site_root+"/p/"+data.project._id+"'>";
				html += "<strong>"+data.project.title+"</strong></a> was created by <em>" + data.user.name + "</em>.";
				break;
			case 'project_removed':
				html = "Project <strong>"+data.project.title+"</strong> was removed by <em>" + data.user.name + "</em>.";
				break;
			case 'project_edited':
				html = "Project <a href='"+site_root+"/p/"+data.project._id+"'><strong>"+data.project.title+"</strong></a> was edited";
				break;
			case 'project_join':
				html = data.user.name + " joined the project <a href='"+site_root+"/p/"+data.project._id+"'><strong>"+data.project.title+"</strong></a>";
				break;
			case 'project_leave':
				html = data.user.name + " left the project <a href='"+site_root+"/p/"+data.project._id+"'><strong>"+data.project.title+"</strong></a>";
				break;
			case 'project_follow':
				html = data.user.name + " started following the project <a href='"+site_root+"/p/"+data.project._id+"'><strong>"+data.project.title+"</strong></a>";
				break;
			case 'project_unfollow':
				html = data.user.name + " unfollowed the project <a href='"+site_root+"/p/"+data.project._id+"'><strong>"+data.project.title+"</strong></a>";
				break;
		}
		var $el = $('<div class="row"><div class="span12 well"><img src="'+data.user.picture+'"><p>'+html+'</p></div></div>').hide();
		$('#timeline').prepend($el);
		$el.slideDown();
	});
	
})();
