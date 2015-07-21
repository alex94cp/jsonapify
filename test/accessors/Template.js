var expect = require('chai').expect;
var httpMocks = require('node-mocks-http');

var jsonapify = require('../../');
var Field = jsonapify.Field;
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;
var Template = jsonapify.accessors.Template;
var InvalidFieldValue = jsonapify.errors.InvalidFieldValue;

describe('Template', function() {
	var resource, transaction;
	beforeEach(function() {
		var res = httpMocks.createResponse();
		var response = new Response(res);
		resource = new Resource({ type: 'test' });
		transaction = new Transaction(resource, response);
	});
	
	describe('#serialize', function() {
		it('applies template with object fields', function(done) {
			var object = { expected: 'expected', value: 'value' };
			var accessor = new Template('${expected} ${value}');
			var field = new Field(resource, accessor);
			accessor.serialize(field, transaction, object, function(err, resdata) {
				if (err) return done(err);
				expect(resdata).to.equal('expected value');
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		var object;
		beforeEach(function() {
			object = {};
		});
		
		it('does not change object', function(done) {
			var accessor = new Template('${name}');
			var field = new Field(resource, accessor);
			accessor.deserialize(field, transaction, 'value', object, function(err, output) {
				if (err) return done(err);
				expect(output).to.equal(object);
				expect(object).to.be.empty;
				done();
			});
		});
		
		it('gives an error if value is not string', function(done) {
			var accessor = new Template('${name}');
			var field = new Field(resource, accessor);
			accessor.deserialize(field, transaction, ['invalid'], object, function(err, output) {
				expect(err).to.be.an.instanceof(InvalidFieldValue);
				expect(output).to.not.exist;
				done();
			});
		});
	});
});
