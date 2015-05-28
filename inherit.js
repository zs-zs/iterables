'use strict';

module.exports.mixin = function mixin(target, source) {
	for (var key in source) {
		if(source.hasOwnProperty(key)) {
			target[key] = source[key];
		}
	}
};
