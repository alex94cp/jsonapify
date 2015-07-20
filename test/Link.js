var chai = require('chai');
var expect = chai.expect;

var jsonapify = require('../');
var Link = jsonapify.Link;

describe('Link', function() {
	describe('#href', function() {
		it('returns href from link object', function() {
			var expected = 'https://jsonapify.js';
			var link = new Link(expected);
			expect(link).to.have.property('href', expected);
		});
		
		it('sets href in link object', function() {
			var link = new Link;
			var expected = 'https://jsonapify.js';
			link.href = expected;
			expect(link).to.have.property('href', expected);
		});
	});
	
	describe('#meta', function() {
		it('returns link meta object', function() {
			var link = new Link;
			link.meta['name'] = 'value';
			expect(link).to.have.deep.property('meta.name', 'value');
		});
	});
	
	describe('#toJSON', function() {
		it('returns href directly if no meta object in link', function() {
			var expected = 'https://jsonapify.js';
			var link = new Link(expected);
			var object = link.toJSON();
			expect(object).to.equal(expected);
		});
		
		it('returns link object if meta object in link', function() {
			var expected = {
				href: 'https://jsonapify.org',
				meta: { name: 'value' }
			};
			var link = new Link(expected.href, expected.meta);
			var object = link.toJSON();
			expect(object).to.deep.equal(expected);
		});
	});
});
