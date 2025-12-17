const { Schema, model } = require('mongoose');

const roleSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
		unique: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	deletedAt: {
		type: Date,
		default: null,
	},
});

module.exports = model('Role', roleSchema);