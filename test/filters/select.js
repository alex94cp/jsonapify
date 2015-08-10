var _ = require('lodash');
var chai = require('chai');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;
var select = jsonapify.filters.select;

describe('select', function() {
	var resource, accessors, transaction;
	beforeEach(function() {
		accessors = {
			id: common.createAccessor(),
			selected: common.createAccessor(),
			notSelected: common.createAccessor(),
		};
		resource = new Resource({
			type: 'test',
			id: accessors.id,
			selected: accessors.selected,
			'not-selected': accessors.notSelected,
		});
		var res = httpMocks.createResponse();
		var response = new Response(res);
		transaction = new Transaction(resource, response);
		common.initAccessor(accessors.id, new ObjectId);
		common.initAccessor(accessors.selected, 'value');
		common.initAccessor(accessors.notSelected, 'value');
	});

	it('makes resource views contain only selected fields', function(done) {
		select()(transaction);
		var req = httpMocks.createRequest({ query: { fields: ['selected'] }});
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.serialize({}, function(err, resdata) {
			if (err) return done(err);
			expect(accessors.selected.serialize).to.have.been.called.once;
			expect(accessors.notSelected.serialize).to.not.have.been.called;
			done();
		});
	});

	it('type and id fields are included implicitly', function(done) {
		select()(transaction);
		var req = httpMocks.createRequest({ query: { fields: [] }});
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.serialize({}, function(err, resdata) {
			if (err) return done(err);
			expect(resdata).to.have.property('id');
			expect(resdata).to.have.property('type', 'test');
			done();
		});
	});

	it('selects a given resource type fields', function(done) {
		select()(transaction);
		var req = httpMocks.createRequest({
			query: { fields: { test: 'selected' }},
		});
		transaction.notify(resource, 'start', req);
		var resview = resource.view(transaction);
		resview.serialize({}, function(err, resdata) {
			if (err) return done(err);
			expect(accessors.selected.serialize).to.have.been.called.once;
			expect(accessors.notSelected.serialize).to.not.have.been.called;
			done();
		});
	});
});
