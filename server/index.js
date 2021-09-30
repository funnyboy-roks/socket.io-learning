const express = require('express');
const { Socket } = require('socket.io'); // For docs :P
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static('client'));

// socket id : user info
const currentUsers = {};

// Socket.io
/**
 * @param {Socket} socket
 */
io.on('connection', (socket) => {
	console.log(`Connected - ${socket.id}`);
	const user = (currentUsers[socket.id] = {
		name: '',
		partner: null,
		socket,
	});
	socket.on('disconnect', () => {
		console.log(`Disconnected - ${socket.id}`);
		if (currentUsers[socket.id]) {
			delete currentUsers[socket.id];
		}
	});

	socket.emit('socketInfo', {
		// id: socket.id,
	});

	socket.on('join', (req) => {
		let error = null;

		if (currentUsers[req.partner]) {
			user.partner = req.partner;
		} else {
			error = 'User not found';
		}

		socket.emit('joinResponse', {
			error,
			partner: error ? null : req.partner,
		});

		if (error) return;
		const partner = currentUsers[req.partner];
		partner.partner = socket.id;
		partner.socket.emit('connected', {
			partner: socket.id,
			message: `Now connected to ${socket.id}`,
		});
	});

	socket.on('chat', (req) => {
		currentUsers[user.partner]?.socket.emit('chat', req.message);
	});

	// socket.on('join', (data) => {
	// 	let error = '';
	// 	if (data.name.length < 3) {
	// 		error = 'Name must be at least 3 characters long';
	// 	} else if (data.name.length > 15) {
	// 		error = 'Name must be at most 15 characters long';
	// 	} else if (currentUsers.hasOwnProperty(data.name)) {
	// 		error = 'Name is already taken, please choose a different one.';
	// 	}
	// 	io.emit('join', {
	// 		error,
	// 	});
	// });
});

http.listen(port, () => {
	console.log('listening on http://localhost:' + port);
});
