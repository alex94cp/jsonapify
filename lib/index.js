var _ = require('lodash');

module.exports = exports = {
	Link: require('./Link'),
	Field: require('./Field'),
	Response: require('./Response'),
	Resource: require('./Resource'),
	ResourceView: require('./ResourceView'),
	Transaction: require('./Transaction'),
	middleware: require('./middleware'),
	accessors: require('./accessors'),
	selectors: require('./selectors'),
	errors: require('./errors'),
};

_.merge(exports, exports.accessors);
_.merge(exports, exports.selectors);
_.merge(exports, exports.middleware);
