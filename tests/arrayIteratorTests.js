/*eslint no-undef:0*/
/*eslint camelcase:0*/
/*eslint no-unused-expressions:0*/
'use strict';

var expect = require('chai').expect;
var _ = require('lodash');
var commonIteratorFunctionalityTests = require('./commonIteratorFunctionalityTests');
var Iterator = require('../iterator');
var ArrayIterator = require('../arrayIterator');

describe('ArrayIterator', function(){

	var createTestContext = function createTestContext() {
		var ctx = {};
		ctx.numberSequenceMax = 100;

		// generate items from sequence 1, 2, ..., max
		var sequence = _.range(1, ctx.numberSequenceMax + 1);
		var objectSequence = _.map(sequence, function(item) {
			return {
				value: item + 1,
				someProperty: 'This is some property for item ' + (item + 1)
			};
		});

		ctx.numberSequenceIterator = new ArrayIterator(sequence);

		ctx.objectsSequenceInArray = objectSequence;

		ctx.objectSequenceIterator = new ArrayIterator(objectSequence);

		ctx.mapToEmptyIteration = function() {
			return new ArrayIterator(function getValue() {
				return Iterator.endOfIteration;
			});
		};

		ctx.selectManyIterator = new ArrayIterator([1, 2, 3]);

		ctx.selectManyMapNumberToIterable = function(number) {
			return new ArrayIterator(
				_.map(
					_.range(1, number + 1),
					function(innerNumber) {
						return 'Item ' + number + '.' + innerNumber;
					})
			);
		};
		return ctx;
	};

	it('extends Iterator', function() {
		var arrayIterator = new ArrayIterator([1, 2, 3, 4]);
		expect(arrayIterator).to.be.instanceOf(Iterator);
		expect(arrayIterator).to.be.instanceOf(ArrayIterator);
	});

	it('should be extendable too', function() {
		var ExtendedArrayIterator = ArrayIterator.extend({
			meaningOfLife: function() {
				return 42;
			}
		});
		var instance = new ExtendedArrayIterator([1, 2, 3, 4]);
		expect(instance).to.be.instanceOf(Iterator);
		expect(instance).to.be.instanceOf(ArrayIterator);
		expect(instance).to.be.instanceOf(ExtendedArrayIterator);

		var first = instance.first();
		expect(first).to.be.equal(1);

		var m = instance.meaningOfLife();
		expect(m).to.be.equal(42);
	});

	describe('+ctor', function(){
		it('should create an ArrayIterator from an array', function(){
			var a = new ArrayIterator([1, 2, 3, 4]);
			expect(a).to.not.be.undefined;
		});
	});

	it('should iterate over the elements of an array', function() {
		var arrayIterator = new ArrayIterator([1, 2, 3]);
		var item1 = arrayIterator.getNext();
		expect(item1).to.eql({hasValue: true, value: 1});

		var item2 = arrayIterator.getNext();
		expect(item2).to.eql({hasValue: true, value: 2});

		var item3 = arrayIterator.getNext();
		expect(item3).to.eql({hasValue: true, value: 3});

		var endOfIteration = arrayIterator.getNext();
		expect(endOfIteration.hasValue).to.be.false;
	});

	it('should support chaining', function() {
		var arrayIterator = new ArrayIterator([1, 2, 3, 4, 5, 6]);
		var e = arrayIterator.filter([1, 2, 3, 4, 5]).filterValues([2, 3, 4]).where(function(value) {
			return value >= 3;
		}).at([1]).pop();
		expect(e).to.be.equal(4);
	});

	it('should not modify the original state of the iteration when using chaining', function() {
		var numbers = new ArrayIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		var evenNumbers = numbers.where(function(value) {
			return (value % 2) === 0;
		});
		var oddNumbers = numbers.where(function(value) {
			return (value % 2) === 1;
		});
		var firstEven = evenNumbers.pop();
		var firstOdd = oddNumbers.pop();
		var firstNumber = numbers.pop();
		expect(firstNumber, 'first number is not 1').to.be.equal(1);
		expect(firstEven, 'first even is not 2').to.be.equal(2);
		expect(firstOdd, 'first odd is not 1').to.be.equal(1);
	});

	describe('#combineWith', function() {
		it('should return a new Iterator', function() {
			var arrayIterator = new ArrayIterator([1, 2, 3]);
			var combinedIterator = arrayIterator.combineWith([1, 2, 3]);
			expect(combinedIterator).to.be.not.equal(arrayIterator);
			expect(combinedIterator).to.be.instanceOf(Iterator);
		});

		it('should iterate over the items of the Descartes-product of the given array components', function() {
			var numbersBetween1And3 = new ArrayIterator([1, 2, 3]);
			var combinedIterator = numbersBetween1And3.combineWith([1, 2]);
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

		it('should iterate over the Descartes-product of multiple arrays', function() {
			var numbers1_2 = new ArrayIterator([1, 2]);
			var combinedIterator = numbers1_2.combineWith([40, 50], [99], [80, 90]);

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
			var numbers1_2 = new ArrayIterator([1, 2]);
			var combinedIterator = numbers1_2.combineWith([40, 50], [], [80, 90]);
			var endOfIteration = combinedIterator.getNext();
			expect(endOfIteration).to.have.property('hasValue').and.equal(false);
		});

		it('should return an empty iteration for an empty component #2', function() {
			var emptyComponent = new ArrayIterator([]);
			var combinedIterator = emptyComponent.combineWith([1, 2], [40, 50], [80, 90]);
			var endOfIteration = combinedIterator.getNext();
			expect(endOfIteration).to.have.property('hasValue').and.equal(false);
		});
	});

	describe('common Iterator functionality', function() {
		// we have to test that the base functionality is still correct
		commonIteratorFunctionalityTests.testCommonBehaviour(createTestContext);
	});
});
