const assert = require('node:assert');
const axios = require('axios');

const Tools = require('../tools.js');

describe('toID', () => {
	it('should return IDs properly', () => assert.equal('partman', Tools.toID('PartMan!')));
});

describe('HSL', () => {
	it('should return the right non-custom HSL', () => {
		assert.deepEqual(Tools.HSL('PartBot'), { source: 'partbot', hsl: [265, 50, 57.86516676840277] });
	});
	it('should return the right custom HSL', () => {
		assert.deepEqual(Tools.HSL('PartMan').hsl, [21, 88, 49]);
	});
	it('should return the right original HSL', () => {
		assert.deepEqual(Tools.HSL('PartMan', true).hsl, [162, 84, 33]);
	});
});

describe('uploadToPastie', function () {
	this.timeout(5_000);
	it('should upload the given text', async () => {
		const paste = await Tools.uploadToPastie('Test');
		const { data } = await axios.get(paste);
		assert.equal(data, 'Test');
	});
});

describe('escapeHTML', () => {
	it('should escape HTML correctly', () => {
		assert.equal(Tools.escapeHTML('You\'ve <b>lost the game</b>!'), 'You&apos;ve &lt;b&gt;lost the game&lt;&#x2f;b&gt;!');
	});
});

describe('unescapeHTML', () => {
	it('should unescape HTML correctly', () => {
		assert.equal(Tools.unescapeHTML('You&apos;ve &lt;b&gt;lost the game&lt;&#x2f;b&gt;!'), 'You\'ve <b>lost the game</b>!');
	});
});

describe('update', () => {
	it('should be able to update the datacenters', () => {
		return Tools.update();
	});
});
