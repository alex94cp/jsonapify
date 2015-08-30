var expect = require('chai').expect;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var httpMocks = require('node-mocks-http');

var jsonapify = require('../../');
var Field = jsonapify.Field;
var Registry = jsonapify.Registry;
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;
var Ref = jsonapify.accessors.Ref;
var Property = jsonapify.accessors.Property;
var InvalidFieldValue = jsonapify.errors.InvalidFieldValue;

describe('Ref', function() {
	var linkedModel, linkedResource, resource, transaction;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			linkedModel = mongoose.model('RefTest', new mongoose.Schema);
			done();
		});
	});

	beforeEach(function() {
		var res = httpMocks.createResponse();
		resource = new Resource({ type: 'test' });
		Registry.add('test', resource);
		var response = new Response(resource, res);
		transaction = new Transaction(resource, response);
		linkedResource = new Resource(linkedModel, {
			type: 'linked',
			id: new Property('_id'),
		});
		Registry.add('linked', linkedResource);
	});

	afterEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
		Registry.remove('test');
		Registry.remove('linked');
	});

	after(function(done) {
		mongoose.disconnect(done);
	});

	describe('#serialize', function() {
		it('invokes callback with resource link', function(done) {
			linkedModel.create({}, function(err, linked) {
				if (err) return done(err);
				var object = { link: linked._id };
				var accessor = new Ref('linked', 'link');
				var field = new Field(resource, 'name', accessor);
				accessor.serialize(field, transaction, object, function(err, resdata) {
					if (err) return done(err);
					expect(resdata).to.have.property('id');
					expect(resdata.id).to.satisfy(function(id) {
						return linked._id.equals(id);
					});
					expect(resdata).to.have.property('type', 'linked');
					done();
				});
			});
		});

		it('includes linked resource in response', function(done) {
			linkedModel.create({}, function(err, linked) {
				if (err) return done(err);
				var object = { link: linked._id };
				var accessor = new Ref('linked', 'link');
				var field = new Field(resource, 'name', accessor);
				accessor.serialize(field, transaction, object, function(err, resdata) {
					if (err) return done(err);
					var response = transaction.response;
					expect(response.included).to.have.length(1);
					expect(response.included[0]).to.have.property('id');
					expect(response.included[0].id).to.satisfy(function(id) {
						return linked._id.equals(id);
					});
					expect(response.included[0]).to.have.property('type', 'linked');
					done();
				});
			});
		});
	});

	describe('#deserialize', function() {
		var object;
		beforeEach(function() {
			object = {};
		});

		it('sets document property from resource field', function(done) {
			var id = new ObjectId();
			var accessor = new Ref('linked', 'link');
			var field = new Field(resource, 'name', accessor);
			var resdata = { type: 'linked', id: id.toString() };
			accessor.deserialize(field, transaction, resdata, object, function(err, output) {
				if (err) return done(err);
				expect(output).to.equal(object);
				expect(object).to.have.property('link');
				expect(object.link).to.satisfy(function(id) {
					return id.equals(id);
				});
				done();
			});
		});
	});
});
