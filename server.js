var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(8080);

function handler (req, res) {
	console.info('handler called');
console.info(req.url);
	if (req.url.contains('main.js')) {
		console.info('serving static asset main.js');
		fs.readFile(__dirname + '/main.js', function(err, data) {
			if (err) {
				console.warn('error serving main.js');
				console.info(err);
				res.writeHead(500);
				return res.end('Error loading main.js');
			}
		});
	} 
console.log(req.url);
	if (req.url.contains('client.html') == true || req.url == "/") {
		console.info('serving static asset client.html');
		fs.readFile(__dirname + '/client.html', function (err, data) {
			if (err) {
				console.warn('error serving client.html');
				console.info('err');
				res.writeHead(500);
				return res.end('Error loading client.html');
			}

			res.writeHead(200);
			res.end(data);
		});
	}
}

//todo load conf from file
var sekkret = 'password';

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

var clients = [];

io.sockets.on('connection', function(socket) {
	socket.on('init', function(data) {
		if (data.sekkret === sekkret) {
			// auth succeeded
			clients[data.label] = { 'authorized' : true };
		}
	});
	socket.on('poll', function(data) {
		if (clients[data.label].authorized === true) {
			for (var i = 0; i < messages.length; i++) {
				socket.emit('download', clients[data.label].messages[i]);
				clients[data.label].messages[1] = null;
			}
			clients[data.label].messages.clean();
		}
	});
	socket.on('upload', function(data) {
		if(clients[data.label].authorized === true) {
			clients[data.target].messages[length] = data.payload;
			io.sockets.emit('requestpoll');
		}
	});
	socket.on('listclients', function(data) {
		var tmpclients = clients;
		tmpclients.authorized = null;
		tmpclients.messages = null;
		if(clients[data.label].authorized === true) {
			socket.emit('clientdownload', tmpclients);
		}
	});
});
