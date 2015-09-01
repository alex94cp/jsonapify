var _ = require('lodash');

module.exports = exports = {
	Registry: require('./Registry'),
	Link: require('./Link'),
	Field: require('./Field'),
	Accessor: require('./Accessor'),
	Response: require('./Response'),
	Resource: require('./Resource'),
	Transaction: require('./Transaction'),
	ResourceView: require('./ResourceView'),
	middleware: require('./middleware'),
	accessors: require('./accessors'),
	selectors: require('./selectors'),
	filters: require('./filters'),
	errors: require('./errors'),
};

_.merge(exports, exports.errors);
_.merge(exports, exports.filters);
_.merge(exports, exports.accessors);
_.merge(exports, exports.selectors);
_.merge(exports, exports.middleware);
