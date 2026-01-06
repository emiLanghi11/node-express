const { Schema, model } = require('mongoose');



const categorySchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
		unique: true,
	},
	active: {
		type: Boolean,
		default: true,
		required: true,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	updatedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null,
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

// Remove version from the response
categorySchema.methods.toJSON = function() {
	const { __v, _id, ...category } = this.toObject();
	category.id = _id;
	return category;
}

module.exports = model('Category', categorySchema);