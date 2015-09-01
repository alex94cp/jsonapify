var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var Registry = jsonapify.Registry;
var create = jsonapify.middleware.create;
var InvalidFieldValue = jsonapify.errors.InvalidFieldValue;

describe('create', function() {
	var model, resource, accessor, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('CreateTest', new mongoose.Schema);
			done();
		});
	});
	
	beforeEach(function() {
		accessor = common.createAccessor();
		resource = new Resource(model, { type: 'test', field: accessor });
		Registry.add('CreateResource', resource);
		res = httpMocks.createResponse();
	});
	
	afterEach(function(done) {
		Registry.remove('CreateResource');
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('creates resource and sends back resource data', function(done) {
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		accessor.deserialize.callsArgWithAsync(4, null);
		var req = httpMocks.createRequest({
			body: { data: { type: 'test', field: 'value' }}
		});
		create('CreateResource')(req, res, function(err) {
			if (err) return done(err);
			expect(accessor.serialize).to.have.been.called.once;
			expect(accessor.deserialize).to.have.been.called.once;
			model.count(function(err, count) {
				if (err) return done(err);
				expect(count).to.equal(1);
				done();
			});
		});
	});
	
	it('sends an error if trying to create resource with wrong type', function(done) {
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		accessor.deserialize.callsArgWithAsync(4, null);
		var req = httpMocks.createRequest({
			body: { data: { type: 'invalid', field: 'value' }}
		});
		create('CreateResource')(req, res, function(err) {
			expect(err).to.be.an.instanceof(InvalidFieldValue);
			model.find(function(err, results) {
				if (err) return done(err);
				expect(results).to.be.empty;
				done();
			});
		});
	});
	
	it('invokes transaction filters', function(done) {
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		accessor.deserialize.callsArgWithAsync(4, null);
		var req = httpMocks.createRequest({
			body: { data: { type: 'test', field: 'value' }},
		});
		var filter = sinon.spy();
		create('CreateResource', { filters: [filter] })(req, res, function(err) {
			if (err) return done(err);
			expect(filter).to.have.been.called.once;
			done();
		});
	});
});
