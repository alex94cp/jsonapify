var expect = require('chai').expect;
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');

var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var create = jsonapify.middleware.create;
var InvalidFieldValue = jsonapify.errors.InvalidFieldValue;

describe('create', function() {
	var model, resource, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('CreateTest', new mongoose.Schema);
			done();
		});
	});
	
	beforeEach(function() {
		resource = new Resource(model, { type: 'test' });
		res = httpMocks.createResponse();
	});
	
	afterEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('creates resource and sends back resource data', function(done) {
		var req = httpMocks.createRequest({ body: { data: { type: 'test' }}});
		create(resource)(req, res, function(err) {
			if (err) return done(err);
			model.find(function(err, results) {
				if (err) return done(err);
				expect(results).to.have.length(1);
				done();
			});
		});
	});
	
	it('sends an error if wrong type', function(done) {
		var req = httpMocks.createRequest({ body: { data: { type: 'invalid' }}});
		create(resource)(req, res, function(err) {
			expect(err).to.be.an.instanceof(InvalidFieldValue);
			model.find(function(err, results) {
				if (err) return done(err);
				expect(results).to.be.empty;
				done();
			});
		});
	});
});
