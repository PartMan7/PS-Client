'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

let COLORS = require('./showdown/colors.json');

function toID(text) {
	return String(text)
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');
}
exports.toID = toID;

function toRoomID(text) {
	return String(text)
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, '');
}
exports.toRoomID = toRoomID;

exports.HSL = function HSL(name, original) {
	name = toID(name);
	const out = { source: name, hsl: null };
	if (COLORS[name] && name !== 'constructor' && !original) {
		out.base = exports.HSL(name, true);
		name = COLORS[name];
		out.source = name;
	}
	const hash = crypto.createHash('md5').update(name, 'utf8').digest('hex');
	const H = parseInt(hash.substr(4, 4), 16) % 360;
	const S = (parseInt(hash.substr(0, 4), 16) % 50) + 40;
	let L = Math.floor((parseInt(hash.substr(8, 4), 16) % 20) + 30);
	const C = ((100 - Math.abs(2 * L - 100)) * S) / 100 / 100;
	const X = C * (1 - Math.abs(((H / 60) % 2) - 1));
	const m = L / 100 - C / 2;
	let R1;
	let G1;
	let B1;
	switch (Math.floor(H / 60)) {
		case 1:
			R1 = X;
			G1 = C;
			B1 = 0;
			break;
		case 2:
			R1 = 0;
			G1 = C;
			B1 = X;
			break;
		case 3:
			R1 = 0;
			G1 = X;
			B1 = C;
			break;
		case 4:
			R1 = X;
			G1 = 0;
			B1 = C;
			break;
		case 5:
			R1 = C;
			G1 = 0;
			B1 = X;
			break;
		case 0:
		default:
			R1 = C;
			G1 = X;
			B1 = 0;
			break;
	}
	const R = R1 + m;
	const G = G1 + m;
	const B = B1 + m;
	const lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722;
	let HLmod = (lum - 0.2) * -150;
	if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
	else if (HLmod < 0) HLmod = (HLmod - 0) / 3;
	else HLmod = 0;
	const Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
	if (Hdist < 15) HLmod += (15 - Hdist) / 3;
	L += HLmod;
	out.hsl = [H, S, L];
	return out;
};

exports.update = function update(...types) {
	const links = {
		abilities: {
			url: 'https://play.pokemonshowdown.com/data/abilities.js',
			path: path.join(__dirname, 'showdown', 'abilities.js'),
			name: 'Abilities',
			expo: 'BattleAbilities',
		},
		aliases: {
			url: 'https://play.pokemonshowdown.com/data/aliases.js',
			path: path.join(__dirname, 'showdown', 'aliases.js'),
			name: 'Aliases',
			expo: 'BattleAliases',
		},
		colors: {
			path: path.join(__dirname, 'showdown', 'colors.json'),
			name: 'Colors',
		},
		formatsdata: {
			url: 'https://play.pokemonshowdown.com/data/formats-data.js',
			path: path.join(__dirname, 'showdown', 'formats-data.js'),
			name: 'Formats Data',
			key: 'formatsData',
			expo: 'BattleFormatsData',
		},
		formats: {
			url: 'https://play.pokemonshowdown.com/data/formats.js',
			path: path.join(__dirname, 'showdown', 'formats.js'),
			name: 'Formats',
			expo: 'BattleFormats',
		},
		items: {
			url: 'https://play.pokemonshowdown.com/data/items.js',
			path: path.join(__dirname, 'showdown', 'items.js'),
			name: 'Items',
			expo: 'BattleItems',
		},
		learnsets: {
			url: 'https://play.pokemonshowdown.com/data/learnsets.js',
			path: path.join(__dirname, 'showdown', 'learnsets.js'),
			name: 'Learnsets',
			expo: 'BattleLearnsets',
		},
		moves: {
			url: 'https://play.pokemonshowdown.com/data/moves.json',
			path: path.join(__dirname, 'showdown', 'moves.json'),
			name: 'Moves',
		},
		pokedex: {
			url: 'https://play.pokemonshowdown.com/data/pokedex.json',
			path: path.join(__dirname, 'showdown', 'pokedex.json'),
			name: 'Pokedex',
			process: json => {
				const data = JSON.parse(json);
				Object.values(data).forEach(pokemon => {
					pokemon.id = toID(pokemon.name);
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
				return JSON.stringify(data);
			},
		},
		typechart: {
			url: 'https://play.pokemonshowdown.com/data/typechart.js',
			path: path.join(__dirname, 'showdown', 'typechart.js'),
			name: 'Typechart',
			expo: 'BattleTypeChart',
		},
	};
	types = types
		.map(toID)
		.map(type => links[type])
		.filter(type => type);
	if (!types.length) types = Object.values(links);
	return new Promise((resolve, reject) => {
		Promise.all(
			types.map(
				type =>
					new Promise(res => {
						if (type.name === 'Colors') {
							return fetch('http://play.pokemonshowdown.com/config/colors.json')
								.then(res => res.json())
								.then(async response => {
									const configStr = await fetch('https://play.pokemonshowdown.com/config/config.js').then(body => body.text());
									const pairs = configStr.match(/(?<=')[a-z0-9]+': '[a-z0-9]*(?=')/g).map(match => match.split(`': '`));
									const obj = Object.assign(Object.fromEntries(pairs), response);
									fs.writeFile(type.path, JSON.stringify(obj, null, '\t'), err => {
										if (err) return reject(err.message);
										delete require.cache[require.resolve(type.path)];
										COLORS = require(type.path);
										return res(type.name);
									});
								});
						}
						fetch(type.url)
							.then(res => res.text())
							.then(response => {
								const data = type.process ? type.process(response) : response;
								const writeData = (typeof data === 'string' ? data : JSON.stringify(data)) + (type.append || '');
								fs.writeFile(type.path, writeData, err => {
									if (err) throw err;
									try {
										delete require.cache[require.resolve(type.path)];
									} catch {
									} finally {
										res(type.name);
									}
								});
							})
							.catch(reject);
					})
			)
		).then(res => {
			if (require.cache[require.resolve('./client.js')]) {
				const main = require('./client.js');
				types.forEach(type => {
					const key = type.key || toID(type.name);
					if (type.expo) main.Data[key] = require(type.path)[type.expo];
					else main.Data[key] = require(type.path);
				});
			}
			resolve(res);
		});
	});
};

exports.uploadToPastie = async function uploadToPastie(text, callback) {
	const res = await fetch('https://pastie.io/documents', {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
		},
		body: text,
	});
	const data = await res.json();

	if (callback && typeof callback === 'function') callback(`https://pastie.io/raw/${data.key}`);
	return `https://pastie.io/raw/${data.key}`;
};

exports.uploadToPokepaste = function uploadToPokepaste(text, output) {
	return new Promise((resolve, reject) => {
		switch (typeof text) {
			case 'string': {
				text = {
					title: 'Untitled',
					author: 'Anonymous',
					notes: '',
					paste: text.replace(/\r?\n/g, '\r\n'),
				};
				break;
			}
			default: {
				if (text.paste) break;
				return reject(new Error('Invalid Paste value.'));
			}
		}
		fetch('https://pokepast.es/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: querystring.stringify(text),
		})
			.then(res => res.text().then(data => ({ data, url: res.url })))
			.then(({ data, url }) => {
				if (typeof output === 'function') return output(url);
				switch (toID(output)) {
					case 'raw':
						resolve(url.replace(/(?<=pokepast\.es)/, '/raw'));
						break;
					case 'html':
						resolve(data);
						break;
					default:
						resolve(url);
				}
			})
			.catch(reject);
	});
};

exports.escapeHTML = function escapeHTML(str) {
	if (!str) return '';
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/\//g, '&#x2f;');
};

exports.unescapeHTML = function unescapeHTML(str) {
	if (!str) return '';
	return String(str)
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#x2f;/g, '/');
};

exports.formatText = require('./chat.js');
