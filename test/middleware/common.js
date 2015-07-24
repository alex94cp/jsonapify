var sinon = require('sinon');

function createAccessor() {
	return {
		serialize: sinon.stub(),
		deserialize: sinon.stub(),
		adjustQuery: sinon.stub(),
	};
}

exports.createAccessor = createAccessor;
