const PlaceKitten = require('../lib/placekitten');
const test = require('ava').test;
const nock = require('nock');
const url = require('url');

test('The PlaceKitten constructor shoushould only accept positive integers for the width parameter', t => {
	t.notThrows(() => new PlaceKitten(2, 100));
	t.notThrows(() => new PlaceKitten(20, 100));
	t.notThrows(() => new PlaceKitten(2e12, 100));

	let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
	unacceptable.forEach((width) => {
		t.throws(() => new PlaceKitten(width, 100));
	});
});

test('The PlaceKitten constructor should only accept positive integers for the height parameter', t => {
	t.notThrows(() => new PlaceKitten(100, 2));
	t.notThrows(() => new PlaceKitten(100, 20));
	t.notThrows(() => new PlaceKitten(100, 2e12));

	let unacceptable = [0, -1, 3.14, null, undefined, true, false, 'string', '1', [], {}];
	unacceptable.forEach((height) => {
		t.throws(() => new PlaceKitten(100, height));
	});
});

test('The PlaceKitten constructor should only accept booleans for the grayscale parameter', t => {
	t.notThrows(() => new PlaceKitten(100, 100, true));
	t.notThrows(() => new PlaceKitten(100, 100, false));

	let unacceptable = [null, 'string', 0, 1, -1, 3.14, [], {}];
	unacceptable.forEach((grayscale) => {
		t.throws(() => new PlaceKitten(100, 100, grayscale));
	});
});

test('The PlaceKitten constructor should allow the grayscale parameter to be omitted', t => {
	t.notThrows(() => new PlaceKitten(100, 100));
	t.notThrows(() => new PlaceKitten(100, 100, undefined));
});

test('PlaceKitten.toString() should return a string', t => {
	let str = new PlaceKitten(100, 100).toString();
	t.is(typeof str, 'string');
})

test('PlaceKitten.toString() should return a valid URL for colored images', t => {
	let result = url.parse(new PlaceKitten(100, 100).toString());
	t.is(result.protocol, 'http:');
	t.is(result.hostname, 'placekitten.com');
	t.is(result.pathname, '/100/100');
});

test('PlaceKitten.toString() should return a valid URL for grayscale images', t => {
	let result = url.parse(new PlaceKitten(100, 100, true).toString());
	t.is(result.protocol, 'http:');
	t.is(result.hostname, 'placekitten.com');
	t.is(result.pathname, '/g/100/100');
});

test.beforeEach(t => {
	t.context.imageData = '<mock image data>';
	nock('http://placekitten.com').get('/100/100').reply(200, t.context.imageData);
});

test.afterEach(t => {
	nock.cleanAll();
	nock.restore();
});

test('PlaceKitten.fetch() should return a promise', t => {
	let promise = new PlaceKitten(100, 100).fetch();
	t.true(promise instanceof Promise);
});

test('The promise returned by PlaceKitten.fetch() should resolve with a buffer', async t => {
	new PlaceKitten(100, 100).fetch().then((buffer) => {
		t.true(buffer instanceof Buffer);
	}, (error) => {
		t.fail();
	});
});

test('The buffer resolved from PlaceKitten.fetch() should contain image data', async t => {
	new PlaceKitten(100, 100).fetch().then((buffer) => {
		let contents = buffer.toString('binary');
		t.is(contents, t.context.imageData);
	}, (error) => {
		t.fail();
	});
});
