var expect = require('chai').expect;
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');

var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var assign = jsonapify.middleware.assign;
var Property = jsonapify.accessors.Property;
var InvalidFieldValue = jsonapify.errors.InvalidFieldValue;

describe('assign', function() {
	var model, resource, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('AssignTest', new mongoose.Schema({
				num: Number,
				field: String,
			}));
			done();
		});
	});
	
	beforeEach(function() {
		resource = new Resource(model, {
			type: 'test',
			field: new Property('field'),
		});
		res = httpMocks.createResponse();
	});
	
	afterEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('creates resource if it does not exist and sends back resource data', function(done) {
		var req = httpMocks.createRequest({
			params: { num: 12345 },
			body: { data: { type: 'test', field: 'value' }},
		});
		assign([resource, { num: jsonapify.param('num') }])(req, res, function(err) {
			if (err) return done(err);
			var expected = req.body.data;
			var resdata = res._getData();
			resdata = JSON.parse(resdata);
			expect(resdata).to.have.deep.property('data.type', expected.type);
			expect(resdata).to.have.deep.property('data.field', expected.field);
			model.findOne({ num: 12345 }, function(err, object) {
				if (err) return done(err);
				expect(object).to.exist;
				expect(object).to.have.property('field', expected.field);
				done();
			});
		});
	});
	
	it('updates resource if it already exists and sends back resource data', function(done) {
		model.create({ num: 12345, field: 'before' }, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				params: { num: object.num },
				body: { data: { type: 'test', field: 'after' }},
			});
			assign([resource, { num: jsonapify.param('num') }])(req, res, function(err) {
				if (err) return done(err);
				var expected = req.body.data;
				var resdata = res._getData();
				resdata = JSON.parse(resdata);
				expect(resdata).to.have.deep.property('data.type', expected.type);
				expect(resdata).to.have.deep.property('data.field', expected.field);
				model.findById(object._id, function(err, object) {
					if (err) return done(err);
					expect(object).to.have.property('num', req.params.num);
					expect(object).to.have.property('field', expected.field);
					done();
				});
			});
		});
	});
});
