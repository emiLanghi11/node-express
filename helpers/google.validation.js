const { OAuth2Client } = require('google-auth-library');


const googleTokenValidation = async (id_token = '') => {
		const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

		const ticket = await client.verifyIdToken({
			idToken: id_token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const { email, name, picture } = ticket.getPayload();
		return { email, name, picture };
	}

module.exports = {
	googleTokenValidation
}