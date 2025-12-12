const { response } = require('express');

const getUsers = (req, res) => {

	const { q, name = 'No name', apiKey } = req.query;

	res.json({
		message: 'GET users API',
		q,
		name,
		apiKey
	});
};

const putUsers = (req, res) => {
	const id = req.params.id;

	res.json({
		message: 'PUT users API',
		id,
	});
};

const postUsers = (req, res) => {
	const { id, name } = req.body;

	res.status(201).json({
		message: 'POST users API',
		id,
		name
	});
};

const deleteUsers = (req, res) => {
	res.json({
		message: 'DELETE users API'
	});
};

const patchUsers = (req, res) => {
	res.json({
		message: 'PATCH users API'
	});
};

module.exports = {
	getUsers,
	putUsers,
	postUsers,
	deleteUsers,
	patchUsers
};