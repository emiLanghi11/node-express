const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config');
const { validateRequestErrors } = require('../middlewares/request.middleware');
const { userRoute, authRoute, categoryRoute, productRoute, searchRoute, fileRoute } = require('../routes');
const fileUpload = require('express-fileupload');
const http = require('http');
const socketHandler = require('../sockets/socket.handler');

class Server {

	constructor(options = {}) {
		this.app = express();

		this.port = process.env.PORT || 8080;
		this.paths = {
			user: process.env.API_USERS,
			auth: process.env.API_AUTH,
			category: process.env.API_CATEGORIES,
			product: process.env.API_PRODUCTS,
			search: process.env.API_SEARCH,
			file: process.env.API_FILES,
		};
		this.server= http.createServer(this.app);
		this.io = require('socket.io')(this.server);

		if (!options.skipDbConnection) {
			this.databaseConnection();
		}
		this.middlewares();
		this.routes();
		this.socketEvents();
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
		// Upload file
		this.app.use(fileUpload({
			useTempFiles: true,
			tempFileDir: '/tmp/',
			createParentPath: true,
		}));
	}

	routes() {
		this.app.use(this.paths.user, userRoute);
		this.app.use(this.paths.auth, authRoute);
		this.app.use(this.paths.category, categoryRoute);
		this.app.use(this.paths.product, productRoute);
		this.app.use(this.paths.search, searchRoute);
		this.app.use(this.paths.file, fileRoute);
	};

	socketEvents() {
		this.io.on('connection', (socket) => socketHandler(socket, this.io));
	}

	listen() {
		// this.app.listen(this.port, () => {
		// 	console.log(`Server is running on port ${this.port}`);
		// });
		this.server.listen(this.port, () => {
			console.log(`Socket.io is running on port ${this.port}`);
		});
	}
}

module.exports = Server;