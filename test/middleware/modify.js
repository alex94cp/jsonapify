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
var modify = jsonapify.middleware.modify;

describe('modify', function() {
	var model, resource, accessors, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('ModifyTest', new mongoose.Schema);
			done();
		});
	});
	
	beforeEach(function() {
		accessors = {
			field: common.createAccessor(),
			output: common.createAccessor(),
		};
		resource = new Resource(model, {
			type: 'test',
			field: {
				value: accessors.field,
				nullable: true,
			},
			output: {
				value: accessors.output,
				nullable: true,
			},
		});
		res = httpMocks.createResponse();
		common.initAccessor(accessors.field);
		common.initAccessor(accessors.output);
	});
	
	afterEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	describe('add', function() {
		it('inserts element in array at index', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, ['a', 'c'], object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'add',
							path: '/field/1',
							value: 'b',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					if (err) return done(err);
					var resdata = JSON.parse(res._getData());
					expect(resdata).to.have.deep.property('data.field');
					expect(resdata.data.field).to.deep.equal(['a','b','c']);
					done();
				});
			});
		});
		
		it('adds new property to object', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, undefined, object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'add',
							path: '/field',
							value: 'value',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					if (err) return done(err);
					var resdata = JSON.parse(res._getData());
					expect(resdata).to.have.deep.property('data.field');
					expect(resdata.data.field).to.equal('value');
					done();
				});
			});
		});
		
		it('replaces existing object property', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, 'prev', object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'add',
							path: '/field',
							value: 'current',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					if (err) return done(err);
					var resdata = JSON.parse(res._getData());
					expect(resdata).to.have.deep.property('data.field');
					expect(resdata.data.field).to.equal('current');
					done();
				});
			});
		});
	});
	
	describe('remove', function() {
		it('removes the value at the target location', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, 'value', object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'remove',
							path: '/field',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					if (err) return done(err);
					var resdata = JSON.parse(res._getData());
					expect(resdata).to.not.have.deep.property('data.field');
					done();
				});
			});
		});
		
		it('gives an error if the value does not exist', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'remove',
							path: '/invalid',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					expect(err).to.exist;
					done();
				});
			});
		});
	});
	
	describe('replace', function() {
		it('replaces the value at the target location', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, 'prev', object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'replace',
							path: '/field',
							value: 'current',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					if (err) return done(err);
					var resdata = JSON.parse(res._getData());
					expect(resdata).to.have.deep.property('data.field');
					expect(resdata.data.field).to.equal('current');
					done();
				});
			});
		});
		
		it('gives an error if the value does not exist', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'replace',
							path: '/invalid',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					expect(err).to.exist;
					done();
				});
			});
		});
	});
	
	describe('move', function() {
		it('removes the value from path and adds it to the target location', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, 'value', object);
				common.initAccessor(accessors.output, undefined, object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'move',
							from: '/field',
							path: '/output',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					if (err) return done(err);
					var resdata = JSON.parse(res._getData());
					expect(resdata).to.not.have.deep.property('data.field');
					expect(resdata).to.have.deep.property('data.output');
					expect(resdata.data.output).to.equal('value');
					done();
				});
			});
		});
		
		it('gives an error if the value does not exist', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'move',
							from: '/invalid',
							path: '/output',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					expect(err).to.exist;
					done();
				});
			});
		});
	});
	
	describe('copy', function() {
		it('copies the value from path to the target location', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, 'value', object);
				common.initAccessor(accessors.output, undefined, object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'copy',
							from: '/field',
							path: '/output',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					if (err) return done(err);
					var resdata = JSON.parse(res._getData());
					expect(resdata).to.have.deep.property('data.field');
					expect(resdata).to.have.deep.property('data.output');
					expect(resdata.data.field).to.equal('value');
					expect(resdata.data.output).to.equal('value');
					done();
				});
			});
		});
		
		// https://github.com/dharmafly/jsonpatch.js/issues/21
		it.skip('gives an error if the value does not exist', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'copy',
							from: '/invalid',
							path: '/output',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					expect(err).to.exist;
					done();
				});
			});
		});
	});
	
	describe('test', function() {
		it('tests that value at path is equal to value', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, 'expected', object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'test',
							path: '/field',
							value: 'expected',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					if (err) return done(err);
					var resdata = JSON.parse(res._getData());
					expect(resdata).to.have.deep.property('data.field');
					expect(resdata.data.field).to.equal('expected');
					done();
				});
			});
		});
		
		it('gives an error if values do not match', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				common.initAccessor(accessors.field, 'value', object);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'test',
							path: '/field',
							value: 'invalid',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
 					expect(err).to.exist;
					done();
				});
			});
		});
		
		it('gives an error if the value does not exist', function(done) {
			model.create({}, function(err, object) {
				if (err) return done(err);
				var req = httpMocks.createRequest({
					params: { id: object._id.toString() },
					body: {
						data: [{
							op: 'test',
							path: '/invalid',
							value: 'expected',
						}],
					},
				});
				modify([resource, jsonapify.param('id')])(req, res, function(err) {
					expect(err).to.exist;
					done();
				});
			});
		});
	});
});