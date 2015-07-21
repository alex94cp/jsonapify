var _ = require('lodash');
var expect = require('chai').expect;
var httpMocks = require('node-mocks-http');

var jsonapify = require('../../');
var Field = jsonapify.Field;
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;
var Property = jsonapify.accessors.Property;

describe('Property', function() {
	var resource, transaction;
	beforeEach(function() {
		var res = httpMocks.createResponse();
		var response = new Response(resource, res);
		resource = new Resource({ type: 'test' });
		transaction = new Transaction(resource, response);
	});
	
	describe('#serialize', function() {
		it('returns property from object', function(done) {
			var expected = 'value';
			var property = 'this.is.a.property';
			var object = _.set({}, property, expected);
			var accessor = new Property(property);
			var field = new Field(resource, 'name', accessor);
			accessor.serialize(field, transaction, object, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(expected);
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		var object;
		beforeEach(function() {
			object = {};
		});
		
		it('sets value as object property', function(done) {
			var expected = 'value';
			var property = 'this.is.a.property';
			var accessor = new Property(property);
			var field = new Field(resource, 'name', accessor);
			accessor.deserialize(field, transaction, expected, object, function(err, output) {
				if (err) return done(err);
				expect(output).to.equal(object);
				expect(object).to.have.deep.property(property, expected);
				done();
			});
		});
	});
});
