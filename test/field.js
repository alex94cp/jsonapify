var chai = require('chai');
var expect = chai.expect;

var Field = require('../lib/field');
var Resource = require('../lib/resource');
var Response = require('../lib/response');
var TestModel = require('./testModel');

describe('Field', function() {
	var resource;
	before(function() {
		resource = new Resource(TestModel, {
			field: new Field('string'),
		});
	});
	
	describe('#serialize', function() {
		it('sets resource property from document object field', function(done) {
			var output = {};
			var object = new TestModel({ string: 'string' });
			var response = new Response;
			resource.serialize(object, response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('field', object.string);
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		it('sets document object field from resource property', function(done) {
			var output = new TestModel;
			var resdata = { field: 'string' };
			var response = new Response;
			resource.deserialize(resdata, response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('string', resdata.field);
				done();
			});
		});
	});
});
