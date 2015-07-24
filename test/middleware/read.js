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
var read = jsonapify.middleware.read;
var Property = jsonapify.accessors.Property;
var ResourceNotFound = jsonapify.errors.ResourceNotFound;

describe('read', function() {
	var model, resource, accessor, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('ReadTest', new mongoose.Schema);
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
	
	it('retrieves existing resource and sends back resource data', function(done) {
		model.create({ field: 'value' }, function(err, object) {
			if (err) return done(err);
			accessor.serialize.callsArgWithAsync(3, null, 'value');
			accessor.deserialize.callsArgWithAsync(4, null);
			var req = httpMocks.createRequest({ params: { id: object._id }});
			read([resource, jsonapify.param('id')])(req, res, function(err) {
				if (err) return done(err);
				expect(accessor.serialize).to.have.been.called.once;
				expect(accessor.deserialize).to.not.have.been.called;
				done();
			});
		});
	});
	
	it('sends an error if resource not found', function(done) {
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		accessor.deserialize.callsArgWithAsync(4, null);
		var req = httpMocks.createRequest({ params: { id: ObjectId() }});
		read([resource, jsonapify.param('id')])(req, res, function(err) {
			expect(err).to.be.an.instanceof(ResourceNotFound);
			done();
		});
	});
	
	it('invokes transaction filters', function(done) {
		model.create({ field: 'value' }, function(err, object) {
			if (err) return done(err);
			var filter = sinon.spy();
			accessor.serialize.callsArgWithAsync(3, null, 'value');
			accessor.deserialize.callsArgWithAsync(4, null);
			var req = httpMocks.createRequest({ params: { id: object._id }});
			var chain = [resource, jsonapify.param('id')];
			read(chain, { filters: filter })(req, res, function(err) {
				if (err) return done(err);
				expect(filter).to.have.been.called.once;
				done();
			});
		});
	});
});
