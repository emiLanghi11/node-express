const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB, clearDB } = require('./testSetup');
const { seedRoles, createUserWithToken, createCategory } = require('./testHelpers');
const Server = require('../models/server');
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

const createProduct = async (categoryId, createdBy, overrides = {}) => {
	return Product.create({
		name: 'Test Product',
		description: 'A test product',
		price: 100,
		category: categoryId,
		createdBy,
		active: true,
		...overrides,
	});
};

describe('GET /api/products', () => {
	it('should return an empty list when no products exist', async () => {
		const res = await request(app).get('/api/products');

		expect(res.statusCode).toBe(200);
		expect(res.body.products).toHaveLength(0);
		expect(res.body.total).toBe(0);
	});

	it('should return only active products', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);

		await createProduct(category.id, user.id, { name: 'Active Product', active: true });
		await createProduct(category.id, user.id, { name: 'Inactive Product', active: false });

		const res = await request(app).get('/api/products');

		expect(res.statusCode).toBe(200);
		expect(res.body.products).toHaveLength(1);
		expect(res.body.products[0].name).toBe('Active Product');
	});
});

describe('GET /api/products/:id', () => {
	it('should return 400 if id is not a valid MongoId', async () => {
		const res = await request(app).get('/api/products/not-valid');

		expect(res.statusCode).toBe(400);
	});

	it('should return 400 if product does not exist', async () => {
		const nonExistentId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/api/products/${nonExistentId}`);

		expect(res.statusCode).toBe(400);
	});

	it('should return 200 with the product on valid id', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);
		const product = await createProduct(category.id, user.id, { name: 'Laptop' });

		const res = await request(app).get(`/api/products/${product.id}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.name).toBe('Laptop');
	});
});

describe('POST /api/products', () => {
	it('should return 401 if no token is provided', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);

		const res = await request(app)
			.post('/api/products')
			.send({ name: 'New Product', description: 'Desc', price: 50, category: category.id });

		expect(res.statusCode).toBe(401);
	});

	it('should return 400 if required fields are missing', async () => {
		const { token } = await createUserWithToken();

		const res = await request(app)
			.post('/api/products')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'Incomplete Product' });

		expect(res.statusCode).toBe(400);
	});

	it('should return 400 if category does not exist', async () => {
		const { token } = await createUserWithToken();
		const nonExistentId = new mongoose.Types.ObjectId();

		const res = await request(app)
			.post('/api/products')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'New Product', description: 'Desc', price: 50, category: nonExistentId });

		expect(res.statusCode).toBe(400);
	});

	it('should return 201 and create the product', async () => {
		const { user, token } = await createUserWithToken();
		const category = await createCategory(user.id);

		const res = await request(app)
			.post('/api/products')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'New Product', description: 'A description', price: 99, category: category.id });

		expect(res.statusCode).toBe(201);
		expect(res.body.name).toBe('New Product');
		expect(res.body.price).toBe(99);
	});
});

describe('PUT /api/products/:id', () => {
	it('should return 401 if no token is provided', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);
		const product = await createProduct(category.id, user.id);

		const res = await request(app)
			.put(`/api/products/${product.id}`)
			.send({ name: 'Updated', category: category.id });

		expect(res.statusCode).toBe(401);
	});

	it('should return 200 and update the product', async () => {
		const { user, token } = await createUserWithToken();
		const category = await createCategory(user.id);
		const product = await createProduct(category.id, user.id);

		const res = await request(app)
			.put(`/api/products/${product.id}`)
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'Updated Product', description: 'Updated desc', price: 200, category: category.id });

		expect(res.statusCode).toBe(200);
		expect(res.body.name).toBe('Updated Product');
		expect(res.body.price).toBe(200);
	});
});

describe('DELETE /api/products/:id', () => {
	it('should return 401 if no token is provided', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);
		const product = await createProduct(category.id, user.id);

		const res = await request(app).delete(`/api/products/${product.id}`);

		expect(res.statusCode).toBe(401);
	});

	it('should return 200 and soft delete the product', async () => {
		const { user, token } = await createUserWithToken();
		const category = await createCategory(user.id);
		const product = await createProduct(category.id, user.id);

		const res = await request(app)
			.delete(`/api/products/${product.id}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.statusCode).toBe(200);

		const deleted = await Product.findById(product.id);
		expect(deleted.active).toBe(false);
	});
});
