var chai = require('chai');
var expect = chai.expect;

var TestModel = require('./testModel');
var Response = require('../lib/response');
var Field = require('../lib/accessors/field');

describe('Field', function() {
	describe('#serialize', function() {
		it('sets resource field from document', function(done) {
			var response = new Response;
			var object = new TestModel({ string: 'string' });
			var field = new Field('string');
			field.serialize(object, response, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(object.string);
				done();
			});
		});
		
		it('omits not-readable fields from document', function(done) {
			var response = new Response;
			var object = new TestModel({ string: 'string' });
			var field = new Field('string', { readable: false });
			field.serialize(object, response, function(err, value) {
				if (err) return done(err);
				expect(value).to.not.exist;
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		it('sets document property from resource field', function(done) {
			var output = {};
			var response = new Response;
			var field = new Field('string');
			field.deserialize('string', response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('string', 'string');
				done();
			});
		});
		
		it('does not set not-writable fields into resource object', function(done) {
			var output = {};
			var response = new Response;
			var field = new Field('string', { writable: false });
			field.deserialize('string', response, output, function(err) {
				if (err) return done(err);
				expect(output).not.to.have.property('string');
				done();
			});
		});
	});
});
