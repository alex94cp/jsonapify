var chai = require('chai');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var jsonapify = require('../');
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;

describe('Transaction', function() {
	var resource, response, transaction;
	before(function() {
		resource = new Resource({
			type: 'test',
		});
		
	});
	
	beforeEach(function() {
		var res = httpMocks.createResponse();
		response = new Response(res);
		transaction = new Transaction(resource, response);
	});
	
	describe('#subscribe', function() {
		it('handler is called for subscribed events', function() {
			var handler = sinon.stub().returns(true);
			transaction.subscribe('test', 'event', handler);
			var expected = 'value';
			var handled = transaction.notify(resource, 'event', expected);
			expect(handler).to.have.been.calledWith(resource, expected);
			expect(handled).to.be.true;
		});
		
		it('handler is not called for events not subscribed to', function() {
			var handler = sinon.stub().returns(true);
			transaction.subscribe('test', 'event', handler);
			var handled = transaction.notify(resource, 'other');
			expect(handler).to.not.have.been.called;
			expect(handled).to.be.false;
		});
	});
	
	describe('#unsubscribe', function() {
		it('handler is not called for unsubscribed event anymore', function() {
			var handler = sinon.stub().returns(true);
			transaction.subscribe('test', 'event', handler);
			transaction.unsubscribe('test', 'event', handler);
			var handled = transaction.notify(resource, 'event');
			expect(handler).to.not.have.been.called;
			expect(handled).to.be.false;
		});
	});
	
	describe('#notify', function() {
		it('returns true if event was handled', function() {
			var handler = sinon.stub().returns(true);
			transaction.subscribe('test', 'event', handler);
			var expected = 'value';
			var handled = transaction.notify(resource, 'event', expected);
			expect(handler).to.have.been.calledWith(resource, expected);
			expect(handled).to.be.true;
		});
		
		it('returns false if event was not handled', function() {
			var handled = transaction.notify(resource, 'event');
			expect(handled).to.be.false;
		});
	});
	
	describe('#transform', function() {
		it('returns value transformed by subscribed handlers', function() {
			var expected = 'result';
			var handler = sinon.stub().returns(expected);
			transaction.subscribe('test', 'transform', handler);
			var result = transaction.transform(resource, 'transform', 'value');
			expect(handler).to.have.been.calledWith(resource, 'value');
			expect(result).to.equal(expected);
		});
		
		it('leading params are preserved', function() {
			var expected = 'result';
			var handler = sinon.stub().returns(expected);
			transaction.subscribe('test', 'transform', handler);
			var result = transaction.transform(resource, 'transform', 'param', 'value');
			expect(handler).to.have.been.calledWith(resource, 'param', 'value');
			expect(result).to.equal(expected);
		});
	});
});
