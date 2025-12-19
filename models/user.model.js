const { Schema, model } = require('mongoose');



const userSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
	},
	img: {
		type: String,
	},
	role: {
		type: String,
		required: true,
	},
	active: {
		type: Boolean,
		default: true,
	},
	google: {
		type: Boolean,
		default: false,
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

// Remove password and version from the response
userSchema.methods.toJSON = function() {
	const { __v, password, _id, ...user } = this.toObject();
	user.uid = this._id;
	return user;
}

module.exports = model('User', userSchema);