exports.Resource = require('./resource');

exports.field = require('./accessors/field');
exports.const = require('./accessors/const');
exports.format = require('./accessors/format');

exports.initialize = require('./middleware/initialize');
exports.enumerate = require('./middleware/enumerate');
exports.create = require('./middleware/create');
exports.assign = require('./middleware/assign');
exports.read = require('./middleware/read');
exports.update = require('./middleware/update');
exports.delete = require('./middleware/delete');

exports.errorHandler = require('./middleware/errorHandler');
