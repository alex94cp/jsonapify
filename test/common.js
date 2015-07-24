var sinon = require('sinon');

function createAccessor() {
	return {
		serialize: sinon.stub(),
		deserialize: sinon.stub(),
		adjustQuery: sinon.stub(),
	};
}

function initAccessor(accessor, value, object) {
	accessor.serialize.callsArgWithAsync(3, null, value);
	accessor.deserialize.callsArgWithAsync(4, null, object);
	accessor.adjustQuery.returns(false);
}

exports.createAccessor = createAccessor;
exports.initAccessor = initAccessor;
