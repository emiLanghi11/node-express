const mongoose = require('mongoose');
const { connectDB, disconnectDB, clearDB } = require('../testSetup');
const { seedRoles, createUserWithToken, createCategory } = require('../testHelpers');
const { roleExists, emailAlreadyExists, userExists, categoryExists, productExists, validCollections } = require('../../helpers/db.validation');
const Product = require('../../models/product.model');

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

describe('roleExists', () => {
	it('should resolve without error for a valid role', async () => {
		await expect(roleExists('ADMIN')).resolves.toBeUndefined();
	});

	it('should throw for a role that does not exist', async () => {
		await expect(roleExists('FAKE_ROLE')).rejects.toThrow('Role FAKE_ROLE is not valid');
	});
});

describe('emailAlreadyExists', () => {
	it('should resolve without error if email is not taken', async () => {
		await expect(emailAlreadyExists('new@test.com')).resolves.toBeUndefined();
	});

	it('should throw if email is already registered', async () => {
		await createUserWithToken({ email: 'taken@test.com' });
		await expect(emailAlreadyExists('taken@test.com')).rejects.toThrow('Email taken@test.com already exists');
	});
});

describe('userExists', () => {
	it('should resolve without error if user exists', async () => {
		const { user } = await createUserWithToken();
		await expect(userExists(user.id)).resolves.toBeUndefined();
	});

	it('should throw if user does not exist', async () => {
		const fakeId = new mongoose.Types.ObjectId().toString();
		await expect(userExists(fakeId)).rejects.toThrow(`User with id ${fakeId} not found`);
	});
});

describe('categoryExists', () => {
	it('should resolve without error if category exists', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);
		await expect(categoryExists(category.id)).resolves.toBeUndefined();
	});

	it('should throw if category does not exist', async () => {
		const fakeId = new mongoose.Types.ObjectId().toString();
		await expect(categoryExists(fakeId)).rejects.toThrow(`Category with id ${fakeId} not found`);
	});
});

describe('productExists', () => {
	it('should resolve without error if product exists', async () => {
		const { user } = await createUserWithToken();
		const category = await createCategory(user.id);
		const product = await Product.create({ name: 'P', description: 'D', price: 10, category: category.id, createdBy: user.id });
		await expect(productExists(product.id)).resolves.toBeUndefined();
	});

	it('should throw if product does not exist', async () => {
		const fakeId = new mongoose.Types.ObjectId().toString();
		await expect(productExists(fakeId)).rejects.toThrow(`Product with id ${fakeId} not found`);
	});
});

describe('validCollections', () => {
	it('should return true for a valid collection', () => {
		expect(validCollections('users', ['users', 'categories', 'products'])).toBe(true);
	});

	it('should throw for an invalid collection', () => {
		expect(() => validCollections('invalid', ['users', 'categories'])).toThrow(
			'Collection invalid is not valid. Valid collections: users, categories'
		);
	});
});
