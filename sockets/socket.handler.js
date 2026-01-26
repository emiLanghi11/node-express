const { Socket } = require('socket.io');
const { validateSocketJWT } = require('../helpers');
const { ChatMessages } = require('../models');


const chatMessages = new ChatMessages();

const socketHandler = async (socket, io) => {
	const token = socket.handshake.headers.authorization.split(' ')[1];

	const user = await validateSocketJWT(token);

	if (!user) {
		socket.disconnect();
		return;
	}

	chatMessages.connectUser(user);
	io.emit('active-users', chatMessages.usersList);
	socket.emit('receive-messages', chatMessages.last10Messages);

	socket.join(user.id);

	socket.on('disconnect', () => {
		chatMessages.disconnectUser(user.id);
		io.emit('active-users', chatMessages.usersList);
	});

	socket.on('send-message', (payload) => {
		if (payload.id === user.id) {
			io.to(payload.id).emit('private-message', {
				message: payload.message,
				from: user.name
			});
		} else {
			chatMessages.sendMessage(user.id, user.name, payload.message);
			io.emit('receive-messages', chatMessages.last10Messages);
		}
	});
	
};

module.exports = socketHandler;