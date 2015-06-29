var chai = require('chai');
var expect = chai.expect;

var util = require('util');
var mongoose = require('mongoose');

var Template = require('../lib/template');
var Response = require('../lib/response');
var TestModel = require('./testModel');

describe('Template', function() {
	describe('#serialize', function() {
		it('sets resource property according to template', function(done) {
			var output = {};
			var object = new TestModel;
			var response = new Response;
			var template = new Template('/testmodels/{_id}');
			template.serialize(object, response, function(err, value) {
				if (err) return done(err);
				var expected = util.format('/testmodels/%s', object._id);
				expect(value).to.equal(expected);
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		it('does not change anything in document object', function(done) {
			var output = new TestModel;
			var response = new Response;
			var id = mongoose.Types.ObjectId();
			var selfUrl = util.format('/testmodels/%s', id);
			var template = new Template('/testmodels/{_id}');
			template.deserialize(selfUrl, response, output, done);
		});
	});
});
