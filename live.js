

module.exports = function(app, server) {

/*
 * Module dependencies
 */

var sio = require('socket.io')
	,	io = sio.listen(server);

io.configure(function (){
  io.set('authorization', function (data, callback) {
		var url = data.headers.referer.replace(/https?:\/\//, '').split('.');
		data.domain = url[0];
    callback(null, true); 
  });
});

io.sockets.on('connection', function (socket) {
	socket.join(socket.handshake.domain);
});

app.on('post', function(data){
	io.sockets.in(data.domain).emit('post', data);
});

};
