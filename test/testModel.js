var mongoose = require('mongoose');

var testModelSchema = new mongoose.Schema({
	string: String,
	number: Number,
	ref: mongoose.Schema.ObjectId,
	refs: [mongoose.Schema.ObjectId],
});

module.exports = mongoose.model('TestModel', testModelSchema);
