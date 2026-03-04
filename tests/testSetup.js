const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	process.env.MONGODB_URI = uri;
	await mongoose.connect(uri);
};

const disconnectDB = async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
};

const clearDB = async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
};

module.exports = { connectDB, disconnectDB, clearDB };
