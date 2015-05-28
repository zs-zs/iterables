/*eslint no-undef:0*/
/*eslint no-unused-expressions:0*/
/*eslint no-new:0*/
'use strict';

var expect = require('chai').expect;
var commonIteratorFunctionalityTests = require('./commonIteratorFunctionalityTests');
var Iterator = require('../iterator');
var TestUtils = require('./testUtils');

describe('Iterator', function(){
	var createTestContext = function createTestContext() {
		// generate items from sequence 1, 2, ..., max, endOfIteration, ...
		var sequenceGenerator = function(max, getValue) {
			return function() {
				//noinspection JSPotentiallyInvalidUsageOfThis
				if(typeof this.iterations === 'undefined') {
					//noinspection JSPotentiallyInvalidUsageOfThis
					this.iterations = 0;
				}
				//noinspection JSPotentiallyInvalidUsageOfThis
				if(++this.iterations <= max) {
					//noinspection JSPotentiallyInvalidUsageOfThis
					return { value: getValue(this.iterations), hasValue: true };
				}
				return Iterator.endOfIteration;
			};
		};

		var getObjectSequence = function(max) {
			var result = [];
			for (var i = 0; i < max; i++) {
				result.push({
					value: i + 1,
					someProperty: 'This is some property for item ' + (i + 1)
				});
			}
			return result;
		};

		var ctx = {};
		ctx.numberSequenceMax = 100;

		ctx.numberSequenceIterator =
			new Iterator(sequenceGenerator(ctx.numberSequenceMax, function getValue(number) {
				return number;
			}));

		ctx.objectsSequenceInArray = getObjectSequence(ctx.numberSequenceMax);

		ctx.objectSequenceIterator =
			new Iterator(sequenceGenerator(ctx.numberSequenceMax, function getValue(number) {
				if (number - 1 < ctx.objectsSequenceInArray.length) {
					return ctx.objectsSequenceInArray[number - 1];
				} else {
					return Iterator.endOfIteration;
				}
			}));

		ctx.mapToEmptyIteration = function() {
			return new Iterator(function getValue() {
				return Iterator.endOfIteration;
			});
		};

		ctx.selectManyIterator =
			new Iterator(sequenceGenerator(3, function getValue(number) {
				return number;
			}));

		ctx.selectManyMapNumberToIterable = function(number) {
			return new Iterator(sequenceGenerator(number, function getValue(innerNumber) {
				return 'Item ' + number + '.' + innerNumber;
			}));
		};
		return ctx;
	};

	describe('+ctor', function(){
		it('should create an Iterator from a generator function', function(){
			var iterator = new Iterator(function getNext() {});
			expect(iterator).to.not.be.undefined;
			expect(iterator).to.be.instanceOf(Iterator);
		});
	});

	describe('~extend', function() {
		it('should return a constructor which extends Iterator', function() {
			var ExtendedIterator = Iterator.extend();
			expect(ExtendedIterator).to.be.a('function');
			var instance = new ExtendedIterator();
			expect(instance).to.be.instanceOf(Iterator);
			expect(instance).to.be.instanceOf(ExtendedIterator);
		});

		describe('parameter object', function() {
			describe('create property', function() {
				describe('it should be a function', TestUtils.NothingToTest);
				describe('it should return a function generating the next element', TestUtils.NothingToTest);
			});
		});

		describe('the resulting constructor', function() {
			it('should take `create` into account when creating new extended iterator instances', function() {
				var createWasCalled = false;
				var ExtendedIterator = Iterator.extend({
					create: function() {
						createWasCalled = true;
					}
				});
				// create a new instance:
				new ExtendedIterator();
				expect(createWasCalled).to.be.true;
			});

			it('should pass its arguments to `create` when creating new extended iterator instances', function() {
				var arg1, arg2, arg3;
				var ExtendedIterator = Iterator.extend({
					create: function(a1, a2, a3) {
						arg1 = a1;
						arg2 = a2;
						arg3 = a3;
					}
				});
				// create a new instance:
				new ExtendedIterator(1, 2, 3);
				expect(arg1).to.be.equal(1);
				expect(arg2).to.be.equal(2);
				expect(arg3).to.be.equal(3);
			});

			it('should call `create` with the context of the new instance', function() {
				var createContext;
				var ExtendedIterator = Iterator.extend({
					create: function() {
						createContext = this;
					}
				});
				var instance = new ExtendedIterator();
				expect(createContext).to.be.equal(instance);
			});
		});
	});

	describe('common Iterator functionality', function() {
		commonIteratorFunctionalityTests.testCommonBehaviour(createTestContext);
	});
});
