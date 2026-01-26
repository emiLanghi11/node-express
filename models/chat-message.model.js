

class ChatMessage {
	constructor(id, name, message) {
		this.id = id;
		this.name = name;
		this.message = message;
	}
}


class ChatMessages {
	constructor() {
		this.messages = [];
		this.users = {};
	}

	get last10Messages() {
		return this.messages.slice(0, 10);
	}

	get usersList() {
		return Object.values(this.users);
	}

	sendMessage(id, name, message) {
		this.messages.unshift(new ChatMessage(id, name, message));
		return this.last10Messages;
	}

	connectUser(user) {
		this.users[user.id] = user;
		return this.users;
	}

	disconnectUser(id) {
		delete this.users[id];
		return this.users;
	}

}

module.exports = ChatMessages;