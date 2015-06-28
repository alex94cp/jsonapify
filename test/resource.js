var expect = require('chai').expect;
var mockgoose = require('mockgoose');
var mongoose = require('mongoose');
mockgoose(mongoose);

var jsonapify = require('../');
var TestModel = require('./testModel');

describe('Resource', function() {
	var resource, object;
	before(function() {
		resource = new jsonapify.Resource(TestModel, {
			type: 'TestModel',
			id: jsonapify.field('_id'),
			links: {
				self: jsonapify.format('/testmodels/{_id}'),
			},
			attributes: {
				fieldAttr: jsonapify.field('string'),
				constAttr: 'constValue',
			},
		});
	});
	
	describe('#model', function() {
		it('returns the model associated with the resource', function() {
			var model = resource.model;
			expect(model).to.equal(TestModel);
		});
	});
	
	describe('#id', function() {
		it('returns accessor for the resource id', function() {
			var object = new TestModel;
			var accessor = resource.id;
			var id = accessor.get(object);
			expect(id).to.equal(object._id);
		});
	});
	
	describe('#wrap', function() {
		it('turns model instance into resource form', function() {
			var object = new TestModel({ string: 'strValue' });
			var wrapped = resource.wrap(object);
			expect(wrapped).to.have.property('id', object._id);
			expect(wrapped).to.have.property('type', 'TestModel');
			expect(wrapped).to.have.deep.property('attributes.constAttr', 'constValue');
			expect(wrapped).to.have.deep.property('attributes.fieldAttr', object.string);
			expect(wrapped).to.have.deep.property('links.self', '/testmodels/' + object._id);
		});
	});
	
	describe('#unwrap', function() {
		it('turns resource object into model instance', function() {
			var data = {
				type: 'TestModel',
				id: mongoose.Types.ObjectId(),
				links: {
					self: '/testmodels/0123456789',
				},
				attributes: {
					fieldAttr: 'fieldValue',
					constAttr: 'constValue',
				},
			};
			var unwrapped = resource.unwrap(data);
			expect(unwrapped).to.have.property('_id', data.id);
			expect(unwrapped).to.have.property('string', data.attributes.fieldAttr);
		});
	});
});
