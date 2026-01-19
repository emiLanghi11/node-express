const { v4: uuidv4 } = require('uuid');
const path = require('path');

const uploadFileToServer = async (files = {}, validExtensions = [], folder = '') => {
	return new Promise((resolve, reject) => {
		const { file } = files;

		const splitName = file.name.split('.');
		const extension = splitName[splitName.length - 1];
		
		if(!validExtensions.includes(extension)) {
			return reject(`Invalid extension. ${extension}. Valid extensions: ${validExtensions.join(', ')}`);
		}

		const fileName = `${uuidv4()}.${extension}`;
		const uploadPath = path.join(__dirname, '../uploads/', folder, fileName);
		file.mv(uploadPath, (err) => {
			if (err) {
				return reject(`Error uploading file. ${err.message}`);
			}
			resolve(fileName);
		});
	});
}

module.exports = {
	uploadFileToServer
}