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
			function(cb) { TestModel.create({}, cb); },
			function(cb) { TestModel.create({}, cb); },
			function(cb) { TestModel.create({}, cb); },
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
				_(results).tap(function(results) {
					var count = results.length;
					expect(resdata.data).to.have.length(count);
					expect(resdata).to.have.deep.property('meta.count', count);
				}).each(function(object) {
					var match = _.pick(object, ['type', 'id']);
					expect(resdata.data).to.include(match);
				});
				done();
			});
		});
	});
	
	it('allows a subresource to be specified', function(done) {
		async.parallel([
			function(cb) { TestModel.create({ string: 'a' }, cb); },
			function(cb) { TestModel.create({ string: 'a' }, cb); },
			function(cb) { TestModel.create({ string: 'a' }, cb); },
			function(cb) { TestModel.create({ string: 'b' }, cb); },
			function(cb) { TestModel.create({ string: 'b' }, cb); },
			function(cb) { TestModel.create({ string: 'c' }, cb); },
		], function(err, results) {
			if (err) return done(err);
			var req = httpMocks.createRequest({ params: { id: results[0]._id }});
			var res = httpMocks.createResponse();
			jsonapify.enumerate(
				resource, jsonapify.param('id'),
				resource, { string: jsonapify.parent('string') }
			)(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				_(results).filter({ string: 'a' }).tap(function(results) {
					var count = results.length;
					expect(resdata.data).to.have.length(count);
					expect(resdata).to.have.deep.property('meta.count', count);
				}).each(function(object) {
					var match = _.pick(object, ['type', 'id']);
					expect(resdata.data).to.include(match);
				});
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
