var expect = require('chai').expect;
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var ObjectId = mongoose.Types.ObjectId;

var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var read = jsonapify.middleware.read;
var Property = jsonapify.accessors.Property;
var ResourceNotFound = jsonapify.errors.ResourceNotFound;

describe('read', function() {
	var model, resource, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('ReadTest', new mongoose.Schema({
				field: String,
			}));
			done();
		});
	});
	
	beforeEach(function() {
		res = httpMocks.createResponse();
		resource = new Resource(model, {
			type: 'test',
			id: new Property('_id'),
			field: new Property('field'),
		});
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
			var req = httpMocks.createRequest({ params: { id: object._id }});
			read([resource, jsonapify.param('id')])(req, res, function(err) {
				if (err) return done(err);
				var resdata = res._getData();
				resdata = JSON.parse(resdata);
				expect(resdata).to.have.deep.property('data.id');
				expect(resdata.data.id).to.satisfy(function(id) {
					return object._id.equals(id);
				});
				expect(resdata).to.have.deep.property('data.type', 'test');
				expect(resdata).to.have.deep.property('data.field', 'value');
				done();
			});
		});
	});
	
	it('sends an error if resource not found', function(done) {
		var req = httpMocks.createRequest({ params: { id: ObjectId() }});
		read([resource, jsonapify.param('id')])(req, res, function(err) {
			expect(err).to.be.an.instanceof(ResourceNotFound);
			done();
		});
	});
});
