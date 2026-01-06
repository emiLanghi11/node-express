const Product = require('../models/product.model');

const getProducts = async (req, res) => {
	try {
		const { limit = 5, from = 0 } = req.query;
		const filter = { active: true };
		const products = await Product.find(filter)
			.skip(Number(from))
			.limit(Number(limit));
		const total = await Product.countDocuments(filter);

		res.status(200).json({
			products,
			total
		});
	} catch (error) {
		console.log('error getting products', error);
		res.status(500).json({ message: 'Error getting products', error: error.message });
	}
}

const getProductById = async (req, res) => {

	try {
		const { id } = req.params;
		const product = await Product.findById(id);
		res.status(200).json(product);
	} catch (error) {
		console.log('error getting product by id', error);
		res.status(500).json({ message: 'Error getting product by id', error: error.message });
	}
}

const createProduct = async (req, res) => {
	try {
		const { name, description, price, category } = req.body;
		const createdBy = req.user.id;
		const product = await Product.create({ name, description, price, category, createdBy });
		res.status(201).json(product);
	} catch (error) {
		console.log('error creating product', error);
		res.status(500).json({ message: 'Error creating product', error: error.message });
	}
}

const updateProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const productToUpdate = await Product.findById(id);
		const { name, description, price, category } = req.body;
		const updatedBy = req.user.id;

		productToUpdate.name = name;
		productToUpdate.description = description || productToUpdate.description;
		productToUpdate.price = price || productToUpdate.price;
		productToUpdate.category = category || productToUpdate.category;
		productToUpdate.updatedBy = updatedBy;
		productToUpdate.updatedAt = Date.now();

		await productToUpdate.save();
		res.status(200).json(productToUpdate);
	} catch (error) {
		console.log('error updating product', error);
		res.status(500).json({ message: 'Error updating product', error: error.message });
	}
}

const deleteProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const productToDelete = await Product.findById(id);
		productToDelete.active = false;
		const updatedBy = req.user.id;
		productToDelete.updatedBy = updatedBy;
		productToDelete.deletedAt = Date.now();
		await productToDelete.save();
		res.status(200).json(productToDelete);
	} catch (error) {
		console.log('error deleting product', error);
		res.status(500).json({ message: 'Error deleting product', error: error.message });
	}
}

module.exports = {
	getProducts,
	createProduct,
	updateProduct,
	getProductById,
	deleteProduct,
}