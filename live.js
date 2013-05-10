

module.exports = function(app, server) {

/*
 * Module dependencies
 */

var sio = require('socket.io')
	,	io = sio.listen(server);

app.on('post', function(data){
	io.sockets.emit('post', data);
});

};
