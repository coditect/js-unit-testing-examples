const http = require('http');

function isPositiveInteger(number) {
	if (typeof number === 'number') {
		return Number.isInteger(number) && number > 0;
	}
	return false;
}

class PlaceKitten {

	constructor(width, height, grayscale) {
		if (!isPositiveInteger(width)) {
			throw 'Invalid width';
		}
		if (!isPositiveInteger(height)) {
			throw 'Invalid height';
		}
		if (typeof grayscale === 'undefined') {
			grayscale = false;
		} else if (typeof grayscale !== 'boolean') {
			throw 'Invalid value for grayscale flag';
		}

		this.width = width;
		this.height = height;
		this.grayscale = grayscale;
	}

	toString() {
		let url = 'http://placekitten.com/';
		if (this.grayscale) {
			url += 'g/';
		}
		url += this.width + '/' + this.height;
		return url;
	}

	fetch() {
		return new Promise((resolve, reject) => {
			http.get(this.toString(), (resp) => {
				if (resp.statusCode !== 200) {
					reject(resp.statusCode);
				} else {
					let chunks = [];
					resp.on('data', (chunk) => {
						chunks.push(chunk);
					});
					resp.on('end', () => {
						resolve(Buffer.concat(chunks));
					});
				}
			});
		});
	}

}

module.exports = PlaceKitten;
