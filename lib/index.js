exports.resource = require('./resource').create;
exports.ref = require('./accessors/ref').create;
exports.const = require('./accessors/const').create;
exports.field = require('./accessors/field').create;
exports.template = require('./accessors/template').create;

exports.enumerate = require('./middleware/enumerate');
exports.create = require('./middleware/create');
exports.read = require('./middleware/read');
