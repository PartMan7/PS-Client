'use strict';

const JSON5 = require('json5');

function toID(text) {
	return String(text)
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');
}

function sliceExportLiteral(text, exportName) {
	const match = text.trimEnd().match(new RegExp(`exports\\.${exportName}\\s*=\\s*([\\[{][\\s\\S]*);\\s*$`));
	if (!match) throw new Error(`Missing exports.${exportName} in datacenter response`);
	return match[1];
}

function parseShowdownExport(text, exportName) {
	const literal = sliceExportLiteral(text, exportName);
	if (/\bfunction\b|=>/.test(literal)) {
		throw new Error(`Datacenter exports.${exportName} contains executable code`);
	}
	return JSON5.parse(literal);
}

function enrichPokedex(json) {
	const data = JSON.parse(json);
	Object.values(data).forEach(pokemon => {
		pokemon.id = toID(pokemon.name);
		if (pokemon.isCosmeticForme) {
			const baseMon = data[toID(pokemon.baseSpecies)];
			for (const key in baseMon) {
				if (!(key in pokemon)) pokemon[key] = baseMon[key];
			}
		}
		pokemon.bst = Object.values(pokemon.baseStats).reduce((a, b) => a + b, 0);

		if (!pokemon.gen && pokemon.num >= 1) {
			if (pokemon.num >= 906 || pokemon.forme?.includes('Paldea')) {
				pokemon.gen = 9;
			} else if (pokemon.num >= 810 || ['Gmax', 'Galar', 'Galar-Zen', 'Hisui'].includes(pokemon.forme)) {
				pokemon.gen = 8;
			} else if (pokemon.num >= 722 || pokemon.forme?.startsWith('Alola') || pokemon.forme === 'Starter') {
				pokemon.gen = 7;
			} else if (pokemon.forme === 'Primal') {
				pokemon.gen = 6;
				pokemon.isPrimal = true;
				pokemon.battleOnly = pokemon.baseSpecies;
			} else if (pokemon.num >= 650 || pokemon.isMega) {
				pokemon.gen = 6;
			} else if (pokemon.num >= 494) {
				pokemon.gen = 5;
			} else if (pokemon.num >= 387) {
				pokemon.gen = 4;
			} else if (pokemon.num >= 252) {
				pokemon.gen = 3;
			} else if (pokemon.num >= 152) {
				pokemon.gen = 2;
			} else {
				pokemon.gen = 1;
			}
		}
	});
	return data;
}

async function fetchColors() {
	const response = await fetch('http://play.pokemonshowdown.com/config/colors.json').then(res => res.json());
	const configStr = await fetch('https://play.pokemonshowdown.com/config/config.js').then(body => body.text());
	const pairs = configStr.match(/(?<=')[a-z0-9]+': '[a-z0-9]*(?=')/g).map(match => match.split(`': '`));
	return Object.assign(Object.fromEntries(pairs), response);
}

const DATACENTERS = {
	abilities: {
		url: 'https://play.pokemonshowdown.com/data/abilities.js',
		key: 'abilities',
		expo: 'BattleAbilities',
	},
	aliases: {
		url: 'https://play.pokemonshowdown.com/data/aliases.js',
		key: 'aliases',
		expo: 'BattleAliases',
	},
	colors: {
		key: 'colors',
		load: fetchColors,
	},
	formatsdata: {
		url: 'https://play.pokemonshowdown.com/data/formats-data.js',
		key: 'formatsData',
		expo: 'BattleFormatsData',
	},
	formats: {
		url: 'https://play.pokemonshowdown.com/data/formats.js',
		key: 'formats',
		expo: 'Formats',
	},
	items: {
		url: 'https://play.pokemonshowdown.com/data/items.js',
		key: 'items',
		expo: 'BattleItems',
	},
	learnsets: {
		url: 'https://play.pokemonshowdown.com/data/learnsets.js',
		key: 'learnsets',
		expo: 'BattleLearnsets',
	},
	moves: {
		url: 'https://play.pokemonshowdown.com/data/moves.json',
		key: 'moves',
		json: true,
	},
	pokedex: {
		url: 'https://play.pokemonshowdown.com/data/pokedex.json',
		key: 'pokedex',
		process: enrichPokedex,
	},
	typechart: {
		url: 'https://play.pokemonshowdown.com/data/typechart.js',
		key: 'typechart',
		expo: 'BattleTypeChart',
	},
};

async function loadDatacenter(def) {
	if (def.load) return def.load();
	const text = await fetch(def.url).then(res => res.text());
	if (def.process) return def.process(text);
	if (def.json) return JSON.parse(text);
	return parseShowdownExport(text, def.expo);
}

async function fetchDatacenters(...types) {
	let selected = types
		.map(toID)
		.map(type => DATACENTERS[type])
		.filter(Boolean);
	if (!selected.length) selected = Object.values(DATACENTERS);
	const out = {};
	await Promise.all(
		selected.map(async def => {
			out[def.key] = await loadDatacenter(def);
		})
	);
	return out;
}

exports.parseShowdownExport = parseShowdownExport;
exports.fetch = fetchDatacenters;
