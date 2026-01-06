const { VALID_COLLECTIONS } = require('../helpers/db.validation');
const { Category, Product, User } = require('../models');


const search = async (req, res) => {
	try {
		const { collection, term } = req.params;
		if (!VALID_COLLECTIONS.includes(collection)) {
			return res.status(400).json({ message: `Invalid collection for search: ${collection}` });
		}
		
		
		let data = [];
		switch (collection) {
			case 'categories':
				data = await Category.find({ name: { $regex: term, $options: 'i' }, active: true });
				break;
			case 'products':
				data = await Product.find({ $or: [{ name: { $regex: term, $options: 'i' } }, { description: { $regex: term, $options: 'i' } }], active: true });
				break;
			case 'users':
				data = await User.find({ $or: [{ name: { $regex: term, $options: 'i' } }, { email: { $regex: term, $options: 'i' } }], active: true });
				break;
			default:
				return res.status(400).json({ message: `Invalid collection for search: ${collection}` });
		}

		res.status(200).json({
			collection,
			results: data
		});
	} catch (error) {
		console.log('error searching', error);
		res.status(500).json({ message: 'Error searching', error: error.message });
	}
}

module.exports = {
	search
}