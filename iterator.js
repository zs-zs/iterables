'use strict';

var _ = require('lodash');
var f = require('./functionDecorators');
var inherit = require('./inherit');

function Iterator(getNext) {
	this.getNext = getNext;
}

Iterator.endOfIteration = {
	value: undefined,
	hasValue: false
};

Iterator.prototype.endOfIteration = Iterator.endOfIteration;

Iterator.prototype.pipe = function pipe(getNextFactory) {
	var targetIterator = this.clone();
	targetIterator.sourceIterator = this.clone();
	targetIterator.getNext = getNextFactory.call(targetIterator);
	return targetIterator;
};

Iterator.prototype.clone = function clone() {
	var SameIterator = this.constructor;
	var cloneInstance = Object.create(SameIterator.prototype);
	for (var propertyName in this) {
		if(this.hasOwnProperty(propertyName)) {
			cloneInstance[propertyName] = this[propertyName];
		}
	}
	if(cloneInstance.sourceIterator) {
		cloneInstance.sourceIterator = cloneInstance.sourceIterator.clone();
	}
	return cloneInstance;
};

Iterator.prototype.where = function where(predicate) {
	return this.pipe(function() {
		var item;
		return function getNext() {
			while((item = this.sourceIterator.getNext()).hasValue) {
				if(predicate(item.value)) {
					return item;
				}
			}
			return this.sourceIterator.endOfIteration;
		};
	});
};

Iterator.prototype.at = function at(indexOrIndexes) {
	var indexes = indexOrIndexes;
	if(_.isNumber(indexOrIndexes)) {
		indexes = [indexOrIndexes];
	}
	indexes.sort(function(a, b) { return a - b; });
	return this.pipe(function() {
		var item,
			index = -1;
		return function getNext() {
			while((item = this.sourceIterator.getNext()).hasValue) {
				index++;
				if(_.contains(indexes, index)) {
					return item;
				}
			}
			return this.sourceIterator.endOfIteration;
		};
	});
};

Iterator.prototype.nth = function nth(index) {
	return this.at(index).first();
};

Iterator.prototype.filter = function filter(values) {
	return this.where(function(item) {
		return _.contains(values, item);
	});
};

Iterator.prototype.filterValues = function filterValues(values) {
	return this.where(function(item) {
		return _.any(values, function(v) {
			//Performs a deep value comparison instead of '==='
			return _.isEqual(item, v);
		});
	});
};

Iterator.prototype.skipWhile = function skipWhile(predicate) {
	return this.pipe(function() {
		var item, hasAlreadySkipped = false;
		return function getNext() {
			if(!hasAlreadySkipped) {
				while((item = this.sourceIterator.getNext()).hasValue && predicate(item.value)) {}
				hasAlreadySkipped = true;
				return item;
			}

			while((item = this.sourceIterator.getNext()).hasValue) {
				return item;
			}
			return this.sourceIterator.endOfIteration;
		};
	});
};

Iterator.prototype.skip = function skip(numberToSkip) {
	var skippedItems = 0;
	return this.skipWhile(function() {
		return skippedItems++ < numberToSkip;
	});
};

Iterator.prototype.takeWhile = function takeWhile(predicate) {
	return this.pipe(function() {
		var item, hasAlreadyTaken = false;
		return function getNext() {
			if(!hasAlreadyTaken) {
				while((item = this.sourceIterator.getNext()).hasValue && predicate(item.value)) {
					return item;
				}
				hasAlreadyTaken = true;
			}
			return this.sourceIterator.endOfIteration;
		};
	});
};

Iterator.prototype.take = function(numberToTake) {
	var taken = 0;
	return this.takeWhile(function() {
		return taken++ < numberToTake;
	});
};

Iterator.prototype.pop = function() {
	var item = this.getNext();
	return item.hasValue ? item.value : undefined;
};

Iterator.prototype.first = function() {
	return this.clone().pop();
};

Iterator.prototype.combine = function combine(iteratorOrIterators) {
	var iterators = _.isArray(iteratorOrIterators) ? iteratorOrIterators : [iteratorOrIterators];
	return this.pipe(function() {
		iterators.unshift(this.sourceIterator);
		var iteratorClones = _.map(iterators, function(iterator) {
			return iterator.clone();
		});

		var activeCombination = [];

		var getFirstCombination = function getFirstCombination() {
			var hadEmptyComponent = false;
			activeCombination = _.map(iteratorClones, function(iterator) {
				var item = iterator.getNext();
				if(!item.hasValue) {
					hadEmptyComponent = true;
				}
				return item.value;
			});
			return {
				hasValue: !hadEmptyComponent,
				value: Array.apply([], activeCombination)
			};
		};
		var getNextCombination = function getNextCombination() {
			var incrementIndex = iteratorClones.length - 1,
				iteratorToIncrement = iteratorClones[incrementIndex],
				nextItem;
			while(incrementIndex >= 0 && !(nextItem = iteratorToIncrement.getNext()).hasValue) {
				iteratorClones[incrementIndex] = iterators[incrementIndex].clone();
				activeCombination[incrementIndex] = iteratorClones[incrementIndex].getNext().value;
				incrementIndex--;
				iteratorToIncrement = iteratorClones[incrementIndex];
			}
			if(incrementIndex >= 0) {
				activeCombination[incrementIndex] = nextItem.value;
			}
			return {
				hasValue: incrementIndex >= 0,
				value: Array.apply([], activeCombination)
			};
		};
		var isFirstCombination = true;

		return function getNext() {
			if(isFirstCombination) {
				var firstCombination = getFirstCombination();
				isFirstCombination = false;
				return firstCombination;
			}

			return getNextCombination();
		};
	});
};

Iterator.prototype.select = function select(getItem) {
	return this.pipe(function() {
		return function getNext() {
			var item = this.sourceIterator.getNext();
			if(!item.hasValue) {
				return this.sourceIterator.endOfIteration;
			}

			return {
				value: getItem(item.value),
				hasValue: true
			};
		};
	});
};

Iterator.prototype.selectMany = function selectMany(getIterable) {
	return this.pipe(function() {
		var activeSourceItem, iterable;

		return function getNext() {
			if(iterable) {
				var itemToReturn = iterable.getNext();
				if(itemToReturn.hasValue) {
					return itemToReturn;
				}
			}

			do {
				activeSourceItem = this.sourceIterator.getNext();
				if(activeSourceItem.hasValue) {
					iterable = getIterable(activeSourceItem.value);
					itemToReturn = iterable.getNext();
				} else {
					itemToReturn = Iterator.endOfIteration;
				}
			} while(activeSourceItem.hasValue && !itemToReturn.hasValue);

			return itemToReturn;
		};
	});
};

var emptyIterationGenerator = function getNext() {
	return Iterator.endOfIteration;
};

Iterator.create = function create() {
	return emptyIterationGenerator;
};

Iterator.extend = function(opts) {
	var IteratorType = this,
		create = f.maybe(opts, 'create') || IteratorType.create;

	var ExtendedIterator = function() {
		var getNext;
		if(create) {
			getNext = create.apply(this, _.toArray(arguments));
		} else {
			getNext = emptyIterationGenerator;
		}
		Iterator.call(this, getNext);
	};
	ExtendedIterator.prototype = _.create(IteratorType.prototype, { 'constructor': ExtendedIterator });

	var additionalMembers = _.omit(opts, 'create');
	inherit.mixin(ExtendedIterator.prototype, additionalMembers);

	ExtendedIterator.create = create;
	ExtendedIterator.extend = IteratorType.extend;
	return ExtendedIterator;
};

module.exports = Iterator;
