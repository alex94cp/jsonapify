var mongoose = require('mongoose');

var testModelSchema = new mongoose.Schema({
	string: String,
	number: Number,
});

module.exports = mongoose.model('TestModel', testModelSchema);
