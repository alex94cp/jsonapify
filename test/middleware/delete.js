var chai = require('chai');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var ObjectId = mongoose.Types.ObjectId;
var expect = chai.expect;

var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var _delete = jsonapify.middleware.delete;
var ResourceNotFound = jsonapify.errors.ResourceNotFound;

describe('delete', function() {
	var model, resource, accessor, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('DeleteTest', new mongoose.Schema);
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
	
	it('removes existing resource', function(done) {
		model.create({}, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({ params: { id: object._id }});
			_delete([resource, jsonapify.param('id')])(req, res, function(err) {
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
		_delete([resource, jsonapify.param('id')])(req, res, function(err) {
			expect(err).to.be.an.instanceof(ResourceNotFound);
			done();
		});
	});
});
