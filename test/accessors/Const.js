var expect = require('chai').expect;
var httpMocks = require('node-mocks-http');

var jsonapify = require('../../');
var Field = jsonapify.Field;
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Const = jsonapify.accessors.Const;
var Transaction = jsonapify.Transaction;
var InvalidFieldValue = jsonapify.errors.InvalidFieldValue;

describe('Const', function() {
	var resource, transaction;
	beforeEach(function() {
		var res = httpMocks.createResponse();
		resource = new Resource({ type: 'test' });
		var response = new Response(resource, res);
		transaction = new Transaction(resource, response);
	});
	
	describe('#serialize', function() {
		var object;
		beforeEach(function() {
			object = {};
		});
		
		it('invokes callback with given value', function(done) {
			var expected = 'value';
			var accessor = new Const(expected);
			var field = new Field(resource, 'name', accessor);
			accessor.serialize(field, transaction, object, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(value);
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		var object;
		beforeEach(function() {
			object = {};
		});
		
		it('does not change resource object', function(done) {
			var value = 'value';
			var accessor = new Const(value);
			var field = new Field(resource, 'name', accessor);
			accessor.deserialize(field, transaction, value, object, function(err, output) {
				if (err) return done(err);
				expect(output).to.equal(object);
				expect(object).to.be.empty
				done();
			});
		});
		
		it('gives an error if invalid value given', function(done) {
			var accessor = new Const('expected');
			var field = new Field(resource, 'name', accessor);
			accessor.deserialize(field, transaction, 'invalid', object, function(err, output) {
				expect(err).to.be.an.instanceof(InvalidFieldValue);
				expect(object).to.be.empty;
				done();
			});
		});
	});
});
