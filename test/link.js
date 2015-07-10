var chai = require('chai');
var expect = chai.expect;

var Link = require('../lib/link');

describe('Link', function() {
	describe('#href', function() {
		it('sets href in link', function() {
			var link = new Link;
			var expected = 'http://jsonapify.js';
			link.href(expected);
			var data = link.toJSON();
			expect(data).to.equal(expected);
		});
		
		it('returns href from link', function() {
			var expected = 'http://jsonapify.js';
			var link = new Link(expected);
			expect(link.href()).to.equal(expected);
		});
	});
	
	describe('#meta', function() {
		it('sets name in link meta object as value', function() {
			var link = new Link('http://jsonapify.js');
			link.meta('name', 'value');
			var data = link.toJSON();
			var expected = { name: 'value' };
			expect(data).to.have.property('meta');
			expect(data.meta).to.deep.equal(expected);
		});
		
		it('replaces whole meta object in link', function() {
			var link = new Link('http://jsonapify.js');
			var expected = { name: 'value' };
			link.meta(expected);
			var data = link.toJSON();
			expect(data).to.have.property('meta');
			expect(data.meta).to.deep.equal({ name: 'value' });
		});
		
		it('returns name in link meta object', function() {
			var link = new Link('http://jsonapify.js', { name: 'value' });
			expect(link.meta('name')).to.equal('value');
		});
	});
});
