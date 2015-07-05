var _ = require('lodash');
var chai = require('chai');
var async = require('async');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

var jsonapify = require('../');
var Resource = require('../lib/resource');

describe('enumerate', function() {
	var TestModel, resource;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test-enum', function(err) {
			if (err) return done(err);
			TestModel = require('./testModel');
			resource = new Resource(TestModel, {
				type: 'testmodels',
				id: jsonapify.field('_id'),
			});
			done();
		});
	});
	
	beforeEach(function() {
		// mockgoose.reset();
		mongoose.connection.db.dropDatabase();
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('sends back expected json-api response', function(done) {
		async.parallel([
			TestModel.create.bind(TestModel, {}),
			TestModel.create.bind(TestModel, {}),
			TestModel.create.bind(TestModel, {}),
		], function(err, results) {
			if (err) return done(err);
			var req = httpMocks.createRequest();
			var res = httpMocks.createResponse();
			jsonapify.enumerate(resource)(req, res, function(err) {
				if (err) return done(err);
				var count = results.length;
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				expect(resdata.data).to.have.length(count);
				expect(resdata).to.have.deep.property('meta.count', count);
				for (var i = 0; i < count; ++i) {
					var match = { type: 'testmodels', id: results[i].id };
					expect(resdata.data).to.include(match);
				}
				done();
			});
		});
	});
	
	it('sends empty array if no resources', function(done) {
		var req = httpMocks.createRequest();
		var res = httpMocks.createResponse();
		jsonapify.enumerate(resource)(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(200);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data');
			expect(resdata).to.have.deep.property('meta.count', 0);
			expect(resdata.data).to.be.an.instanceOf(Array);
			expect(resdata.data).to.have.length(0);
			done();
		});
	});
});
