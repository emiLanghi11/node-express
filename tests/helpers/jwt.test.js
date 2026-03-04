const { generateJWT, validateJWT } = require('../../helpers/jwt');

describe('generateJWT', () => {
	it('should return a string token', async () => {
		const token = await generateJWT('user-id-123');
		expect(typeof token).toBe('string');
		expect(token.length).toBeGreaterThan(10);
	});

	it('should generate a token that encodes the given id', async () => {
		const id = 'user-id-abc';
		const token = await generateJWT(id);
		const decoded = await validateJWT(token);
		expect(decoded.id).toBe(id);
	});

	it('should generate different tokens for different ids', async () => {
		const token1 = await generateJWT('id-1');
		const token2 = await generateJWT('id-2');
		expect(token1).not.toBe(token2);
	});
});

describe('validateJWT', () => {
	it('should successfully decode a valid token', async () => {
		const id = 'user-id-xyz';
		const token = await generateJWT(id);
		const decoded = await validateJWT(token);

		expect(decoded).toHaveProperty('id', id);
		expect(decoded).toHaveProperty('iat');
		expect(decoded).toHaveProperty('exp');
	});

	it('should reject a malformed token', async () => {
		await expect(validateJWT('not.a.valid.token')).rejects.toBe('Error validating JWT');
	});

	it('should reject an empty string', async () => {
		await expect(validateJWT('')).rejects.toBe('Error validating JWT');
	});
});
