var _ = require('lodash');

exports.errors = require('./errors');

exports.link = require('./link').create;
exports.resource = require('./resource').create;
exports.response = require('./response').create;
_.merge(exports, require('./selectors'));

exports.ref = require('./accessors/ref').create;
exports.refs = require('./accessors/refs').create;
exports.const = require('./accessors/const').create;
exports.template = require('./accessors/template').create;
exports.property = require('./accessors/property').create;

exports.read = require('./middleware/read');
exports.create = require('./middleware/create');
exports.assign = require('./middleware/assign');
exports.update = require('./middleware/update');
exports.delete = require('./middleware/delete');
exports.enumerate = require('./middleware/enumerate');
exports.errorHandler = require('./middleware/errorHandler');
