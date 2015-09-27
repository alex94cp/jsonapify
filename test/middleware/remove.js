var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var ObjectId = mongoose.Types.ObjectId;
var expect = chai.expect;

var jsonapify = require('../../');

var Runtime = jsonapify.Runtime;
var Resource = jsonapify.Resource;
var remove = jsonapify.middleware.remove;
var ResourceNotFound = jsonapify.errors.ResourceNotFound;

describe('remove', function() {
	var model, resource, accessor, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('RemoveTest', new mongoose.Schema);
			done();
		});
	});
	
	beforeEach(function() {
		resource = new Resource(model, { type: 'test' });
		Runtime.addResource('RemoveResource', resource);
		res = httpMocks.createResponse();
	});
	
	afterEach(function(done) {
		Runtime.removeResource('RemoveResource');
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('removes existing resource', function(done) {
		model.create({}, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({ params: { id: object._id }});
			remove(['RemoveResource', jsonapify.param('id')])(req, res, function(err) {
				if (err) return done(err);
				model.findById(object._id, function(err, object) {
					if (err) return done(err);
					expect(object).to.not.exist;
					done();
				});
			});
		});
	});
	
	it('sends an error if resource does not exist', function(done) {
		var req = httpMocks.createRequest({ params: { id: ObjectId() }});
		remove(['RemoveResource', jsonapify.param('id')])(req, res, function(err) {
			expect(err).to.be.an.instanceof(ResourceNotFound);
			done();
		});
	});
	
	it('invokes transaction filters', function(done) {
		model.create({}, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				params: { id: object._id },
				body: { data: { type: 'test', field: 'value' }},
			});
			var filter = sinon.spy();
			var chain = ['RemoveResource', jsonapify.param('id')];
			remove(chain, { filters: [filter] })(req, res, function(err) {
				if (err) return done(err);
				expect(filter).to.have.been.called.once;
				done();
			});
		});
	});
});
