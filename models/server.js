const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config');
const { validateRequestErrors } = require('../middlewares/request.middleware');




class Server {

	constructor() {
		this.app = express();

		this.port = process.env.PORT || 8080;
		this.userPath = process.env.API_USERS;
		this.authPath = process.env.API_AUTH;

		this.databaseConnection();
		this.middlewares();
		this.routes();
	}

	async databaseConnection() {
		await dbConnection();
	};

	middlewares() {
		// public directory
		this.app.use(express.static('public'));
		// CORS
		const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : [];

		this.app.use(cors({
			origin: allowedOrigins,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
			allowedHeaders: ['Content-Type', 'Authorization'],
		}));
		// Parse and read body
		this.app.use(express.json());
		// Validate request errors
		this.app.use(validateRequestErrors);
	}

	routes() {
		this.app.use(this.userPath, require('../routes/user.route'));
		this.app.use(this.authPath, require('../routes/auth.route'));
	};

	listen() {
		this.app.listen(this.port, () => {
			console.log(`Server is running on port ${this.port}`);
		});
	}
}

module.exports = Server;