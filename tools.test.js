const axios = require('axios');
const Tools = require('./tools.js');

describe('toID', () => {
	it('should return IDs properly', () => expect(Tools.toID('PartMan!')).toBe('partman'));
});

describe('HSL', () => {
	it('should return the right non-custom HSL', () => {
		expect(Tools.HSL('PartBot')).toEqual({ source: 'partbot', hsl: [265, 50, 57.86516676840277] });
	});
	it('should return the right custom HSL', () => {
		expect(Tools.HSL('PartMan').hsl).toEqual([21, 88, 49]);
	});
	it('should return the right original HSL', () => {
		expect(Tools.HSL('PartMan', true).hsl).toEqual([162, 84, 33]);
	});
	it('should also import new custom colors', () => {
		expect(Tools.HSL('style.css').hsl).toEqual([258, 62, 56.12230272578728]);
	});
});

describe('uploadToPastie', function () {
	it('should upload the given text', async () => {
		const paste = await Tools.uploadToPastie('Test');
		const { data } = await axios.get(paste);
		expect(data).toBe('Test');
	});
});

describe('escapeHTML', () => {
	it('should escape HTML correctly', () => {
		expect(Tools.escapeHTML('You\'ve <b>lost the game</b>!')).toBe('You&apos;ve &lt;b&gt;lost the game&lt;&#x2f;b&gt;!');
	});
});

describe('unescapeHTML', () => {
	it('should unescape HTML correctly', () => {
		expect(Tools.unescapeHTML('You&apos;ve &lt;b&gt;lost the game&lt;&#x2f;b&gt;!')).toBe('You\'ve <b>lost the game</b>!');
	});
});

describe('formatText', () => {
	it('should format bold correctly', () => {
		expect(Tools.formatText('regular **bold**')).toBe('regular <b>bold</b>');
	});
	it('should format italics correctly', () => {
		expect(Tools.formatText('regular __italic__')).toBe('regular <i>italic</i>');
	});
	it('should format striked correctly', () => {
		expect(Tools.formatText('regular ~~striked~~')).toBe('regular <s>striked</s>');
	});
	it('should format superscript correctly', () => {
		expect(Tools.formatText('regular ^^up^^')).toBe('regular <sup>up</sup>');
	});
	it('should format subscript correctly', () => {
		expect(Tools.formatText('regular \\\\down\\\\')).toBe('regular <sub>down</sub>');
	});
	it('should format spoilers correctly (||spoiler||)', () => {
		expect(Tools.formatText('regular ||text||')).toBe('regular <span class="spoiler">text</span>');
	});
	it('should format spoilers correctly (spoiler: )', () => {
		expect(Tools.formatText('regular spoiler: text')).toBe('regular spoiler: <span class="spoiler">text</span>');
	});
	it('should format links correctly', () => {
		expect(
			Tools.formatText('regular [[link]]')).toBe(
			'regular <a href="//www.google.com/search?ie=UTF-8&btnI&q=link" target="_blank">link</a>'
		);
	});
	it('should format named links correctly', () => {
		expect(
			Tools.formatText('regular [[name<link>]]')).toBe(
			'regular <a href="link" rel="noopener" target="_blank">name<small> &lt;link&gt;</small></a>'
		);
	});
});

describe('update', () => {
	it('should be able to update the datacenters', () => {
		return Tools.update();
	});
});
