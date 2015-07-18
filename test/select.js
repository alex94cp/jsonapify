var chai = require('chai');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');

var jsonapify = require('../');
var Resource = require('../lib/resource');
var Response = require('../lib/response');
var Selector = require('../lib/filters/select');

describe('select', function() {
	var testModel, resource, response;
	before(function() {
		testModel = require('./testModel');
	});
	
	beforeEach(function() {
		resource = new Resource(testModel, {
			type: 'test-models',
			id: {
				value: jsonapify.property('_id'),
				writable: false,
			},
			attributes: {
				a: 1234,
				b: 5678,
			},
		});
		var res = httpMocks.createResponse();
		response = new Response(res);
	});
	
	describe('#initialize', function() {
		it('sets resource hooks and modifies all resource views', function(done) {
			var select = new Selector;
			var object = new testModel;
			var req = httpMocks.createRequest({
				query: {
					fields: 'type,id,attributes.a',
				},
			})
			select.initialize(resource, req);
			resource.serialize(object, null, function(err, resdata) {
				if (err) return done(err);
				expect(resdata).to.have.property('id');
				expect(resdata).to.have.property('type', 'test-models');
				expect(resdata).to.have.deep.property('attributes.a', 1234);
				expect(resdata).to.not.have.deep.property('attributes.b');
				done();
			});
		});
	});
	
	describe('#remove', function() {
		it('removes all resource hooks', function(done) {
			var select = new Selector;
			var object = new testModel;
			var req = httpMocks.createRequest({
				query: {
					fields: 'type,id,attributes.a',
				},
			})
			select.initialize(resource, req, response);
			select.remove();
			resource.serialize(object, null, function(err, resdata) {
				if (err) return done(err);
				expect(resdata).to.have.property('id');
				expect(resdata).to.have.property('type', 'test-models');
				expect(resdata).to.have.deep.property('attributes.a', 1234);
				expect(resdata).to.have.deep.property('attributes.b', 5678);
				done();
			});
		});
	});
});
