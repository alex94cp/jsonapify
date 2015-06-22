var mongoose = require('mongoose');

var testModelSchema = new mongoose.Schema({
	string: String,
	number: Number,
	boolean: Boolean,
});

module.exports = mongoose.model('TestModel', testModelSchema);
