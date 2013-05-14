

module.exports = function(app, server) {

/*
 * Module dependencies
 */

var sio = require('socket.io')
	,	io = sio.listen(server);

io.on('connection', function(socket){
	console.log(socket);
})

app.on('post', function(data){
	io.sockets.emit('post', data);
});

};
