const PlaceKitten = require('../lib/placekitten');
const nock = require('nock');
const url = require('url');

describe('PlaceKitten', () => {

	describe('constructor', () => {
		test('should only accept positive integers for the width parameter', () => {
			expect(() => new PlaceKitten(2, 100)).not.toThrow();
			expect(() => new PlaceKitten(20, 100)).not.toThrow();
			expect(() => new PlaceKitten(2e12, 100)).not.toThrow();

			let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
			unacceptable.forEach((width) => {
				expect(() => new PlaceKitten(width, 100)).toThrow();
			});
		});

		test('should only accept positive integers for the height parameter', () => {
			expect(() => new PlaceKitten(100, 2)).not.toThrow();
			expect(() => new PlaceKitten(100, 20)).not.toThrow();
			expect(() => new PlaceKitten(100, 2e12)).not.toThrow();

			let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
			unacceptable.forEach((height) => {
				expect(() => new PlaceKitten(100, height)).toThrow();
			});
		});

		test('should only accept booleans for the grayscale parameter', () => {
			expect(() => new PlaceKitten(100, 100, true)).not.toThrow();
			expect(() => new PlaceKitten(100, 100, false)).not.toThrow();

			let unacceptable = [null, 'string', 0, 1, -1, 3.14, [], {}];
			unacceptable.forEach((grayscale) => {
				expect(() => new PlaceKitten(100, 100, grayscale)).toThrow();
			});
		});

		test('should allow the grayscale parameter to be omitted', () => {
			expect(() => new PlaceKitten(100, 100)).not.toThrow();
			expect(() => new PlaceKitten(100, 100, undefined)).not.toThrow();
		});
	});

	describe('.toString()', () => {
		test('should return a string', () => {
			let str = new PlaceKitten(100, 100).toString();
			expect(typeof str).toBe('string');
		});

		test('should return a valid URL for colored images', () => {
			let result = url.parse(new PlaceKitten(100, 100).toString());
			expect(result.protocol).toBe('http:');
			expect(result.hostname).toBe('placekitten.com');
			expect(result.pathname).toBe('/100/100');
		});

		test('should return a valid URL for grayscale images', () => {
			let result = url.parse(new PlaceKitten(100, 100, true).toString());
			expect(result.protocol).toBe('http:');
			expect(result.hostname).toBe('placekitten.com');
			expect(result.pathname).toBe('/g/100/100');
		});
	});

	describe('.fetch()', () => {
		const imageData = '<mock image data>';

		beforeEach(function() {
			nock('http://placekitten.com').get('/100/100').reply(200, imageData);
		});

		afterAll(function() {
			nock.cleanAll();
			nock.restore();
		});

		test('should return a promise', () => {
			let promise = new PlaceKitten(100, 100).fetch();
			expect(promise).toBeInstanceOf(Promise);
		});

		test('should return a promise that resolves with a buffer', () => {
			return new PlaceKitten(100, 100).fetch().then((buffer) => {
				expect(buffer).toBeInstanceOf(Buffer);
			}, (error) => {
				assert.fail();
			});
		});

		test('should return a promise that resolves with a buffer containing image data', () => {
			return new PlaceKitten(100, 100).fetch().then((buffer) => {
				let contents = buffer.toString('binary');
				expect(contents).toBe(imageData);
			}, (error) => {
				assert.fail();
			});
		});
	});

});
