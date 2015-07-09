var chai = require('chai');
var expect = chai.expect;

var TestModel = require('./testModel');
var Response = require('../lib/response');
var Property = require('../lib/accessors/property');

describe('Property', function() {
	describe('#serialize', function() {
		it('sets resource field from document', function(done) {
			var response = new Response;
			var object = new TestModel({ string: 'string' });
			var property = new Property('string');
			property.serialize(object, response, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(object.string);
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		it('sets document property from resource field', function(done) {
			var output = {};
			var response = new Response;
			var property = new Property('string');
			property.deserialize('value', response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('string', 'value');
				done();
			});
		});
	});
});
