const request = require('supertest');
const bcryptjs = require('bcryptjs');
const { connectDB, disconnectDB, clearDB } = require('./testSetup');
const { seedRoles, createUserWithToken, createCategory } = require('./testHelpers');
const Server = require('../models/server');
const User = require('../models/user.model');
const Product = require('../models/product.model');

let app;

beforeAll(async () => {
	await connectDB();
	const server = new Server({ skipDbConnection: true });
	app = server.app;
});

afterAll(async () => {
	await disconnectDB();
});

beforeEach(async () => {
	await seedRoles();
});

afterEach(async () => {
	await clearDB();
});

describe('GET /api/search/:collection/:term', () => {
	it('should return 400 for an invalid collection', async () => {
		const res = await request(app).get('/api/search/invalid/test');

		expect(res.statusCode).toBe(400);
	});

	it('should search users by name', async () => {
		const salt = bcryptjs.genSaltSync(10);
		await User.create({ name: 'John Doe', email: 'john@test.com', password: bcryptjs.hashSync('pass', salt), role: 'ADMIN', active: true });
		await User.create({ name: 'Jane Smith', email: 'jane@test.com', password: bcryptjs.hashSync('pass', salt), role: 'ADMIN', active: true });

		const res = await request(app).get('/api/search/users/John');

		expect(res.statusCode).toBe(200);
		expect(res.body.collection).toBe('users');
		expect(res.body.results).toHaveLength(1);
		expect(res.body.results[0].name).toBe('John Doe');
	});

	it('should search categories by name', async () => {
		const { user } = await createUserWithToken();
		await createCategory(user.id, 'ELECTRONICS');
		await createCategory(user.id, 'FURNITURE');

		const res = await request(app).get('/api/search/categories/elect');

		expect(res.statusCode).toBe(200);
		expect(res.body.results).toHaveLength(1);
		expect(res.body.results[0].name).toBe('ELECTRONICS');
	});

	it('should search products by name or description', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);

		await Product.create({ name: 'Laptop Pro', description: 'A powerful laptop', price: 999, category: category.id, createdBy: user.id, active: true });
		await Product.create({ name: 'Desk Chair', description: 'Ergonomic chair', price: 199, category: category.id, createdBy: user.id, active: true });

		const res = await request(app).get('/api/search/products/laptop');

		expect(res.statusCode).toBe(200);
		expect(res.body.results).toHaveLength(1);
		expect(res.body.results[0].name).toBe('Laptop Pro');
	});

	it('should return an empty results array when no matches found', async () => {
		const res = await request(app).get('/api/search/users/nomatch');

		expect(res.statusCode).toBe(200);
		expect(res.body.results).toHaveLength(0);
	});
});
