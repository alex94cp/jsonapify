var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var jsonapify = require('../');
var Resource = jsonapify.Resource;
var ResourceView = jsonapify.ResourceView;
var Transaction = jsonapify.Transaction;
var Response = jsonapify.Response;

describe('Resource', function() {
	var model;
	before(function() {
		model = mongoose.model('ResourceTest', new mongoose.Schema);
	});
	
	describe('#model', function() {
		it('gives associated model', function() {
			var resource = new Resource(model, { type: 'test' });
			expect(resource).to.have.property('model', model);
		});
	});
	
	describe('#type', function() {
		it('gives resource type', function() {
			var expected = 'test';
			var resource = new Resource(model, { type: expected });
			expect(resource).to.have.property('type', expected);
		});
	});
	
	describe('#view', function() {
		var resource, transaction;
		beforeEach(function() {
			var res = httpMocks.createResponse();
			var response = new Response(res);
			resource = new Resource(model, { type: 'test' });
			transaction = new Transaction(resource, response);
		});
		
		it('gives expected resource view', function() {
			var resview = resource.view(transaction);
			expect(resview).to.be.an.instanceof(ResourceView);
			expect(resview).to.have.property('type', resource.type);
			expect(resview).to.have.property('model', resource.model);
		});
		
		it('notifies transaction observers', function() {
			var handler = sinon.stub().returnsArg(1);
			transaction.subscribe(resource.type, 'view', handler);
			var resview = resource.view(transaction);
			expect(handler).to.have.been.calledWith(resource, resview);
		});
	});
});
