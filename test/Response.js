var expect = require('chai').expect;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var httpMocks = require('node-mocks-http');

var jsonapify = require('../');
var Response = jsonapify.Response;
var HttpError = jsonapify.errors.HttpError;

describe('Response', function() {
	var res, response;
	beforeEach(function() {
		res = httpMocks.createResponse();
		response = new Response(res);
	})
	
	describe('#raw', function() {
		it('returns http response object', function() {
			expect(response).to.have.property('raw', res);
		});
	});
	
	describe('#data', function() {
		it('sets response data', function() {
			var expected = 'data';
			response.data = expected;
			response.send();
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data', expected);
		});
		
		it('returns response data', function() {
			var expected = 'data';
			response.data = expected;
			expect(response).to.have.property('data', expected);
		});
	});
	
	describe('#meta', function() {
		it('returns response meta object', function() {
			response.meta['name'] = 'value';
			expect(response).to.have.deep.property('meta.name', 'value');
		});
	});
	
	describe('#links', function() {
		it('returns response links object', function() {
			var value = 'https://jsonapify.js';
			response.links['name'] = value;
			expect(response).to.have.deep.property('links.name', value);
		});
	});
	
	describe('#errors', function() {
		it('returns response errors object', function() {
			var httpError = new HttpError(500);
			response.errors.push(httpError);
			response.send();
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('errors').with.length(1);
			expect(resdata.errors[0]).to.deep.equal(httpError.toJSON());
		});
	});
	
	describe('#error', function() {
		it('adds error to response errors', function() {
			var httpError = new HttpError(500);
			response.error(httpError);
			expect(response).to.have.property('errors').with.length(1);
			expect(response.errors[0]).to.equal(httpError);
		});
	});
	
	describe('#include', function() {
		it('adds object to response included objects', function() {
			var expected = { type: 'test', id: new ObjectId, data: 'value' };
			response.include(expected.type, expected.id, expected);
			response.send(null);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('included').with.length(1);
			var included = resdata.included[0];
			expect(included).to.have.property('id');
			expect(included.id).to.satisfy(function(id) {
				return expected.id.equals(id);
			});
			expect(included).to.have.property('type', expected.type);
			expect(included).to.have.property('data', expected.data);
		});
		
		it('retrieves object from response included objects', function() {
			var expected = { type: 'test', id: new ObjectId, data: 'value' };
			response.include(expected.type, expected.id, expected);
			var include = response.include(expected.type, expected.id);
			expect(include).to.have.property('id');
			expect(include.id).to.satisfy(function(id) {
				return expected.id.equals(id);
			});
			expect(include).to.have.property('type', expected.type);
			expect(include).to.have.property('data', expected.data);
		});
	});
	
	describe('#included', function() {
		it('returns response included objects', function() {
			var expected = { type: 'test', id: new ObjectId, data: 'value' };
			response.include(expected.type, expected.id, expected);
			expect(response).to.have.property('included').with.length(1);
			var include = response.included[0];
			expect(include).to.have.property('id');
			expect(include.id).to.satisfy(function(id) {
				return expected.id.equals(id);
			});
			expect(include).to.have.property('type', expected.type);
			expect(include).to.have.property('data', expected.data);
		});
	});
	
	describe('#send', function() {
		it('sets response data object', function() {
			var expected = 'data';
			response.send(expected);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data', expected);
		});
		
		it('sets error code as http status only if all errors are equal', function() {
			var httpError = new HttpError(404);
			response.error(httpError).send();
			expect(res.statusCode).to.equal(httpError.status);
		});
		
		it('sets appropiate status if there are different errors', function() {
			response.error(new HttpError(401));
			response.error(new HttpError(404));
			response.error(new HttpError(415));
			response.send();
			expect(res.statusCode).to.not.equal(200);
		});
		
		it('omits meta object if empty', function() {
			response.send(null);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.not.have.property('meta');
		});
		
		it('omits links object if empty', function() {
			response.send(null);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.not.have.property('links');
		});
		
		it('omits errors object if empty', function() {
			response.send(null);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.not.have.property('errors');
		});
		
		it('omits data if there is any error', function() {
			response.error(new HttpError(500)).send(null);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.not.have.property('data');
			expect(resdata).to.have.property('errors').with.length(1);
		});
		
		it('appends jsonapi version info', function() {
			response.send(null);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('jsonapi');
		});
	});
});
