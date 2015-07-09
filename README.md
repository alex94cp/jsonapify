# jsonapify

[![Build Status](https://travis-ci.org/alex94puchades/jsonapify.svg?branch=master)](https://travis-ci.org/alex94puchades/jsonapify)
[![Coverage Status](https://coveralls.io/repos/alex94puchades/jsonapify/badge.svg?branch=master&service=github)](https://coveralls.io/github/alex94puchades/jsonapify?branch=master)

Middleware for easy development of JSON-API compatible APIs

## Install

```bash
$ npm install jsonapify
```

## Sample code

```js
var auth = require('./auth');
var express = require('express');
var jsonapify = require('jsonapify');

var User = require('./models/user');
var roleResource = require('./roles').Resource;
var userResource = new jsonapify.resource(User, {
	type: 'users',
	id: {
		value: jsonapify.property('_id'),
		writable: false,
	},
	links: {
		self: {
			value: jsonapify.template('/users/{_id}'),
			writable: false,
		},
	},
	attributes: {
		email: jsonapify.property('email'),
		password: {
			value: jsonapify.property('password'),
			readable: false,
		},
	},
	relationships: {
		role: jsonapify.ref(roleResource, 'role'),
	},
});

var router = express.Router();
router.get('/', jsonapify.enumerate(userResource, {
	middleware: [
		auth.authenticateAccessToken(),
		auth.requirePrivilege('user:enum'),
		jsonapify.errorHandler(),
	],
});

module.exports = exports = router;
exports.Resource = userResource;
```
