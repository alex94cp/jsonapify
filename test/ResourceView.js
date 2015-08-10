var _ = require('lodash');
var chai = require('chai');
var async = require('async');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('./common');
var jsonapify = require('../');
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;
var ResourceView = jsonapify.ResourceView;

describe('ResourceView', function() {
	var model, response;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('ResourceViewTest', new mongoose.Schema);
			var res = httpMocks.createResponse();
			response = new Response(res);
			done();
		});
	});

	after(function(done) {
		mongoose.disconnect(done);
	});

	describe('#model', function() {
		it('gives resource model', function() {
			var resource = new Resource(model, { type: 'test' });
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction);
			expect(resview).to.have.property('model', resource.model);
		});
	});

	describe('#type', function() {
		it('gives resource type', function() {
			var resource = new Resource({ type: 'test' });
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction);
			expect(resview).to.have.property('type', resource.type);
		});
	});

	describe('#field', function() {
		it('gives selected field', function() {
			var resource = new Resource({ type: 'test', name: 'value' });
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction);
			var field = resview.field('name');
			expect(field).to.have.property('name', 'name');
			expect(field).to.have.property('resource', resource);
		});

		it('gives attribute field', function() {
			var resource = new Resource({
				type: 'test',
				attributes: {
					name: 'value',
				},
			});
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction);
			var field = resview.field('name');
			expect(field).to.have.property('name', 'attributes.name');
			expect(field).to.have.property('resource', resource);
		});

		it('gives relationship field', function() {
			var resource = new Resource({
				type: 'test',
				relationships: {
					name: 'value',
				},
			});
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction);
			var field = resview.field('name');
			expect(field).to.have.property('name', 'relationships.name');
			expect(field).to.have.property('resource', resource);
		});

		it('gives null if invalid field', function() {
			var resource = new Resource({ type: 'test' });
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction);
			var field = resview.field('invalid');
			expect(field).to.not.exist;
		});
	});

	describe('#select', function() {
		it('includes only specified fields in view', function() {
			var resource = new Resource({
				type: 'test',
				attributes: {
					selected: 'value',
					'not-selected': 'value',
				},
			});
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction).select('selected');
			expect(resview.field('selected')).to.exist;
			expect(resview.field('not-selected')).to.not.exist;
		});
	});

	describe('#findOne', function() {
		var resource, transaction, object;
		before(function() {
			resource = new Resource(model, { type: 'test' });
			transaction = new Transaction(resource, response);
		});

		beforeEach(function(done) {
			model.create({}, function(err, result) {
				if (err) return done(err);
				object = result;
				done();
			});
		});

		afterEach(function(done) {
			mongoose.connection.db.dropDatabase(done);
		});

		it('retrieves mongoose document from the database', function(done) {
			var resview = resource.view(transaction);
			resview.findOne({ _id: object._id }, function(err, data) {
				if (err) return done(err);
				expect(data).to.have.property('id');
				expect(data._id).to.satisfy(function(id) {
					return id.equals(object._id);
				});
				done();
			});
		});

		it('runs transaction query handlers', function() {
			var handler = sinon.stub().returnsArg(1);
			transaction.subscribe(resource.type, 'query', handler);
			var resview = resource.view(transaction);
			var query = resview.findOne({ _id: object._id });
			expect(handler).to.have.been.calledWith(resview, query);
		});
	});

	describe('#findMany', function() {
		var resource, transaction, objects;
		before(function() {
			resource = new Resource(model, { type: 'test' });
			transaction = new Transaction(resource, response);
		});

		beforeEach(function(done) {
			async.parallel([
				function(next) { model.create({}, next); },
				function(next) { model.create({}, next); },
				function(next) { model.create({}, next); },
			], function(err, results) {
				if (err) return done(err);
				objects = results;
				done();
			});
		});

		afterEach(function(done) {
			mongoose.connection.db.dropDatabase(done);
		});

		it('retrieves mongoose documents from the database', function(done) {
			var resview = resource.view(transaction);
			resview.findMany({}, function(err, results) {
				if (err) return done(err);
				expect(results).to.have.length(objects.length);
				_.each(results, function(result) {
					var obj = _.find(objects, function(obj) {
						return obj._id.equals(result._id);
					});
					expect(obj).to.exist;
				});
				done();
			});
		});

		it('runs transaction query handlers', function() {
			var handler = sinon.stub().returnsArg(1);
			transaction.subscribe(resource.type, 'query', handler);
			var resview = resource.view(transaction);
			var query = resview.findMany({});
			expect(handler).to.have.been.calledWith(resview, query);
		});
	});

	describe('#serialize', function() {
		it('invokes serialize method on field', function(done) {
			var object = {};
			var accessor = common.createAccessor();
			common.initAccessor(accessor, 'value', object);
			var resource = new Resource({ type: 'test', field: accessor });
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction);
			resview.serialize(object, function(err, resdata) {
				if (err) return done(err);
				expect(accessor.serialize).to.have.been.called.once;
				done();
			});
		});
	});

	describe('#deserialize', function() {
		it('invokes deserialize method on field', function(done) {
			var object = {};
			var accessor = common.createAccessor();
			var resdata = { type: 'test', field: 'value' };
			common.initAccessor(accessor, undefined, object);
			var resource = new Resource({ type: 'test', field: accessor });
			var transaction = new Transaction(resource, response);
			var resview = resource.view(transaction);
			resview.deserialize(resdata, object, function(err, resdata) {
				if (err) return done(err);
				expect(accessor.deserialize).to.have.been.called.once;
				done();
			});
		});
	});
});
