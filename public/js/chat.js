const txtID = document.getElementById('txtID');
const txtMessage = document.getElementById('txtMessage');
const ulUsers = document.getElementById('ulUsers');
const ulMessages = document.getElementById('ulMessages');


const url = window.location.hostname.includes('localhost')
	? 'http://localhost:8080'
	: 'https://node-express-production-a816.up.railway.app';

let socket = null;

const validateJWTToken = async () => {
	try {
		const token = localStorage.getItem('token');
		if (!token || token.length <= 10) {
			window.location.href = '/index.html';
		}
		await fetch(`${url}/api/auth`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		})
		.then(res => res.json())
		.then(data => {
			localStorage.setItem('token', data.token);
			document.title = `Chat - ${localStorage.getItem('email')}`;
			connectSocket();
		})
	} catch (error) {
		console.log('error validating JWT token', error);
	}
}

const connectSocket = () => {
	socket = io({
		'extraHeaders': {
			'Authorization': `Bearer ${localStorage.getItem('token')}`
		}
	});

	socket.on('connect', () => {
		console.log('socket connected');
	});

	socket.on('disconnect', () => {
		console.log('socket disconnected');
	});

	socket.on('receive-messages', (payload) => {
		console.log('receive messages', payload);
		listMessages(payload);
	});

	socket.on('active-users', (payload) =>{
		console.log('active users', payload);
		listUsers(payload);
	});

	socket.on('private-message', (payload) =>{
		console.log('new private message', payload);
	});

}

const listMessages = (messages = []) => {
	ulMessages.innerHTML = '';
	let html = '';
	messages.forEach(message => {
		html += `
			<li>
				<p>
					<h5 class="text-primary">${message.name}</h5>
					<span>
						${message.message}
					</span>
				</p>
			</li>
		`;
	});
	ulMessages.innerHTML = html;
	ulMessages.scrollTop = ulMessages.scrollHeight;
}

const listUsers = (users = []) => {
	ulUsers.innerHTML = '';
	let html = '';
	users.forEach(user => {
		html += `
			<li>
				<p>
					<h5 class="text-success">${user.name}</h5>
					<span class="fs-6 text-muted">
						${user.id}
					</span>
				</p>
			</li>
		`;
	});
	ulUsers.innerHTML = html;
	ulUsers.scrollTop = ulUsers.scrollHeight;
}

txtMessage.addEventListener('keyup', ({key}) => {
	if (key === 'Enter') {
		if (txtMessage.value.length === 0 || txtID.value.length === 0) {
			alert('Please enter a message and an ID');
			return;
		}
		socket.emit('send-message', {
			id: txtID.value,
			message: txtMessage.value,
		});
	}
});


validateJWTToken();
