const { Schema, model } = require('mongoose');

const productSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
	},
	description: {
		type: String,
		required: [true, 'Description is required'],
	},
	price: {
		type: Number,
		required: [true, 'Price is required'],
	},
	active: {
		type: Boolean,
		default: true,
	},
	img: {
		type: String,
		default: null,
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
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
productSchema.methods.toJSON = function() {
	const { __v, _id, ...product } = this.toObject();
	product.id = _id;
	return product;
}

module.exports = model('Product', productSchema);