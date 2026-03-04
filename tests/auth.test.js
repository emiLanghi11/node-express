process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_AUTH = '/api/auth';
process.env.API_USERS = '/api/users';
process.env.API_CATEGORIES = '/api/categories';
process.env.API_PRODUCTS = '/api/products';
process.env.API_SEARCH = '/api/search';
process.env.API_FILES = '/api/files';
process.env.CORS_ORIGINS = 'http://localhost:8080';

const request = require('supertest');
const bcryptjs = require('bcryptjs');
const { connectDB, disconnectDB, clearDB } = require('./testSetup');
const Server = require('../models/server');
const User = require('../models/user.model');

let app;

beforeAll(async () => {
	await connectDB();
	const server = new Server({ skipDbConnection: true });
	app = server.app;
});

afterAll(async () => {
	await disconnectDB();
});

afterEach(async () => {
	await clearDB();
});

const createTestUser = async (overrides = {}) => {
	const salt = bcryptjs.genSaltSync(10);
	return User.create({
		name: 'Test User',
		email: 'test@test.com',
		password: bcryptjs.hashSync('password123', salt),
		role: 'ADMIN',
		active: true,
		...overrides,
	});
};

describe('POST /api/auth/login', () => {
	it('should return 400 if user is not found', async () => {
		const res = await request(app)
			.post('/api/auth/login')
			.send({ email: 'notfound@test.com', password: 'password123' });

		expect(res.statusCode).toBe(400);
		expect(res.body.message).toBe('User not found');
	});

	it('should return 400 if password is invalid', async () => {
		await createTestUser();

		const res = await request(app)
			.post('/api/auth/login')
			.send({ email: 'test@test.com', password: 'wrongpassword' });

		expect(res.statusCode).toBe(400);
		expect(res.body.message).toBe('Invalid password');
	});

	it('should return 400 on missing fields', async () => {
		const res = await request(app)
			.post('/api/auth/login')
			.send({ email: 'test@test.com' });

		expect(res.statusCode).toBe(400);
	});

	it('should return 200 with user and token on valid credentials', async () => {
		await createTestUser();

		const res = await request(app)
			.post('/api/auth/login')
			.send({ email: 'test@test.com', password: 'password123' });

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('token');
		expect(res.body).toHaveProperty('user');
		expect(res.body.user.email).toBe('test@test.com');
		expect(res.body.user).not.toHaveProperty('password');
	});
});

describe('POST /api/auth/google', () => {
	it('should return 400 if id_token is missing', async () => {
		const res = await request(app)
			.post('/api/auth/google')
			.send({});

		expect(res.statusCode).toBe(400);
	});

	it('should return 400 if id_token is invalid', async () => {
		const res = await request(app)
			.post('/api/auth/google')
			.send({ id_token: 'invalid-token' });

		expect(res.statusCode).toBe(400);
	});
});

describe('GET /api/auth (renewToken)', () => {
	it('should return 401 if no Authorization header is provided', async () => {
		const res = await request(app).get('/api/auth');

		expect(res.statusCode).toBe(401);
		expect(res.body.message).toBe('No token provided');
	});

	it('should return 401 if token is invalid', async () => {
		const res = await request(app)
			.get('/api/auth')
			.set('Authorization', 'Bearer invalid.token.here');

		expect(res.statusCode).toBe(401);
		expect(res.body.message).toBe('Invalid token');
	});

	it('should return 200 with a new token on valid JWT', async () => {
		await createTestUser();

		const loginRes = await request(app)
			.post('/api/auth/login')
			.send({ email: 'test@test.com', password: 'password123' });

		const { token } = loginRes.body;

		const res = await request(app)
			.get('/api/auth')
			.set('Authorization', `Bearer ${token}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('token');
		expect(res.body).toHaveProperty('user');
	});
});
