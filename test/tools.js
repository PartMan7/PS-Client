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
	it('should also import new custom colors', () => {
		assert.deepEqual(Tools.HSL('style.css').hsl, [258, 62, 56.12230272578728]);
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

describe('formatText', () => {
	it('should format bold correctly', () => {
		assert.equal(Tools.formatText('regular **bold**'), 'regular <b>bold</b>');
	});
	it('should format italics correctly', () => {
		assert.equal(Tools.formatText('regular __italic__'), 'regular <i>italic</i>');
	});
	it('should format striked correctly', () => {
		assert.equal(Tools.formatText('regular ~~striked~~'), 'regular <s>striked</s>');
	});
	it('should format superscript correctly', () => {
		assert.equal(Tools.formatText('regular ^^up^^'), 'regular <sup>up</sup>');
	});
	it('should format subscript correctly', () => {
		assert.equal(Tools.formatText('regular \\\\down\\\\'), 'regular <sub>down</sub>');
	});
	it('should format spoilers correctly (||spoiler||)', () => {
		assert.equal(Tools.formatText('regular ||text||'), 'regular <span class="spoiler">text</span>');
	});
	it('should format spoilers correctly (spoiler: )', () => {
		assert.equal(Tools.formatText('regular spoiler: text'), 'regular spoiler: <span class="spoiler">text</span>');
	});
	it('should format links correctly', () => {

		assert.equal(
			Tools.formatText('regular [[link]]'),
			'regular <a href="//www.google.com/search?ie=UTF-8&btnI&q=link" target="_blank">link</a>'
		);
	});
	it('should format named links correctly', () => {
		assert.equal(
			Tools.formatText('regular [[name<link>]]'),
			'regular <a href="link" rel="noopener" target="_blank">name<small> &lt;link&gt;</small></a>'
		);
	});
});

describe('update', () => {
	it('should be able to update the datacenters', () => {
		return Tools.update();
	});
});
