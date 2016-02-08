var _ = require('lodash');
var chai = require('chai');
var async = require('async');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var qs = require('qs');
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;

describe('paginate', function() {
	var model, resource, transaction, objects;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('PaginateTest', new mongoose.Schema);
			done();
		});
	});

	beforeEach(function(done) {
		resource = new Resource(model, { type: 'test' });
		async.parallel([
			function(next) { model.create({}, next); },
			function(next) { model.create({}, next); },
			function(next) { model.create({}, next); },
			function(next) { model.create({}, next); },
			function(next) { model.create({}, next); },
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

	it('paginates resources and adds pagination links', function(done) {
		var query = { page: { number: 2, size: 2 }};
		var req = httpMocks.createRequest({
			url: '/test?' + qs.stringify(query),
			query: query
		});
		jsonapify.filters.paginate()(transaction, req);
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.findMany({}, function(err, results) {
			if (err) return done(err);
			expect(results).to.have.length(2);
			var response = transaction.response;
			response.meta['count'] = objects.length;
			transaction.notify(resource, 'end');
			expect(response).to.have.deep.property('links.first', '/test?page[number]=1&page[size]=2');
			expect(response).to.have.deep.property('links.last', '/test?page[number]=3&page[size]=2');
			expect(response).to.have.deep.property('links.prev', '/test?page[number]=1&page[size]=2');
			expect(response).to.have.deep.property('links.next', '/test?page[number]=3&page[size]=2');
			done();
		});
	});

	it('omits prev link if first page selected', function(done) {
		var query = { page: { number: 1, size: 2 }};
		var req = httpMocks.createRequest({
			url: '/test?' + qs.stringify(query),
			query: query
		});
		jsonapify.filters.paginate()(transaction, req);
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.findMany({}, function(err, results) {
			if (err) return done(err);
			expect(results).to.have.length(2);
			var response = transaction.response;
			response.meta['count'] = objects.length;
			transaction.notify(resource, 'end');
			expect(response).to.have.deep.property('links.first', '/test?page[number]=1&page[size]=2');
			expect(response).to.have.deep.property('links.last', '/test?page[number]=3&page[size]=2');
			expect(response).to.not.have.deep.property('links.prev');
			expect(response).to.have.deep.property('links.next', '/test?page[number]=2&page[size]=2');
			done();
		});
	});

	it('omits next link if last page selected', function(done) {
		var query = { page: { number: objects.length - 2, size: 2 }};
		var req = httpMocks.createRequest({
			url: '/test?' + qs.stringify(query),
			query: query
		});
		jsonapify.filters.paginate()(transaction, req);
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.findMany({}, function(err, results) {
			if (err) return done(err);
			expect(results).to.have.length.of.most(2);
			var response = transaction.response;
			response.meta['count'] = objects.length;
			transaction.notify(resource, 'end');
			expect(response).to.have.deep.property('links.first', '/test?page[number]=1&page[size]=2');
			expect(response).to.have.deep.property('links.last', '/test?page[number]=3&page[size]=2');
			expect(response).to.have.deep.property('links.prev', '/test?page[number]=2&page[size]=2');
			expect(response).to.not.have.deep.property('links.next');
			done();
		});
	});
});
