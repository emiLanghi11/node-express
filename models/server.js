const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config');
const { validateRequestErrors } = require('../middlewares/request.middleware');
const { userRoute, authRoute, categoryRoute, productRoute, searchRoute } = require('../routes');


class Server {

	constructor() {
		this.app = express();

		this.port = process.env.PORT || 8080;
		this.paths = {
			user: process.env.API_USERS,
			auth: process.env.API_AUTH,
			category: process.env.API_CATEGORIES,
			product: process.env.API_PRODUCTS,
			search: process.env.API_SEARCH,
		}

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
		this.app.use(this.paths.user, userRoute);
		this.app.use(this.paths.auth, authRoute);
		this.app.use(this.paths.category, categoryRoute);
		this.app.use(this.paths.product, productRoute);
		this.app.use(this.paths.search, searchRoute);
	};

	listen() {
		this.app.listen(this.port, () => {
			console.log(`Server is running on port ${this.port}`);
		});
	}
}

module.exports = Server;