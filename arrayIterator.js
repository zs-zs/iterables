'use strict';

var _ = require('lodash');
var Iterator = require('./iterator');

var ArrayIterator = Iterator.extend({
	create: function create(array) {
		this.i = 0;
		return function getNext() {
			//noinspection JSPotentiallyInvalidUsageOfThis
			var hasValue = this.i < array.length;
			//noinspection JSPotentiallyInvalidUsageOfThis
			return {
				value: hasValue ? array[this.i++] : undefined,
				hasValue: hasValue
			};
		};
	},
	combineWith: function combineWith() {
		var arrayIterators = _.map(arguments, function(array) {
			if(_.isArray(array)) {
				return new ArrayIterator(array);
			}
		});
		return this.combine(arrayIterators);
	}
});

module.exports = ArrayIterator;
