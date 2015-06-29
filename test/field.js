var chai = require('chai');
var expect = chai.expect;

var Field = require('../lib/field');
var Response = require('../lib/response');
var TestModel = require('./testModel');

describe('Field', function() {
	describe('#serialize', function() {
		it('sets resource property from document object field', function(done) {
			var output = {};
			var response = new Response;
			var object = new TestModel({ string: 'string' });
			var field = new Field('string');
			field.serialize(object, response, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(object.string);
				done();
			});
		});
		
		it('omits not-readable fields from document object', function(done) {
			var output = {};
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
		it('sets document object field from resource property', function(done) {
			var output = new TestModel;
			var response = new Response;
			var field = new Field('string');
			field.deserialize('string', response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('string', 'string');
				done();
			});
		});
		
		it('does not set not-writable fields into resource object', function(done) {
			var output = new TestModel;
			var response = new Response;
			var field = new Field('string', { writable: false });
			field.deserialize('string', response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('string', undefined);
				done();
			});
		});
	});
});
