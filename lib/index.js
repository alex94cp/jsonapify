module.exports = exports = require('./resource');

exports.field = require('./accessors/field');
exports.const = require('./accessors/const');

exports.initialize = require('./middleware/initialize');
exports.enumerate = require('./middleware/enumerate');
exports.create = require('./middleware/create');
exports.read = require('./middleware/read');
exports.update = require('./middleware/update');
exports.delete = require('./middleware/delete');
exports.errorHandler = require('./middleware/errorHandler');
