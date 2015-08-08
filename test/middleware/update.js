var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var ObjectId = mongoose.Types.ObjectId;
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var update = jsonapify.middleware.update;
var ResourceNotFound = jsonapify.errors.ResourceNotFound;
var InvalidFieldValue = jsonapify.errors.InvalidFieldValue;

describe('update', function() {
	var model, resource, accessor, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('UpdateTest', new mongoose.Schema);
			done();
		});
	});
	
	beforeEach(function() {
		accessor = common.createAccessor();
		resource = new Resource(model, { type: 'test', field: accessor });
		res = httpMocks.createResponse();
	});
	
	afterEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('updates existing resource and returns resource data', function(done) {
		model.create({ field: 'before' }, function(err, object) {
			if (err) return done(err);
			accessor.serialize.callsArgWithAsync(3, null, 'value');
			accessor.deserialize.callsArgWithAsync(4, null);
			var req = httpMocks.createRequest({
				params: { id: object._id },
				body: { data: { type: 'test', field: 'after' }},
			});
			update([resource, jsonapify.param('id')])(req, res, function(err) {
				if (err) return done(err);
				expect(accessor.serialize).to.have.been.called.once;
				expect(accessor.deserialize).to.have.been.called.once;
				done();
			});
		});
	});
	
	it('sends an error if trying to update resource with wrong type', function(done) {
		model.create({ field: 'before' }, function(err, object) {
			if (err) return done(err);
			accessor.serialize.callsArgWithAsync(3, null, 'value');
			accessor.deserialize.callsArgWithAsync(4, null);
			var req = httpMocks.createRequest({
				params: { id: object._id },
				body: { data: { type: 'invalid', field: 'after' }},
			});
			update([resource, jsonapify.param('id')])(req, res, function(err) {
				expect(err).to.be.an.instanceof(InvalidFieldValue);
				done();
			});
		});
	});
	
	it('sends an error if resource does not exist', function(done) {
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		accessor.deserialize.callsArgWithAsync(4, null);
		var req = httpMocks.createRequest({
			params: { id: ObjectId() },
			body: { data: { type: 'test', field: 'after' }},
		});
		update([resource, jsonapify.param('id')])(req, res, function(err) {
			expect(err).to.be.an.instanceof(ResourceNotFound);
			done();
		});
	});
	
	it('invokes transaction filters', function(done) {
		model.create({ field: 'before' }, function(err, object) {
			if (err) return done(err);
			var filter = sinon.spy();
			accessor.serialize.callsArgWithAsync(3, null, 'value');
			accessor.deserialize.callsArgWithAsync(4, null);
			var req = httpMocks.createRequest({
				params: { id: object._id },
				body: { data: { type: 'test', field: 'after' }},
			});
			var chain = [resource, jsonapify.param('id')];
			update(chain, { filters: [filter] })(req, res, function(err) {
				if (err) return done(err);
				expect(filter).to.have.been.called.once;
				done();
			});
		});
	});
});
