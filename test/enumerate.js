var expect = require('chai').expect;
var httpMocks = require('node-mocks-http');
var mockgoose = require('mockgoose');
var mongoose = require('mongoose');
mockgoose(mongoose);

var async = require('async');
var jsonapify = require('../');
var TestModel = require('./testModel');

describe('enumerate', function() {
	var resource, initialize, enumerate, req, res;
	before(function(done) {
		resource = jsonapify(TestModel, {
			type: 'testModel',
			id: jsonapify.field('_id'),
			attributes: {
				foo: jsonapify.field('string'),
				bar: jsonapify.field('number'),
			},
		});
		initialize = jsonapify.initialize(),
		enumerate = jsonapify.enumerate(resource);
		mongoose.connect('mongodb://localhost/test', done);
	});
	
	beforeEach(function(done) {
		mockgoose.reset();
		async.parallel([
			async.apply(TestModel.create.bind(TestModel), { string: 'foo1', number: 10 }),
			async.apply(TestModel.create.bind(TestModel), { string: 'foo2', number: 20 }),
		], function(err, results) {
			if (err) return done(err);
			req = httpMocks.createRequest();
			res = httpMocks.createResponse();
			initialize(req, res, done);
		});
	});
	
	it('returns all resources in json-api format', function(done) {
		enumerate(req, res, function(err) {
			if (err) return done(err);
			var data = res._getData();
			expect(data).to.have.property('data');
			expect(data).to.not.have.property('errors');
			expect(data).to.have.deep.property('data.length', 2);
			done();
		});
	});
});
