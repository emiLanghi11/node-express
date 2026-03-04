module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/tests/**/*.test.js'],
	testTimeout: 30000,
	clearMocks: true,
	setupFiles: ['./tests/env.setup.js'],
};
