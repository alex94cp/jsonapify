var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');

var Response = require('../lib/response');

describe('Response', function() {
	var response;
	beforeEach(function() {
		var res = httpMocks.createResponse();
		response = new Response(res);
	});
	
	describe('#meta', function() {
		it('sets name in meta object as value in response', function() {
			response.meta('name', 'value')
			var data = response.toJSON();
			var expected = { name: 'value' };
			expect(data).to.have.property('meta');
			expect(data.meta).to.deep.equal(expected);
		});
		
		it('replaces whole meta object in response', function() {
			var expected = { name: 'value' };
			response.meta(expected);
			var data = response.toJSON();
			expect(data).to.have.property('meta');
			expect(data.meta).to.deep.equal(expected);
		});
		
		it('returns name from meta object in response', function() {
			response.meta('name', 'value');
			var value = response.meta('name');
			expect(value).to.equal('value');
		});
	});
	
	describe('#link', function() {
		it('sets name in links object as url in response', function() {
			response.link('name', 'url')
			var data = response.toJSON();
			var expected = { name: 'url' };
			expect(data).to.have.property('links');
			expect(data.links).to.deep.equal(expected);
		});
		
		it('returns name from links object in response', function() {
			response.link('name', 'url');
			var value = response.link('name');
			expect(value).to.equal('url');
		});
	});
	
	describe('#links', function() {
		it('replaces whole links object in response', function() {
			var expected = { name: 'value' }
			response.links(expected);
			var data = response.toJSON();
			expect(data).to.have.property('links');
			expect(data.links).to.deep.equal(expected);
		});
		
		it('returns whole links object from response', function() {
			var expected = { name: 'value' };
			response.links(expected);
			var links = response.links();
			expect(links).to.deep.equal(expected);
		});
	});
	
	describe('#error', function() {
		it('adds error to errors object in response', function() {
			response.error('error');
			var data = response.toJSON();
			expect(data).to.have.property('errors');
			expect(data.errors).to.include('error');
		});
	});
	
	describe('#errors', function() {
		it('replaces whole errors array in response', function() {
			var expected = ['error0', 'error1'];
			response.errors(expected);
			var data = response.toJSON();
			expect(data).to.have.property('errors');
			expect(data.errors).to.deep.equal(expected);
		});
		
		it('returns whole errors array from response', function() {
			var expected = ['error0', 'error1'];
			response.errors(expected);
			var errors = response.errors();
			expect(errors).to.deep.equal(expected);
		});
	});
	
	describe('#data', function() {
		it('sets data object as null in response', function() {
			response.data(null);
			var data = response.toJSON();
			expect(data).to.have.property('data', null);
		});
		
		it('sets data object as string in response', function() {
			response.data('data');
			var data = response.toJSON();
			expect(data).to.have.property('data', 'data');
		});
		
		it('sets data object as array in response', function() {
			response.data([1,2,3]);
			var data = response.toJSON();
			expect(data).to.have.property('data').which.includes(1,2,3);
		});
		
		it('returns data object from response', function() {
			response.data('data');
			var data = response.data();
			expect(data).to.equal('data');
		});
	});
	
	describe('#include', function() {
		it('adds include to included objects in response', function() {
			var id = mongoose.Types.ObjectId();
			var expected = { type: 'type', id: id, field: 'field' };
			response.include(expected.type, expected.id, expected);
			var data = response.toJSON();
			expect(data).to.have.property('included');
			expect(data.included).to.include(expected);
		});
		
		it('returns included object from response', function() {
			var id = mongoose.Types.ObjectId();
			var expected = { type: 'type', id: id, field: 'field' };
			response.include(expected.type, expected.id, expected);
			var include = response.include(expected.type, expected.id);
			expect(include).to.deep.equal(expected);
		});
	});
	
	describe('#includes', function() {
		it('replaces all includes in response', function() {
			var expected = [{ type: 'type', id: 1, field: 'field' }];
			response.includes(expected);
			var data = response.toJSON();
			expect(data).to.have.property('included');
			expect(data.included).to.deep.equal(expected);
		});
		
		it('returns all includes from response', function() {
			var expected = [{ type: 'type', id: 1, field: 'field' }];
			response.includes(expected);
			var includes = response.includes();
			expect(includes).to.deep.equal(expected);
		});
	});
	
	describe('#toJSON', function() {
		it('adds jsonapi info', function() {
			response.data('data');
			var data = response.toJSON();
			expect(data).to.have.property('jsonapi');
			expect(data.jsonapi).to.have.property('version', '1.0');
		});
		
		it('omits data in response in the presence of errors', function() {
			response.data('data');
			response.error('error');
			var data = response.toJSON();
			expect(data).to.have.property('errors');
			expect(data).to.not.have.property('data');
		});
	});
});
