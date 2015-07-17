var _ = require('lodash');

function Link(href, meta) {
	if (_.isPlainObject(href) && !meta) {
		var object = href;
		href = object.href;
		meta = object.meta;
	}
	
	href = href || '';
	meta = meta || {};
	
	this._href = href;
	this._meta = meta;
}

function createLink(href, meta) {
	return new Link(href, meta);
}

Link.prototype.href = function(href) {
	if (!href) {
		return this._href;
	} else {
		this._href = href;
		return this;
	}
}

Link.prototype.meta = function(name, value) {
	if (_.isUndefined(value)) {
		if (!name) {
			return this._meta;
		} else if (_.isString(name)) {
			return this._meta[name];
		} else {
			var meta = name;
			this._meta = meta;
			return this;
		}
	} else {
		this._meta[name] = value;
		return this;
	}
}

Link.prototype.toJSON = function() {
	if (_.isEmpty(this._meta))
		return this._href;
	return {
		href: this._href,
		meta: this._meta,
	};
};

module.exports = exports = Link;
exports.create = createLink;
