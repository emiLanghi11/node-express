const { uploadFileToServer } = require('../helpers');
const { VALID_IMG_EXTENSIONS, VALID_DOC_EXTENSIONS, NO_IMAGE_FOUND } = require('../constants/constants');
const { VALID_COLLECTIONS } = require('../constants/constants');
const { Product, User } = require('../models');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const uploadFile = async (req, res) => {
	try {
		const { type } = req.body;
		if(!type){
			return res.status(400).json({ message: 'Type is required.' });
		}

		if(type === 'img'){
			const fileName = await uploadFileToServer(req.files, VALID_IMG_EXTENSIONS, 'images');
			return res.status(200).json({ message: 'File uploaded successfully', fileName });
		} else if(type === 'doc'){
			const fileName = await uploadFileToServer(req.files, VALID_DOC_EXTENSIONS, 'documents');
			return res.status(200).json({ message: 'File uploaded successfully', fileName });
		} else {
			return res.status(400).json({ message: 'Invalid type. Valid types: img, doc' });
		}

	} catch (msg) {
		console.log('error uploading file', msg);
		res.status(500).json({ message: 'Error uploading file', error: msg });
	}
}

const updateImage = async (req, res) => {
	try {
		const { collection, id } = req.params;

		// let model = null;
		let record = null;

		switch(collection) {
			case VALID_COLLECTIONS.PRODUCTS:
				// model = Product;
				record = await Product.findById(id);
				if(!record){
					return res.status(404).json({ message: 'Product not found.' });
				}
				break;
			case VALID_COLLECTIONS.USERS:
				// model = User;
				record = await User.findById(id);
				if(!record){
					return res.status(404).json({ message: 'User not found.' });
				}
				break;
			default:
				return res.status(400).json({ message: 'Invalid collection.' });
		}

		if(record.img){
			const publicId = record.img.split('/').pop().split('.')[0];
			await cloudinary.uploader.destroy(publicId);
		}

		const result = await cloudinary.uploader.upload(req.files.file.tempFilePath);
		record.img = result.secure_url;

		// const fileName = await uploadFileToServer(req.files, VALID_IMG_EXTENSIONS, 'images');
		// record.img = fileName;
		await record.save();
		return res.status(200).json({ message: 'Image updated successfully', record });
	} catch (msg) {
		console.log('error updating file', msg);
		res.status(500).json({ message: 'Error updating file', error: msg });
	}
}

const getImage = async (req, res) => {
	try {
		const { collection, id } = req.params;

		let record = null;
		switch(collection) {
			case VALID_COLLECTIONS.PRODUCTS:
				record = await Product.findById(id);
				if(!record){
					return res.status(404).json({ message: 'Product not found.' });
				}
				break;
			case VALID_COLLECTIONS.USERS:
				record = await User.findById(id);
				if(!record){
					return res.status(404).json({ message: 'User not found.' });
				}
				break;
			default:
				return res.status(400).json({ message: 'Invalid collection.' });
		}

		if(record && record.img){
			// const folder = collection === VALID_COLLECTIONS.PRODUCTS ? 'products' : 'users';
			const pathImage = path.join(__dirname, '../uploads/', 'images', record.img);
			if(fs.existsSync(pathImage)){
				return res.sendFile(pathImage);
			}
		}
		return res.sendFile(path.join(__dirname, NO_IMAGE_FOUND));

	} catch (msg) {
		console.log('error getting image', msg);
		res.status(500).json({ message: 'Error getting image', error: msg });
	}
}

module.exports = {
	uploadFile,
	updateImage,
	getImage
}