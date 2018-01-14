var path = require('path');
var ws = require('ws');
var http = require('http');
var express = require('express');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var SERVICE_PORT = 3000;
var DATABASE_URL = 'mongodb://localhost/nwhacks';
var STATIC_PATH = path.join(__dirname, '/public');

var dbPromise = mongoose.connect(DATABASE_URL, { useMongoClient: true });

dbPromise.then(function(db){
	console.log('[DB] Connection SUCCESS')
})

var app = express();
var server = http.createServer(app);

app.use('/', express.static(STATIC_PATH));

var sock = new ws.Server({ server: server, path: '/ws' });
var ws_clients = {};
sock.on('connection', function connection(client, request){
	console.log("\n>>> WebSocket connected from "+request.connection.remoteAddress);
	client.id = Math.round(100000 * Math.random());
	ws_clients[client.id] = {
		socket: client,
		kind: 'subscriber'
	};
	var lastSent = Date.now();
	client.on('message', function incoming(message){
		
		//parse the message
		var data = JSON.parse(message);
		// console.log(data);
		if (data.action === 'setKind'){
			ws_clients[client.id].kind = data.kind;
		}
		else if (data.action === 'newFrame'){
			// var cli_count = 0;
			for (var id in ws_clients){
				if (ws_clients[id].kind === 'subscriber' && ws_clients[id].socket.readyState === ws.OPEN){
					ws_clients[id].socket.send(JSON.stringify({ action: 'newFrame', frame: data.frame }));
					// cli_count ++;
				}
			}
			var ended = Date.now() - lastSent;
			lastSent = Date.now();
			console.log("Shared New Frame, time taken: "+ended);
		}

	});
	client.on('close', function(){
		console.log("WebSocket Disconnected "+client.id);
		delete ws_clients[client.id];
	})
});

// app.route('/screen')
// 	.get(function(req, res){
// 		res.redirect('/#!/screen');
// 	})

server.listen(SERVICE_PORT, function(){
	console.log(">>> Starting nwHacks on PORT "+SERVICE_PORT);
});