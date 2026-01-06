const Category = require('../models/category.model');



const getCategories = async (req, res) => {
	try {
		const { limit = 5, from = 0 } = req.query;
		const filter = { active: true };
		const categories = await Category.find(filter)
			.skip(Number(from))
			.limit(Number(limit));
		const total = await Category.countDocuments(filter);

		res.status(200).json({
			categories,
			total
		});
	} catch (error) {
		console.log('error getting categories', error);
		res.status(500).json({ message: 'Error getting categories', error: error.message });
	}
}

const getCategoryById = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findById(id);

		res.status(200).json(category);
	} catch (error) {
		console.log('error getting category by id', error);
		res.status(500).json({ message: 'Error getting category by id', error: error.message });
	}
}

const createCategory = async (req, res) => {
	try {
		const name = req.body.name.toUpperCase();
		const category = await Category.findOne({ name });
		if (category) {
			return res.status(400).json({ message: 'Category already exists' });
		}

		const newCategory = new Category({ name, createdBy: req.user.id });
		await newCategory.save();

		res.status(201).json({message: 'Category created successfully', category: newCategory});
	} catch (error) {
		console.log('error creating category', error);
		res.status(500).json({ message: 'Error creating category', error: error.message });
	}
}

const updateCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const categoryToUpdate = await Category.findById(id);
		
		const name = req.body.name.toUpperCase();

		categoryToUpdate.name = name;
		categoryToUpdate.updatedAt = Date.now();
		categoryToUpdate.updatedBy = req.user.id;
		await categoryToUpdate.save();

		res.status(200).json({message: 'Category updated successfully', category: categoryToUpdate});
	} catch (error) {
		console.log('error updating category', error);
		res.status(500).json({ message: 'Error updating category', error: error.message });
	}
}

const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const categoryToDelete = await Category.findById(id);

		categoryToDelete.active = false;
		categoryToDelete.updatedBy = req.user.id;
		categoryToDelete.deletedAt = Date.now();
		await categoryToDelete.save();
		res.status(200).json({ message: 'Category deleted successfully' });
	} catch (error) {
		console.log('error deleting category', error);
		res.status(500).json({ message: 'Error deleting category', error: error.message });
	}
}

module.exports = {
	getCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory
}