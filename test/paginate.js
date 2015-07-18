var chai = require('chai');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var async = require('async');
var mongoose = require('mongoose');

var jsonapify = require('../');
var Resource = require('../lib/resource');
var Response = require('../lib/response');
var Paginator = require('../lib/filters/paginate');

describe('paginate', function() {
	var testModel, resource, response;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			testModel = require('./testModel');
			done();
		});
	});
	
	beforeEach(function(done) {
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
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function() {
		mongoose.disconnect();
	});
	
	describe('#initialize', function() {
		it('sets resource hooks and query limit and offset', function(done) {
			async.parallel([
				function(cb) { testModel.create({}, cb); },
				function(cb) { testModel.create({}, cb); },
				function(cb) { testModel.create({}, cb); },
			], function(err, results) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: {
						'page[size]': 2,
						'page[number]': 0,
					},
				})
				var paginate = new Paginator;
				paginate.initialize(resource, req);
				resource.find({}, function(err, results) {
					if (err) return done(err);
					expect(results).to.have.length(2);
					done();
				});
			});
		});
	});
	
	describe('#addResponseInfo', function() {
		it('sets pagination response links', function() {
			var req = httpMocks.createRequest({
				url: '/',
				query: {
						'page[size]': 2,
						'page[number]': 0,
				},
			});
			var res = httpMocks.createResponse();
			var response = new Response(res);
			response.meta('count', 3);
			var paginate = new Paginator;
			paginate.addResponseInfo(req, response);
			expect(response.link('first')).to.exist;
			expect(response.link('last')).to.exist;
			expect(response.link('next')).to.exist;
			expect(response.link('prev')).to.not.exist;
		});
	});
	
	describe('#remove', function() {
		it('removes resource hooks and query limits and offsets', function(done) {
			async.parallel([
				function(cb) { testModel.create({}, cb); },
				function(cb) { testModel.create({}, cb); },
				function(cb) { testModel.create({}, cb); },
			], function(err, results) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: {
						'page[size]': 2,
						'page[number]': 0,
					},
				})
				var paginate = new Paginator;
				paginate.initialize(resource, req);
				paginate.remove();
				resource.find({}, function(err, results) {
					if (err) return done(err);
					expect(results).to.have.length(3);
					done();
				});
			});
		});
	});
});
