var _ = require('lodash');
var chai = require('chai');
var async = require('async');
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;
var Property = jsonapify.accessors.Property;

describe('filter', function() {
	var resource, transaction;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('FilterTest', new mongoose.Schema({
				number: Number,
				string: String,
			}));
			done();
		});
	});

	beforeEach(function() {
		resource = new Resource(model, {
			number: {
				value: new Property('number'),
				nullable: true,
			},
			string: {
				value: new Property('string'),
				nullable: true,
			},
		});
		var res = httpMocks.createResponse();
		var response = new Response(res);
		transaction = new Transaction(resource, response);
		jsonapify.filters.filter()(transaction);
	});

	afterEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
	});

	after(function(done) {
		mongoose.disconnect(done);
	});

	describe('eqFilter', function() {
		it('gives only results whose fields equal value', function(done) {
			async.parallel([
				function(next) { model.create({ number: 0 }, next) },
				function(next) { model.create({ number: 1 }, next) },
			], function(err, objects) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: { filter: { number: '= 0' }},
				});
				transaction.notify(resource, 'start', req);
				var resview = resource.view(transaction);
				resview.findMany({}, function(err, results) {
					if (err) return done(err);
					_.each(results, function(object) {
						expect(object).to.have.property('number', 0);
					});
					var response = transaction.response;
					transaction.notify(resource, 'end');
					done();
				});
			});
		});
	});

	describe('neFilter', function() {
		it('gives only results whose fields do not equal value', function(done) {
			async.parallel([
				function(next) { model.create({ number: 0 }, next) },
				function(next) { model.create({ number: 1 }, next) },
			], function(err, objects) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: { filter: { number: '!= 0' }},
				});
				transaction.notify(resource, 'start', req);
				var resview = resource.view(transaction);
				resview.findMany({}, function(err, results) {
					if (err) return done(err);
					_.each(results, function(object) {
						expect(object).to.have.property('number').not.equal(0);
					});
					var response = transaction.response;
					transaction.notify(resource, 'end');
					done();
				});
			});
		});
	});

	describe('gtFilter', function() {
		it('gives only results whose fields are greater than value', function(done) {
			async.parallel([
				function(next) { model.create({ number: -1 }, next) },
				function(next) { model.create({ number:  0 }, next) },
				function(next) { model.create({ number:  1 }, next) },
			], function(err, objects) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: { filter: { number: '> 0' }},
				});
				transaction.notify(resource, 'start', req);
				var resview = resource.view(transaction);
				resview.findMany({}, function(err, results) {
					if (err) return done(err);
					_.each(results, function(object) {
						expect(object).to.have.property('number').gt(0);
					});
					var response = transaction.response;
					transaction.notify(resource, 'end');
					done();
				});
			});
		});
	});

	describe('geFilter', function() {
		it('gives only results whose fields are greater or equal than value', function(done) {
			async.parallel([
				function(next) { model.create({ number: -1 }, next) },
				function(next) { model.create({ number:  0 }, next) },
				function(next) { model.create({ number:  1 }, next) },
			], function(err, objects) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: { filter: { number: '>= 0' }},
				});
				transaction.notify(resource, 'start', req);
				var resview = resource.view(transaction);
				resview.findMany({}, function(err, results) {
					if (err) return done(err);
					_.each(results, function(object) {
						expect(object).to.have.property('number').gte(0);
					});
					var response = transaction.response;
					transaction.notify(resource, 'end');
					done();
				});
			});
		});
	});

	describe('ltFilter', function() {
		it('gives only results whose fields are lesser than value', function(done) {
			async.parallel([
				function(next) { model.create({ number: -1 }, next) },
				function(next) { model.create({ number:  0 }, next) },
				function(next) { model.create({ number:  1 }, next) },
			], function(err, objects) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: { filter: { number: '< 0' }},
				});
				transaction.notify(resource, 'start', req);
				var resview = resource.view(transaction);
				resview.findMany({}, function(err, results) {
					if (err) return done(err);
					_.each(results, function(object) {
						expect(object).to.have.property('number').lt(0);
					});
					var response = transaction.response;
					transaction.notify(resource, 'end');
					done();
				});
			});
		});
	});

	describe('leFilter', function() {
		it('gives only results whose fields are greater or equal than value', function(done) {
			async.parallel([
				function(next) { model.create({ number: -1 }, next) },
				function(next) { model.create({ number:  0 }, next) },
				function(next) { model.create({ number:  1 }, next) },
			], function(err, objects) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: { filter: { number: '<= 0' }},
				});
				transaction.notify(resource, 'start', req);
				var resview = resource.view(transaction);
				resview.findMany({}, function(err, results) {
					if (err) return done(err);
					_.each(results, function(object) {
						expect(object).to.have.property('number').lte(0);
					});
					var response = transaction.response;
					transaction.notify(resource, 'end');
					done();
				});
			});
		});
	});

	describe('reFilter', function() {
		it('gives only results whose fields match regexp', function(done) {
			async.parallel([
				function(next) { model.create({ string: 'alice' }, next) },
				function(next) { model.create({ string: 'bob' }, next) },
			], function(err, objects) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: { filter: { string: '=~ /^a/' }},
				});
				transaction.notify(resource, 'start', req);
				var resview = resource.view(transaction);
				resview.findMany({}, function(err, results) {
					if (err) return done(err);
					_.each(results, function(object) {
						expect(object).to.have.property('string').match(/^a/);
					});
					var response = transaction.response;
					transaction.notify(resource, 'end');
					done();
				});
			});
		});
	});

	describe('strMatchFilter', function() {
		it('gives only results whose fields match expression', function(done) {
			async.parallel([
				function(next) { model.create({ string: 'aac12' }, next) },
				function(next) { model.create({ string: 'abc34' }, next) },
				function(next) { model.create({ string: 'acc56' }, next) },
			], function(err, objects) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					query: { filter: { string: 'a?c*' }},
				});
				transaction.notify(resource, 'start', req);
				var resview = resource.view(transaction);
				resview.findMany({}, function(err, results) {
					if (err) return done(err);
					_.each(results, function(object) {
						expect(object).to.have.property('string');
						expect(object.string).to.match(/^a.c/);
					});
					var response = transaction.response;
					transaction.notify(resource, 'end');
					done();
				});
			});
		});
	});
});
