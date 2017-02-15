const PlaceKitten = require('../lib/placekitten');
const expect = require('chai').expect;
const nock = require('nock');
const url = require('url');

describe('PlaceKitten', function() {

	describe('constructor', function() {
		it('should only accept positive integers for the width parameter', function() {
			expect(() => new PlaceKitten(2, 100)).to.not.throw();
			expect(() => new PlaceKitten(20, 100)).to.not.throw();
			expect(() => new PlaceKitten(2e12, 100)).to.not.throw();

			let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
			unacceptable.forEach((width) => {
				expect(() => new PlaceKitten(width, 100)).to.throw();
			});
		});

		it('should only accept positive integers for the height parameter', function() {
			expect(() => new PlaceKitten(100, 2)).to.not.throw();
			expect(() => new PlaceKitten(100, 20)).to.not.throw();
			expect(() => new PlaceKitten(100, 2e12)).to.not.throw();

			let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
			unacceptable.forEach((height) => {
				expect(() => new PlaceKitten(100, height)).to.throw();
			});
		});

		it('should only accept booleans for the grayscale parameter', function() {
			expect(() => new PlaceKitten(100, 100, true)).to.not.throw();
			expect(() => new PlaceKitten(100, 100, false)).to.not.throw();

			let unacceptable = [null, 'string', 0, 1, -1, 3.14, [], {}];
			unacceptable.forEach((grayscale) => {
				expect(() => new PlaceKitten(100, 100, grayscale)).to.throw();
			});
		});

		it('should allow the grayscale parameter to be omitted', function() {
			expect(() => new PlaceKitten(100, 100)).to.not.throw();
			expect(() => new PlaceKitten(100, 100, undefined)).to.not.throw();
		});
	});

	describe('.toString()', function() {
		it('should return a string', function() {
			let str = new PlaceKitten(100, 100).toString();
			expect(str).to.be.a('string');
		});

		it('should return a valid URL for colored images', function() {
			let result = url.parse(new PlaceKitten(100, 100).toString());
			expect(result.protocol).to.equal('http:');
			expect(result.hostname).to.equal('placekitten.com');
			expect(result.pathname).to.equal('/100/100');
		});

		it('should return a valid URL for grayscale images', function() {
			let result = url.parse(new PlaceKitten(100, 100, true).toString());
			expect(result.protocol).to.equal('http:');
			expect(result.hostname).to.equal('placekitten.com');
			expect(result.pathname).to.equal('/g/100/100');
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
			expect(promise).to.be.an.instanceof(Promise);
		});

		it('should return a promise that resolves with a buffer', function(done) {
			new PlaceKitten(100, 100).fetch().then((buffer) => {
				expect(buffer).to.be.an.instanceof(Buffer);
				done();
			}, (error) => {
				assert.fail();
				done();
			});
		});
		
		it('should return a promise that resolves with a buffer containing image data', function(done) {
			new PlaceKitten(100, 100).fetch().then((buffer) => {
				let contents = buffer.toString('binary');
				expect(contents).to.equal(imageData);
				done();
			}, (error) => {
				assert.fail();
				done();
			});
		});
	});

});
