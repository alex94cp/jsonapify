var _ = require('lodash');
var chai = require('chai');
var async = require('async');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var sort = jsonapify.filters.sort;
var Transaction = jsonapify.Transaction;
var Property = jsonapify.accessors.Property;

describe('sort', function() {
	var model, resource, transaction, objects;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('SortTest', new mongoose.Schema({
				orderBy: Number,
			}));
			done();
		});
	});
	
	beforeEach(function(done) {
		resource = new Resource(model, {
			type: 'test',
			'order-by': new Property('orderBy'),
		});
		async.parallel([
			function(next) { model.create({ orderBy: 1 }, next); },
			function(next) { model.create({ orderBy: 0 }, next); },
			function(next) { model.create({ orderBy: 2 }, next); },
		], function(err, results) {
			if (err) return done(err);
			objects = results;
			var res = httpMocks.createResponse();
			var response = new Response(res);
			transaction = new Transaction(resource, response);
			done();
		});
	});
	
	afterEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('sorts resources by ascending selected field', function(done) {
		sort()(transaction);
		var req = httpMocks.createRequest({ query: { sort: 'order-by' }});
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.findMany({}, function(err, results) {
			if (err) return done(err);
			expect(results).to.have.length(objects.length);
			expect(results[0]).to.have.property('orderBy', 0);
			expect(results[1]).to.have.property('orderBy', 1);
			expect(results[2]).to.have.property('orderBy', 2);
			done();
		});
	});
	
	it('sorts resources by descending selected field', function(done) {
		sort()(transaction);
		var req = httpMocks.createRequest({ query: { sort: '-order-by' }});
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.findMany({}, function(err, results) {
			if (err) return done(err);
			expect(results).to.have.length(objects.length);
			expect(results[0]).to.have.property('orderBy', 2);
			expect(results[1]).to.have.property('orderBy', 1);
			expect(results[2]).to.have.property('orderBy', 0);
			done();
		});
	});
	
	it('sorts a given resource type by ascending selected field', function(done) {
		sort()(transaction);
		var req = httpMocks.createRequest({
			query: { sort: { test: 'order-by' }},
		});
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.findMany({}, function(err, results) {
			if (err) return done(err);
			expect(results).to.have.length(objects.length);
			expect(results[0]).to.have.property('orderBy', 0);
			expect(results[1]).to.have.property('orderBy', 1);
			expect(results[2]).to.have.property('orderBy', 2);
			done();
		});
	});
	
	it('sorts a given resource type by descending selected field', function(done) {
		sort()(transaction);
		var req = httpMocks.createRequest({
			query: { sort: { test: '-order-by' }},
		});
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.findMany({}, function(err, results) {
			if (err) return done(err);
			expect(results).to.have.length(objects.length);
			expect(results[0]).to.have.property('orderBy', 2);
			expect(results[1]).to.have.property('orderBy', 1);
			expect(results[2]).to.have.property('orderBy', 0);
			done();
		});
	});
});
