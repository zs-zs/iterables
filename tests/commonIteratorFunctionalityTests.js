/*eslint no-undef:0*/
/*eslint camelcase:0*/
/*eslint no-unused-expressions:0*/
'use strict';

var expect = require('chai').expect;
var Iterator = require('../iterator');

module.exports.testCommonBehaviour = function testCommonBehaviour(createContext) {
	var ctx;

	beforeEach(function() {
		ctx = createContext();
	});

	var enumerateAllNumbersAndReturnLast = function() {
		var nextItem;
		for (var i = 1; i <= ctx.numberSequenceMax + 1; i++) {
			nextItem = ctx.numberSequenceIterator.getNext();
		}
		return nextItem;
	};

	describe('#getNext', function() {
		it('should return the next item', function() {
			var nextItem = ctx.numberSequenceIterator.getNext();
			expect(nextItem).to.have.property('value');
			expect(nextItem).to.have.property('hasValue');
		});

		it('should return an item with no value at the end of the iteration', function() {
			var lastItem = enumerateAllNumbersAndReturnLast();
			expect(lastItem).to.have.property('hasValue').and.equal(false);
		});
	});

	describe('#where', function() {
		var filteredNumberIterator;

		beforeEach(function() {
			filteredNumberIterator = ctx.numberSequenceIterator.where(function(number) {
				return number === 10 || number === 20;
			});
		});

		it('should return a new Iterator', function() {
			expect(filteredNumberIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(filteredNumberIterator).to.be.instanceOf(Iterator);
		});

		it('should filter an iterator by a given predicate', function() {
			var item10 = filteredNumberIterator.getNext();
			expect(item10).to.eql({hasValue: true, value: 10});

			var item20 = filteredNumberIterator.getNext();
			expect(item20).to.eql({hasValue: true, value: 20});

			var endOfIteration = filteredNumberIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});
	});

	describe('#at', function() {
		var filteredNumberIterator;

		beforeEach(function() {
			filteredNumberIterator = ctx.numberSequenceIterator.at([0, 2, 4]);
		});

		it('should return a new Iterator', function() {
			expect(filteredNumberIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(filteredNumberIterator).to.be.instanceOf(Iterator);
		});

		it('should filter an iterator by a given array of indexes (zero-based indexing)', function() {
			var itemAtIndex0 = filteredNumberIterator.getNext();
			expect(itemAtIndex0).to.eql({hasValue: true, value: 1});

			var itemAtIndex2 = filteredNumberIterator.getNext();
			expect(itemAtIndex2).to.eql({hasValue: true, value: 3});

			var itemAtIndex4 = filteredNumberIterator.getNext();
			expect(itemAtIndex4).to.eql({hasValue: true, value: 5});

			var endOfIteration = filteredNumberIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should filter an iterator by a single index (zero-based indexing)', function() {
			filteredNumberIterator = ctx.numberSequenceIterator.at(0);

			var itemAtIndex0 = filteredNumberIterator.getNext();
			expect(itemAtIndex0).to.eql({hasValue: true, value: 1});

			var endOfIteration = filteredNumberIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should return empty sequence when index is out of range', function() {
			filteredNumberIterator = ctx.numberSequenceIterator.at(100);
			var endOfIteration = filteredNumberIterator.getNext();
			expect(endOfIteration).to.have.property('hasValue').and.equal(false);
		});
	});

	describe('#nth', function() {
		it('should return the item of the given index (zero-based indexing)', function() {
			var fifth = ctx.numberSequenceIterator.nth(4);
			expect(fifth).to.eql(5);
		});
		it('should return undefined when index is out of range', function() {
			var undefinedItem = ctx.numberSequenceIterator.nth(100);
			expect(undefinedItem).to.be.undefined;
		});
	});

	describe('#filter', function() {
		var filteredNumberIterator;

		beforeEach(function() {
			filteredNumberIterator = ctx.numberSequenceIterator.filter([10, 20]);
		});

		it('should return a new Iterator', function() {
			expect(filteredNumberIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(filteredNumberIterator).to.be.instanceOf(Iterator);
		});

		it('should filter an iterator by a given array of values', function() {
			var item10 = filteredNumberIterator.getNext();
			expect(item10).to.eql({hasValue: true, value: 10});

			var item20 = filteredNumberIterator.getNext();
			expect(item20).to.eql({hasValue: true, value: 20});

			var endOfIteration = filteredNumberIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should filter an iterator by reference equality', function() {
			var filteredObjectIteratorByReferenceEquality = ctx.objectSequenceIterator.filter([
				ctx.objectsSequenceInArray[10],
				ctx.objectsSequenceInArray[20]
			]);

			var item10 = filteredObjectIteratorByReferenceEquality.getNext();
			expect(item10).to.have.property('hasValue').and.equal(true);
			expect(item10).to.have.property('value').and.equal(ctx.objectsSequenceInArray[10]);

			var item20 = filteredObjectIteratorByReferenceEquality.getNext();
			expect(item20).to.have.property('hasValue').and.equal(true);
			expect(item20).to.have.property('value').and.equal(ctx.objectsSequenceInArray[20]);

			var endOfIteration = filteredObjectIteratorByReferenceEquality.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should not filter an iterator by deep equality', function() {
			var filteredObjectIteratorByDeepEquality = ctx.objectSequenceIterator.filter([
				{value: 10, someProperty: 'This is some property for item 10'},
				{value: 20, someProperty: 'This is some property for item 20'}
			]);

			var endOfIteration = filteredObjectIteratorByDeepEquality.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});
	});

	describe('#filterValues', function() {
		var filteredNumberIterator;

		beforeEach(function() {
			filteredNumberIterator = ctx.numberSequenceIterator.filterValues([10, 20]);
		});

		it('should return a new Iterator', function() {
			expect(filteredNumberIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(filteredNumberIterator).to.be.instanceOf(Iterator);
		});

		it('should filter an iterator by a given array of values', function() {
			var item10 = filteredNumberIterator.getNext();
			expect(item10).to.eql({hasValue: true, value: 10});

			var item20 = filteredNumberIterator.getNext();
			expect(item20).to.eql({hasValue: true, value: 20});

			var endOfIteration = filteredNumberIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should filter an iterator by deep equality', function() {
			var filteredObjectIteratorByDeepEquality = ctx.objectSequenceIterator.filterValues([
				{value: 10, someProperty: 'This is some property for item 10'},
				{value: 20, someProperty: 'This is some property for item 20'}
			]);

			var item10 = filteredObjectIteratorByDeepEquality.getNext();
			expect(item10).to.eql({
				hasValue: true,
				value: {value: 10, someProperty: 'This is some property for item 10'}
			});

			var item20 = filteredObjectIteratorByDeepEquality.getNext();
			expect(item20).to.eql({
				hasValue: true,
				value: {value: 20, someProperty: 'This is some property for item 20'}
			});

			var endOfIteration = filteredObjectIteratorByDeepEquality.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});
	});

	describe('#skipWhile', function() {
		var skipWhileIterator;

		beforeEach(function() {
			skipWhileIterator = ctx.numberSequenceIterator.skipWhile(function(number) {
				return number < 10;
			});
		});

		it('should return a new Iterator', function() {
			expect(skipWhileIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(skipWhileIterator).to.be.instanceOf(Iterator);
		});

		it('should return an iterator which bypasses elements from its source as long as the specified condition is true', function() {
			var item10 = skipWhileIterator.getNext();
			expect(item10).to.be.eql({hasValue: true, value: 10});
		});

		it('should return an iterator which returns all elements from its source after the specified condition is not true', function() {
			var shortSkipWhileIterator = skipWhileIterator.where(function(number) {
				return number < 13;
			});

			var item10 = shortSkipWhileIterator.getNext();
			expect(item10).to.be.eql({hasValue: true, value: 10});
			var item11 = shortSkipWhileIterator.getNext();
			expect(item11).to.be.eql({hasValue: true, value: 11});
			var item12 = shortSkipWhileIterator.getNext();
			expect(item12).to.be.eql({hasValue: true, value: 12});
			var endOfIteration = shortSkipWhileIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should not bypass elements from its source after the specified condition is not true', function() {
			var iterator = ctx.numberSequenceIterator.skipWhile(function(number) {
				return number % 2 === 1;
			});
			var item2 = iterator.getNext();
			expect(item2).to.be.eql({hasValue: true, value: 2});
			var item3 = iterator.getNext();
			expect(item3).to.be.eql({hasValue: true, value: 3});
			var item4 = iterator.getNext();
			expect(item4).to.be.eql({hasValue: true, value: 4});
			var item5 = iterator.getNext();
			expect(item5).to.be.eql({hasValue: true, value: 5});
		});
	});

	describe('#skip', function() {
		var skipIterator;

		beforeEach(function() {
			skipIterator = ctx.numberSequenceIterator.skip(2);
		});

		it('should return a new Iterator', function() {
			expect(skipIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(skipIterator).to.be.instanceOf(Iterator);
		});

		it('should return an iterator which bypasses given number of elements from its source', function() {
			var item3 = skipIterator.getNext();
			expect(item3).to.be.eql({hasValue: true, value: 3});
		});

		it('should return an iterator which returns all elements from its source after the bypassed elements', function() {
			var shortSkipIterator = skipIterator.where(function(number) {
				return number < 5;
			});

			var item3 = shortSkipIterator.getNext();
			expect(item3).to.be.eql({hasValue: true, value: 3});
			var item4 = shortSkipIterator.getNext();
			expect(item4).to.be.eql({hasValue: true, value: 4});
			var endOfIteration = shortSkipIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});
	});

	describe('#takeWhile', function() {
		var takeWhileIterator;

		beforeEach(function() {
			takeWhileIterator = ctx.numberSequenceIterator.takeWhile(function(number) {
				return number < 3;
			});
		});

		it('should return a new Iterator', function() {
			expect(takeWhileIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(takeWhileIterator).to.be.instanceOf(Iterator);
		});

		it('should return an iterator which returns elements from its source as long as the specified condition is true', function() {
			var item1 = takeWhileIterator.getNext();
			expect(item1).to.be.eql({hasValue: true, value: 1});
			var item2 = takeWhileIterator.getNext();
			expect(item2).to.be.eql({hasValue: true, value: 2});
			var endOfIteration = takeWhileIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should return an iterator which ends after the specified condition is not true', function() {
			var emptyIterator = takeWhileIterator.takeWhile(function() {
				return false;
			});
			var endOfIteration = emptyIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;

			endOfIteration = emptyIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});
	});

	describe('#take', function() {
		var takeIterator;

		beforeEach(function() {
			takeIterator = ctx.numberSequenceIterator.take(2);
		});

		it('should return a new Iterator', function() {
			expect(takeIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(takeIterator).to.be.instanceOf(Iterator);
		});

		it('should return an iterator which returns given number of elements from the beginning of its source', function() {
			var item3 = takeIterator.getNext();
			expect(item3).to.be.eql({hasValue: true, value: 1});
			var item4 = takeIterator.getNext();
			expect(item4).to.be.eql({hasValue: true, value: 2});
			var endOfIteration = takeIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should return an iterator which ends after the given numer of elements returned from its input', function() {
			var shortTakeIterator = takeIterator.take(0);

			var endOfIteration = shortTakeIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
			endOfIteration = shortTakeIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});
	});

	describe('#pop', function() {
		it('should return the next value of the iteration', function() {
			var next = ctx.numberSequenceIterator.pop();
			expect(next).to.be.equal(1);
		});

		it('should enumerate (remove) the next value', function() {
			var next = ctx.numberSequenceIterator.pop();
			var nextNext = ctx.numberSequenceIterator.pop();
			expect(next).to.be.equal(1);
			expect(nextNext).to.be.equal(2);
		});

		it('should return undefined at the end of the iteration', function() {
			enumerateAllNumbersAndReturnLast();
			var next = ctx.numberSequenceIterator.pop();
			expect(next).to.be.undefined;
		});
	});

	describe('#first', function() {
		it('should return the first value of the iteration', function() {
			var first = ctx.numberSequenceIterator.first();
			expect(first).to.be.equal(1);
		});

		it('should return undefined on empty iterations', function() {
			enumerateAllNumbersAndReturnLast();
			var first = ctx.numberSequenceIterator.first();
			expect(first).to.be.undefined;
		});
	});

	describe('#combine', function() {
		it('should return a new Iterator', function() {
			var combinedIterator = ctx.numberSequenceIterator
				.combine(ctx.numberSequenceIterator);
			expect(combinedIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(combinedIterator).to.be.instanceOf(Iterator);
		});

		it('should iterate over the items of the Descartes-product of the given components', function() {
			var numbersBetween1And3 = ctx.numberSequenceIterator.where(function(i) {
				return 1 <= i && i <= 3;
			});
			var numbersBetween1And2 = ctx.numberSequenceIterator.where(function(i) {
				return 1 <= i && i <= 2;
			});
			var combinedIterator = numbersBetween1And3.combine(numbersBetween1And2);
			var item11 = combinedIterator.getNext();
			var item12 = combinedIterator.getNext();
			var item21 = combinedIterator.getNext();
			var item22 = combinedIterator.getNext();
			var item31 = combinedIterator.getNext();
			var item32 = combinedIterator.getNext();
			var endOfIteration = combinedIterator.getNext();
			expect(item11).to.be.eql({hasValue: true, value: [1, 1]});
			expect(item12).to.be.eql({hasValue: true, value: [1, 2]});
			expect(item21).to.be.eql({hasValue: true, value: [2, 1]});
			expect(item22).to.be.eql({hasValue: true, value: [2, 2]});
			expect(item31).to.be.eql({hasValue: true, value: [3, 1]});
			expect(item32).to.be.eql({hasValue: true, value: [3, 2]});
			expect(endOfIteration).to.have.property('hasValue').and.equal(false);
		});

		it('should iterate over the Descartes-product of multiple iterable components', function() {
			var numbers1_2 = ctx.numberSequenceIterator.filter([1, 2]);
			var numbers40_50 = ctx.numberSequenceIterator.filter([40, 50]);
			var number99 = ctx.numberSequenceIterator.filter([99]);
			var numbers80_90 = ctx.numberSequenceIterator.filter([80, 90]);
			var combinedIterator = numbers1_2.combine([numbers40_50, number99, numbers80_90]);

			var item1 = combinedIterator.getNext();
			var item2 = combinedIterator.getNext();
			var item3 = combinedIterator.getNext();
			var item4 = combinedIterator.getNext();
			var item5 = combinedIterator.getNext();
			var item6 = combinedIterator.getNext();
			var item7 = combinedIterator.getNext();
			var item8 = combinedIterator.getNext();
			var endOfIteration = combinedIterator.getNext();

			expect(item1).to.be.eql({hasValue: true, value: [1, 40, 99, 80]});
			expect(item2).to.be.eql({hasValue: true, value: [1, 40, 99, 90]});
			expect(item3).to.be.eql({hasValue: true, value: [1, 50, 99, 80]});
			expect(item4).to.be.eql({hasValue: true, value: [1, 50, 99, 90]});
			expect(item5).to.be.eql({hasValue: true, value: [2, 40, 99, 80]});
			expect(item6).to.be.eql({hasValue: true, value: [2, 40, 99, 90]});
			expect(item7).to.be.eql({hasValue: true, value: [2, 50, 99, 80]});
			expect(item8).to.be.eql({hasValue: true, value: [2, 50, 99, 90]});
			expect(endOfIteration).to.have.property('hasValue').and.equal(false);
		});

		it('should return an empty iteration for an empty component', function() {
			var numbers1_2 = ctx.numberSequenceIterator.filter([1, 2]);
			var numbers40_50 = ctx.numberSequenceIterator.filter([40, 50]);
			var emptyComponent = ctx.numberSequenceIterator.filter([99999]);
			var numbers80_90 = ctx.numberSequenceIterator.filter([80, 90]);
			var combinedIterator = numbers1_2.combine([numbers40_50, emptyComponent, numbers80_90]);
			var endOfIteration = combinedIterator.getNext();
			expect(endOfIteration).to.have.property('hasValue').and.equal(false);
		});

		it('should return an empty iteration for an empty component #2', function() {
			var emptyComponent = ctx.numberSequenceIterator.filter([99999]);
			var numbers1_2 = ctx.numberSequenceIterator.filter([1, 2]);
			var numbers40_50 = ctx.numberSequenceIterator.filter([40, 50]);
			var numbers80_90 = ctx.numberSequenceIterator.filter([80, 90]);
			var combinedIterator = emptyComponent.combine([numbers1_2, numbers40_50, numbers80_90]);
			var endOfIteration = combinedIterator.getNext();
			expect(endOfIteration).to.have.property('hasValue').and.equal(false);
		});
	});

	describe('#select', function() {
		var identityMapping = function (item) {
			return item;
		};
		var numberMapping = function(number) {
			return 'Number: ' + number;
		};

		it('should return a new Iterator', function() {
			var mappedIterator = ctx.numberSequenceIterator
				.select(identityMapping);
			expect(mappedIterator).to.be.not.equal(ctx.numberSequenceIterator);
			expect(mappedIterator).to.be.instanceOf(Iterator);
		});

		it('should map every value returned by the source iterator to another value', function() {
			var mappedIterator = ctx.numberSequenceIterator
				.select(numberMapping);
			var item1 = mappedIterator.getNext();
			var item2 = mappedIterator.getNext();
			var item3 = mappedIterator.getNext();
			expect(item1).to.eql({hasValue: true, value: 'Number: 1'});
			expect(item2).to.eql({hasValue: true, value: 'Number: 2'});
			expect(item3).to.eql({hasValue: true, value: 'Number: 3'});
		});

		it('should return an item with no value at the end of the iteration', function() {
			enumerateAllNumbersAndReturnLast();
			var mappedIterator = ctx.numberSequenceIterator
				.select(numberMapping);
			var itemWithNoValue = mappedIterator.getNext();
			expect(itemWithNoValue).to.have.property('hasValue').and.equal(false);
		});
	});

	describe('#selectMany', function() {
		it('should return a new Iterator', function() {
			var mappedIterator = ctx.selectManyIterator
				.selectMany(ctx.selectManyMapNumberToIterable);
			expect(mappedIterator).to.be.not.equal(ctx.selectManyIterator);
			expect(mappedIterator).to.be.instanceOf(Iterator);
		});

		it('should map every value of the iterator to an iterable & flatten the resulting sequence', function() {
			var mappedIterator = ctx.selectManyIterator
				.selectMany(ctx.selectManyMapNumberToIterable);
			var item1_1 = mappedIterator.getNext();
			expect(item1_1).to.eql({hasValue: true, value: 'Item 1.1'});

			var item2_1 = mappedIterator.getNext();
			expect(item2_1).to.eql({hasValue: true, value: 'Item 2.1'});

			var item2_2 = mappedIterator.getNext();
			expect(item2_2).to.eql({hasValue: true, value: 'Item 2.2'});

			var item3_1 = mappedIterator.getNext();
			expect(item3_1).to.eql({hasValue: true, value: 'Item 3.1'});

			var item3_2 = mappedIterator.getNext();
			expect(item3_2).to.eql({hasValue: true, value: 'Item 3.2'});

			var item3_3 = mappedIterator.getNext();
			expect(item3_3).to.eql({hasValue: true, value: 'Item 3.3'});

			var endOfIteration = mappedIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});

		it('should return an iterator of empty sequence if elements are mapped to empty sequences', function() {
			var mappedIterator = ctx.selectManyIterator.selectMany(ctx.mapToEmptyIteration);
			var endOfIteration = mappedIterator.getNext();
			expect(endOfIteration.hasValue).to.be.false;
		});
	});
};
