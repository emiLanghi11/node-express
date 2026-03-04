const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB, clearDB } = require('./testSetup');
const { seedRoles, createUserWithToken, createCategory } = require('./testHelpers');
const Server = require('../models/server');
const Category = require('../models/category.model');

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

describe('GET /api/categories', () => {
	it('should return an empty list when no categories exist', async () => {
		const res = await request(app).get('/api/categories');

		expect(res.statusCode).toBe(200);
		expect(res.body.categories).toHaveLength(0);
		expect(res.body.total).toBe(0);
	});

	it('should return only active categories', async () => {
		const { user } = await createUserWithToken();
		await Category.create([
			{ name: 'ACTIVE CAT', active: true, createdBy: user.id },
			{ name: 'INACTIVE CAT', active: false, createdBy: user.id },
		]);

		const res = await request(app).get('/api/categories');

		expect(res.statusCode).toBe(200);
		expect(res.body.categories).toHaveLength(1);
		expect(res.body.categories[0].name).toBe('ACTIVE CAT');
	});
});

describe('GET /api/categories/:id', () => {
	it('should return 400 if id is not a valid MongoId', async () => {
		const res = await request(app).get('/api/categories/not-a-valid-id');

		expect(res.statusCode).toBe(400);
	});

	it('should return 400 if category does not exist', async () => {
		const nonExistentId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/api/categories/${nonExistentId}`);

		expect(res.statusCode).toBe(400);
	});

	it('should return 200 with the category on valid id', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id, 'ELECTRONICS');

		const res = await request(app).get(`/api/categories/${category.id}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.name).toBe('ELECTRONICS');
	});
});

describe('POST /api/categories', () => {
	it('should return 401 if no token is provided', async () => {
		const res = await request(app)
			.post('/api/categories')
			.send({ name: 'New Category' });

		expect(res.statusCode).toBe(401);
	});

	it('should return 400 if name is missing', async () => {
		const { token } = await createUserWithToken();
		const res = await request(app)
			.post('/api/categories')
			.set('Authorization', `Bearer ${token}`)
			.send({});

		expect(res.statusCode).toBe(400);
	});

	it('should return 400 if category already exists', async () => {
		const { user, token } = await createUserWithToken();
		await createCategory(user.id, 'ELECTRONICS');

		const res = await request(app)
			.post('/api/categories')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'Electronics' });

		expect(res.statusCode).toBe(400);
		expect(res.body.message).toBe('Category already exists');
	});

	it('should return 201 and create the category (name uppercased)', async () => {
		const { token } = await createUserWithToken();

		const res = await request(app)
			.post('/api/categories')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'electronics' });

		expect(res.statusCode).toBe(201);
		expect(res.body.category.name).toBe('ELECTRONICS');
	});
});

describe('PUT /api/categories/:id', () => {
	it('should return 401 if no token is provided', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);

		const res = await request(app)
			.put(`/api/categories/${category.id}`)
			.send({ name: 'Updated' });

		expect(res.statusCode).toBe(401);
	});

	it('should return 200 and update the category name', async () => {
		const { user, token } = await createUserWithToken();
		const category = await createCategory(user.id, 'OLD NAME');

		const res = await request(app)
			.put(`/api/categories/${category.id}`)
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'new name' });

		expect(res.statusCode).toBe(200);
		expect(res.body.category.name).toBe('NEW NAME');
	});
});

describe('DELETE /api/categories/:id', () => {
	it('should return 401 if no token is provided', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);

		const res = await request(app).delete(`/api/categories/${category.id}`);

		expect(res.statusCode).toBe(401);
	});

	it('should return 200 and soft delete the category', async () => {
		const { user, token } = await createUserWithToken();
		const category = await createCategory(user.id);

		const res = await request(app)
			.delete(`/api/categories/${category.id}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Category deleted successfully');

		const deleted = await Category.findById(category.id);
		expect(deleted.active).toBe(false);
	});
});
