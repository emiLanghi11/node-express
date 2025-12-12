const express = require('express');
const cors = require('cors');

class Server {

	constructor() {
		this.app = express();
		this.port = process.env.PORT || 3000;
		this.userPath = process.env.API_USERS || '/api/users';

		this.middlewares();
		this.routes();
	}

	middlewares() {
		// public directory
		this.app.use(express.static('public'));
		// CORS
		this.app.use(cors({
			origin: 'http://localhost:3000',
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
			allowedHeaders: ['Content-Type', 'Authorization'],
		}));
		// Parse and read body
		this.app.use(express.json());
	}

	routes() {
		this.app.use(this.userPath, require('../routes/user.route'));
	};

	listen() {
		this.app.listen(this.port, () => {
			console.log(`Server is running on port ${this.port}`);
		});
	}
}

module.exports = Server;