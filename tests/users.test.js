const request = require('supertest');
const bcryptjs = require('bcryptjs');
const { connectDB, disconnectDB, clearDB } = require('./testSetup');
const { seedRoles, createUserWithToken } = require('./testHelpers');
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

beforeEach(async () => {
	await seedRoles();
});

afterEach(async () => {
	await clearDB();
});

describe('GET /api/users', () => {
	it('should return an empty list when no users exist', async () => {
		const res = await request(app).get('/api/users');

		expect(res.statusCode).toBe(200);
		expect(res.body.users).toHaveLength(0);
		expect(res.body.total).toBe(0);
	});

	it('should return only active users', async () => {
		const salt = bcryptjs.genSaltSync(10);
		await User.create([
			{ name: 'Active', email: 'active@test.com', password: bcryptjs.hashSync('pass', salt), role: 'ADMIN', active: true },
			{ name: 'Inactive', email: 'inactive@test.com', password: bcryptjs.hashSync('pass', salt), role: 'ADMIN', active: false },
		]);

		const res = await request(app).get('/api/users');

		expect(res.statusCode).toBe(200);
		expect(res.body.users).toHaveLength(1);
		expect(res.body.users[0].email).toBe('active@test.com');
	});

	it('should respect limit and from query params', async () => {
		const salt = bcryptjs.genSaltSync(10);
		await User.create([
			{ name: 'User 1', email: 'user1@test.com', password: bcryptjs.hashSync('pass', salt), role: 'ADMIN', active: true },
			{ name: 'User 2', email: 'user2@test.com', password: bcryptjs.hashSync('pass', salt), role: 'ADMIN', active: true },
			{ name: 'User 3', email: 'user3@test.com', password: bcryptjs.hashSync('pass', salt), role: 'ADMIN', active: true },
		]);

		const res = await request(app).get('/api/users?limit=2&from=0');

		expect(res.statusCode).toBe(200);
		expect(res.body.users).toHaveLength(2);
		expect(res.body.total).toBe(3);
	});
});

describe('POST /api/users', () => {
	it('should return 401 if no token is provided', async () => {
		const res = await request(app)
			.post('/api/users')
			.send({ name: 'New User', email: 'new@test.com', password: 'password123', role: 'ADMIN' });

		expect(res.statusCode).toBe(401);
	});

	it('should return 401 if user does not have ADMIN role', async () => {
		const { token } = await createUserWithToken({ role: 'SALESPERSON', email: 'sales@test.com' });

		const res = await request(app)
			.post('/api/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'New User', email: 'new@test.com', password: 'password123', role: 'ADMIN' });

		expect(res.statusCode).toBe(401);
	});

	it('should return 400 if email is invalid', async () => {
		const { token } = await createUserWithToken();

		const res = await request(app)
			.post('/api/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'New User', email: 'not-an-email', password: 'password123', role: 'ADMIN' });

		expect(res.statusCode).toBe(400);
	});

	it('should return 400 if role does not exist in the database', async () => {
		const { token } = await createUserWithToken();

		const res = await request(app)
			.post('/api/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'New User', email: 'new@test.com', password: 'password123', role: 'NONEXISTENT_ROLE' });

		expect(res.statusCode).toBe(400);
	});

	it('should return 400 if email already exists', async () => {
		const { token } = await createUserWithToken();

		const res = await request(app)
			.post('/api/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'Duplicate', email: 'admin@test.com', password: 'password123', role: 'ADMIN' });

		expect(res.statusCode).toBe(500);
	});

	it('should return 201 and create the user on valid data', async () => {
		const { token } = await createUserWithToken();

		const res = await request(app)
			.post('/api/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'New User', email: 'newuser@test.com', password: 'password123', role: 'ADMIN' });

		expect(res.statusCode).toBe(201);
		expect(res.body.user.email).toBe('newuser@test.com');
		expect(res.body.user).not.toHaveProperty('password');
	});
});

describe('PUT /api/users/:id', () => {
	it('should return 401 if no token is provided', async () => {
		const { user } = await createUserWithToken();
		const res = await request(app)
			.put(`/api/users/${user.id}`)
			.send({ name: 'Updated Name' });

		expect(res.statusCode).toBe(401);
	});

	it('should return 400 if id is not a valid MongoId', async () => {
		const { token } = await createUserWithToken();
		const res = await request(app)
			.put('/api/users/not-a-valid-id')
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'Updated Name' });

		expect(res.statusCode).toBe(400);
	});

	it('should return 201 and update the user name', async () => {
		const { user, token } = await createUserWithToken();

		const res = await request(app)
			.put(`/api/users/${user.id}`)
			.set('Authorization', `Bearer ${token}`)
			.send({ name: 'Updated Name' });

		expect(res.statusCode).toBe(201);
		expect(res.body.message).toBe('User updated successfully');
	});
});

describe('DELETE /api/users/:id', () => {
	it('should return 401 if no token is provided', async () => {
		const { user } = await createUserWithToken();
		const res = await request(app).delete(`/api/users/${user.id}`);

		expect(res.statusCode).toBe(401);
	});

	it('should return 201 and soft delete the user (set active to false)', async () => {
		const { user, token } = await createUserWithToken();

		const res = await request(app)
			.delete(`/api/users/${user.id}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.statusCode).toBe(201);
		expect(res.body.message).toBe('User deleted successfully');

		const deletedUser = await User.findById(user.id);
		expect(deletedUser.active).toBe(false);
		expect(deletedUser.deletedAt).not.toBeNull();
	});
});
