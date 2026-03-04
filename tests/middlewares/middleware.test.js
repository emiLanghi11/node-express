const { connectDB, disconnectDB, clearDB } = require('../testSetup');
const { seedRoles, createUserWithToken } = require('../testHelpers');
const { validateJWTToken } = require('../../middlewares/jwt.middleware');
const { validateRoles } = require('../../middlewares/role.middleware');
const { generateJWT } = require('../../helpers/jwt');

const mockRes = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
};

beforeAll(async () => {
	await connectDB();
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

describe('validateJWTToken middleware', () => {
	it('should return 401 if no Authorization header is present', async () => {
		const req = { header: jest.fn().mockReturnValue(null) };
		const res = mockRes();
		const next = jest.fn();

		await validateJWTToken(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
		expect(next).not.toHaveBeenCalled();
	});

	it('should return 401 if token is invalid', async () => {
		const req = { header: jest.fn().mockReturnValue('Bearer invalid.token') };
		const res = mockRes();
		const next = jest.fn();

		await validateJWTToken(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
		expect(next).not.toHaveBeenCalled();
	});

	it('should return 401 if token is valid but user does not exist', async () => {
		const { generateJWT: genJWT } = require('../../helpers/jwt');
		const mongoose = require('mongoose');
		const fakeToken = await genJWT(new mongoose.Types.ObjectId().toString());

		const req = { header: jest.fn().mockReturnValue(`Bearer ${fakeToken}`) };
		const res = mockRes();
		const next = jest.fn();

		await validateJWTToken(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
		expect(next).not.toHaveBeenCalled();
	});

	it('should return 401 if user is inactive', async () => {
		const { user } = await createUserWithToken({ active: false, email: 'inactive@test.com' });
		const token = await generateJWT(user.id);

		const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
		const res = mockRes();
		const next = jest.fn();

		await validateJWTToken(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'User is not active' });
		expect(next).not.toHaveBeenCalled();
	});

	it('should call next() and set req.user for a valid active user', async () => {
		const { user, token } = await createUserWithToken();

		const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
		const res = mockRes();
		const next = jest.fn();

		await validateJWTToken(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(req.user).toBeDefined();
		expect(req.user.email).toBe(user.email);
	});
});

describe('validateRoles middleware', () => {
	it('should call next() when user has the required role', () => {
		const middleware = validateRoles(['ADMIN']);
		const req = { user: { role: 'ADMIN' } };
		const res = mockRes();
		const next = jest.fn();

		middleware(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it('should return 401 when user does not have the required role', () => {
		const middleware = validateRoles(['ADMIN']);
		const req = { user: { role: 'SALESPERSON' } };
		const res = mockRes();
		const next = jest.fn();

		middleware(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});

	it('should allow access if user matches any of the allowed roles', () => {
		const middleware = validateRoles(['ADMIN', 'ADMINISTRATIVE']);
		const req = { user: { role: 'ADMINISTRATIVE' } };
		const res = mockRes();
		const next = jest.fn();

		middleware(req, res, next);

		expect(next).toHaveBeenCalled();
	});

	it('should return 401 if req.user is undefined', () => {
		const middleware = validateRoles(['ADMIN']);
		const req = {};
		const res = mockRes();
		const next = jest.fn();

		middleware(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});
});
