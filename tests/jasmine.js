const PlaceKitten = require('../lib/placekitten');
const nock = require('nock');
const url = require('url');

describe('PlaceKitten', function() {

	describe('constructor', function() {
		it('should throw an error when width is not a positive integer', function() {
			[0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}].forEach((width) => {
				expect(() => new PlaceKitten(width, 100)).toThrow();
			});
		});
		it('should not throw an error when width is a positive integer', function() {
			[1, 10, 1e12].forEach((width) => {
				expect(() => new PlaceKitten(width, 100)).not.toThrow();
			});
		});
		it('should throw an error when height is not a positive integer', function() {
			[0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}].forEach((height) => {
				expect(() => new PlaceKitten(100, height)).toThrow();
			});
		});
		it('should not throw an error when height is a positive integer', function() {
			[1, 10, 1e12].forEach((height) => {
				expect(() => new PlaceKitten(100, height)).not.toThrow();
			});
		});
		it('should throw an error when grayscale is not a boolean', function() {
			[null, 'string', 0, 1, -1, 3.14, [], {}].forEach((grayscale) => {
				expect(() => new PlaceKitten(100, 100, grayscale)).toThrow();
			});
		});
		it('should not throw an error when grayscale is a boolean', function() {
			expect(() => new PlaceKitten(100, 100, true)).not.toThrow();
			expect(() => new PlaceKitten(100, 100, false)).not.toThrow();
		});
		it('should not throw an error when grayscale is undefined', function() {
			expect(() => new PlaceKitten(100, 100)).not.toThrow();
			expect(() => new PlaceKitten(100, 100, undefined)).not.toThrow();
		});
	});

	describe('.toString()', function() {
		it('should return a string', function() {
			let str = new PlaceKitten(100, 100).toString();
			expect(typeof str).toBe('string');
		});
		it('should return a valid URL for colored images', function() {
			let result = url.parse(new PlaceKitten(100, 100).toString());
			expect(result.protocol).toBe('http:');
			expect(result.hostname).toBe('placekitten.com');
			expect(result.pathname).toBe('/100/100');
		});
		it('should return a valid URL for grayscale images', function() {
			let result = url.parse(new PlaceKitten(100, 100, true).toString());
			expect(result.protocol).toBe('http:');
			expect(result.hostname).toBe('placekitten.com');
			expect(result.pathname).toBe('/g/100/100');
		});
	});

	describe('.fetch()', function() {
		const imageData = '<mock image data>';

		beforeEach(function() {
			nock('http://placekitten.com').get('/100/100').reply(200, imageData);
		});

		afterAll(function() {
			nock.cleanAll();
			nock.restore();
		});

		it('should return a promise', function() {
			let promise = new PlaceKitten(100, 100).fetch();
			expect(promise).toEqual(jasmine.any(Promise));
		});
		it('should return a promise that resolves with a buffer', function(done) {
			new PlaceKitten(100, 100).fetch().then((buffer) => {
				expect(buffer).toEqual(jasmine.any(Buffer));
				done();
			}, (error) => {
				assert.fail();
				done();
			});
		});
		it('should return a promise that resolves with a buffer containing image data', function(done) {
			new PlaceKitten(100, 100).fetch().then((buffer) => {
				let contents = buffer.toString('binary');
				expect(contents).toBe(imageData);
				done();
			}, (error) => {
				assert.fail();
				done();
			});
		});
	});

});
