var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var assign = jsonapify.middleware.assign;
var InvalidFieldValue = jsonapify.errors.InvalidFieldValue;

describe('assign', function() {
	var model, resource, accessor, res;
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
	
	it('creates resource if it does not exist and sends back resource data', function(done) {
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		accessor.deserialize.callsArgWithAsync(4, null);
		var req = httpMocks.createRequest({
			params: { num: 12345 },
			body: { data: { type: 'test', field: 'value' }},
		});
		assign([resource, { num: jsonapify.param('num') }])(req, res, function(err) {
			if (err) return done(err);
			expect(accessor.serialize).to.have.been.called.once;
			expect(accessor.deserialize).to.have.been.called.once;
			model.findOne({ num: 12345 }, function(err, object) {
				if (err) return done(err);
				expect(object).to.exist;
				done();
			});
		});
	});
	
	it('updates resource if it already exists and sends back resource data', function(done) {
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		accessor.deserialize.callsArgWithAsync(4, null);
		model.create({ num: 12345, field: 'before' }, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				params: { num: object.num },
				body: { data: { type: 'test', field: 'after' }},
			});
			assign([resource, { num: jsonapify.param('num') }])(req, res, function(err) {
				if (err) return done(err);
				expect(accessor.serialize).to.have.been.called.once;
				expect(accessor.deserialize).to.have.been.called.once;
				model.findById(object._id, function(err, object) {
					if (err) return done(err);
					expect(object).to.have.property('num', req.params.num);
					done();
				});
			});
		});
	});
	
	it('invokes transaction filters', function(done) {
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		accessor.deserialize.callsArgWithAsync(4, null);
		var req = httpMocks.createRequest({
			params: { num: 12345 },
			body: { data: { type: 'test', field: 'value' }},
		});
		var filter = sinon.spy();
		var chain = [resource, { num: jsonapify.param('num') }];
		assign(chain, { filters: [filter] })(req, res, function(err) {
			if (err) return done(err);
			expect(filter).to.have.been.called.once;
			done();
		});
	});
});
