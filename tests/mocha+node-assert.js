const PlaceKitten = require('../lib/placekitten');
const assert = require('assert');
const nock = require('nock');
const url = require('url');

describe('PlaceKitten', function() {

	describe('constructor', function() {
		it('should only accept positive integers for the width parameter', function() {
			assert.doesNotThrow(() => new PlaceKitten(2, 100));
			assert.doesNotThrow(() => new PlaceKitten(20, 100));
			assert.doesNotThrow(() => new PlaceKitten(2e12, 100));

			let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
			unacceptable.forEach((width) => {
				assert.throws(() => new PlaceKitten(width, 100));
			});
		});

		it('should only accept positive integers for the height parameter', function() {
			assert.doesNotThrow(() => new PlaceKitten(100, 2));
			assert.doesNotThrow(() => new PlaceKitten(100, 20));
			assert.doesNotThrow(() => new PlaceKitten(100, 2e12));

			let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
			unacceptable.forEach((height) => {
				assert.throws(() => new PlaceKitten(100, height));
			});
		});

		it('should only accept booleans for the grayscale parameter', function() {
			assert.doesNotThrow(() => new PlaceKitten(100, 100, true));
			assert.doesNotThrow(() => new PlaceKitten(100, 100, false));

			let unacceptable = [null, 'string', 0, 1, -1, 3.14, [], {}];
			unacceptable.forEach((grayscale) => {
				assert.throws(() => new PlaceKitten(100, 100, grayscale));
			});
		});

		it('should allow the grayscale parameter to be omitted', function() {
			assert.doesNotThrow(() => new PlaceKitten(100, 100));
			assert.doesNotThrow(() => new PlaceKitten(100, 100, undefined));
		});
	});

	describe('.toString()', function() {
		it('should return a string', function() {
			let str = new PlaceKitten(100, 100).toString();
			assert.strictEqual(typeof str, 'string');
		});

		it('should return a valid URL for colored images', function() {
			let result = url.parse(new PlaceKitten(100, 100).toString());
			assert.strictEqual(result.protocol, 'http:');
			assert.strictEqual(result.hostname, 'placekitten.com');
			assert.strictEqual(result.pathname, '/100/100');
		});

		it('should return a valid URL for grayscale images', function() {
			let result = url.parse(new PlaceKitten(100, 100, true).toString());
			assert.strictEqual(result.protocol, 'http:');
			assert.strictEqual(result.hostname, 'placekitten.com');
			assert.strictEqual(result.pathname, '/g/100/100');
		});
	});

	describe('.fetch()', function() {
		const imageData = '<mock image data>';

		beforeEach(function() {
			nock('http://placekitten.com').get('/100/100').reply(200, imageData);
		});

		after(function() {
			nock.cleanAll();
			nock.restore();
		});

		it('should return a promise', function() {
			let promise = new PlaceKitten(100, 100).fetch();
			assert.ok(promise instanceof Promise);
		});

		it('the promise should resolve with a buffer', function(done) {
			new PlaceKitten(100, 100).fetch().then((buffer) => {
				assert.ok(buffer instanceof Buffer);
				done();
			}, (error) => {
				assert.fail();
				done();
			});
		});

		it('the buffer should contain image data', function(done) {
			new PlaceKitten(100, 100).fetch().then((buffer) => {
				let contents = buffer.toString('binary');
				assert.strictEqual(contents, imageData);
				done();
			}, (error) => {
				assert.fail();
				done();
			});
		});
	});

});
