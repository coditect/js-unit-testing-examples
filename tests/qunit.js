const PlaceKitten = require('../lib/placekitten');
const QUnit = require('qunit-cli');
const nock = require('nock');
const url = require('url');

QUnit.module('The PlaceKitten constructor');

QUnit.test('should only accept positive integers for the width parameter', (assert) => {
	let acceptable = [2, 20, 2e12];
	acceptable.forEach((width) => {
		let result = {}

		try {
			new PlaceKitten(width, 100);
			assert.pushResult({result: true});
		} catch (e) {
			assert.pushResult({
				result: false,
				actual: e,
				expected: null
			});
		}
	});

	let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
	unacceptable.forEach((width) => {
		assert.throws(() => new PlaceKitten(width, 100));
	});
});

QUnit.test('should only accept positive integers for the height parameter', (assert) => {
	let acceptable = [2, 20, 2e12];
	acceptable.forEach((height) => {
		try {
			new PlaceKitten(100, height);
			assert.pushResult({result: true});
		} catch (e) {
			assert.pushResult({
				result: false,
				actual: e,
				expected: null
			});
		}
	});

	let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
	unacceptable.forEach((height) => {
		assert.throws(() => new PlaceKitten(100, height));
	});
});

QUnit.test('should only accept booleans for the grayscale parameter', (assert) => {
	try {
		new PlaceKitten(100, 100, true);
		new PlaceKitten(100, 100, false);
		assert.pushResult({result: true});
	} catch (e) {
		assert.pushResult({
			result: false,
			actual: e,
			expected: null
		});
	}

	let unacceptable = [null, 'string', 0, 1, -1, 3.14, [], {}];
	unacceptable.forEach((grayscale) => {
		assert.throws(() => new PlaceKitten(100, 100, grayscale));
	});
});

QUnit.test('should allow the grayscale parameter to be omitted', (assert) => {
	try {
		new PlaceKitten(100, 100);
		new PlaceKitten(100, 100, undefined);
		assert.pushResult({result: true});
	} catch (e) {
		assert.pushResult({
			result: false,
			actual: e,
			expected: null
		});
	}
});

QUnit.module('PlaceKitten.toString()');

QUnit.test('should return a string', (assert) => {
	let str = new PlaceKitten(100, 100).toString();
	assert.strictEqual(typeof str, 'string');
});

QUnit.test('should return a valid URL for colored images', (assert) => {
	let result = url.parse(new PlaceKitten(100, 100).toString());
	assert.strictEqual(result.protocol, 'http:');
	assert.strictEqual(result.hostname, 'placekitten.com');
	assert.strictEqual(result.pathname, '/100/100');
});

QUnit.test('should return a valid URL for grayscale images', (assert) => {
	let result = url.parse(new PlaceKitten(100, 100, true).toString());
	assert.strictEqual(result.protocol, 'http:');
	assert.strictEqual(result.hostname, 'placekitten.com');
	assert.strictEqual(result.pathname, '/g/100/100');
});

QUnit.module('PlaceKitten.fetch()');

const imageData = '<mock image data>';
QUnit.testStart((details) => {
	if (details.module === 'PlaceKitten.fetch()') {
		nock('http://placekitten.com').get('/100/100').reply(200, imageData);
	}
});
QUnit.moduleDone((details) => {
	if (details.name === 'PlaceKitten.fetch()') {
		nock.cleanAll();
		nock.restore();
	}
});

QUnit.test('should return a promise', (assert) => {
	let promise = new PlaceKitten(100, 100).fetch();
	assert.ok(promise instanceof Promise);
});

QUnit.test('the promise should resolve with a buffer', (assert) => {
	return new Promise((resolve, reject) => {
		new PlaceKitten(100, 100).fetch().then((buffer) => {
			assert.ok(buffer instanceof Buffer);
			resolve();
		}, (error) => {
			assert.fail();
			reject();
		});
	})
});

QUnit.test('the buffer should contain image data', (assert) => {
	return new Promise((resolve, reject) => {
		new PlaceKitten(100, 100).fetch().then((buffer) => {
			let contents = buffer.toString('binary');
			assert.strictEqual(contents, imageData);
			resolve();
		}, (error) => {
			assert.fail();
			reject();
		});
	})
});
