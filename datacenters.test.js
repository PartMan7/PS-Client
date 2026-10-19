const { parseShowdownExport } = require('./datacenters.js');

describe('parseShowdownExport', () => {
	it('should parse a minimal exports assignment', () => {
		const text = 'exports.BattleItems = {foo:{num:1}};';
		expect(parseShowdownExport(text, 'BattleItems')).toEqual({ foo: { num: 1 } });
	});

	it('should reject executable code in literals', () => {
		const text = 'exports.BattleItems = {foo: function(){}};';
		expect(() => parseShowdownExport(text, 'BattleItems')).toThrow(/executable code/);
	});
});
