'use strict';

var _ = require('lodash');

module.exports.maybe = function maybe (object, property) {
	if(_.isObject(object)) {
		return object[property];
	}
};
