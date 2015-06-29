var chai = require('chai');
var expect = chai.expect;

var Response = require('../lib/response');

describe('Response', function() {
	var response;
	beforeEach(function() {
		response = Response.create();
	});
	
	describe('#meta', function() {
		it('sets name in meta object as value', function() {
			response.meta('name', 'value')
			var data = response.toJSON();
			expect(data).to.have.deep.property('meta.name', 'value');
		});
		
		it('returns name in meta object', function() {
			response.meta('name', 'value');
			var value = response.meta('name');
			expect(value).to.equal('value');
		});
	});
	
	describe('#link', function() {
		it('sets name in links object as url', function() {
			response.link('name', 'url')
			var data = response.toJSON();
			expect(data).to.have.deep.property('links.name', 'url');
		});
		
		it('returns name in links object', function() {
			response.link('name', 'url');
			var value = response.link('name');
			expect(value).to.equal('url');
		});
	});
	
	describe('#error', function() {
		it('adds error to errors object', function() {
			response.error('error');
			var data = response.toJSON();
			expect(data).to.have.property('errors').which.includes('error');
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
		
		it('returns data object', function() {
			response.data('data');
			var data = response.data();
			expect(data).to.equal('data');
		});
	});
	
	describe('#include', function() {
		it('adds include to included object', function() {
			response.include('include');
			var data = response.toJSON();
			expect(data).to.have.property('included').which.includes('include');
		});
	});
});
