"use strict";

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const Config = require('./showdown/config.js').Config;
// const Message = require('./classes/message.js');


exports.HSL = function (name, original) {
	name = exports.toID(name);
	let out = {source: name, hsl: null};
	if (Config.customcolors[name] && !original) {
		out.base = exports.HSL(name, true);
		name = Config.customcolors[name];
		out.source = name;
	}
	let hash = crypto.createHash('md5').update(name, 'utf8').digest('hex');
	let H = parseInt(hash.substr(4, 4), 16) % 360;
	let S = parseInt(hash.substr(0, 4), 16) % 50 + 40;
	let L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30);
	let C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
	let X = C * (1 - Math.abs((H / 60) % 2 - 1));
	let m = L / 100 - C / 2;
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
	let R = R1 + m;
	let G = G1 + m;
	let B = B1 + m;
	let lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722;
	let HLmod = (lum - 0.2) * -150;
	if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
	else if (HLmod < 0) HLmod = (HLmod - 0) / 3;
	else HLmod = 0;
	let Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
	if (Hdist < 15) HLmod += (15 - Hdist) / 3;
	L += HLmod;
	out.hsl = [
		H,
		S,
		L
	]
	return out;
}

exports.toID = function (text) {
	return String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
}

exports.update = function (...types) {
	const links = {
		abilities: {
			url: "https://play.pokemonshowdown.com/data/abilities.js",
			path: "showdown/abilities.js",
			name: "Abilities"
		},
		aliases: {
			url: "https://play.pokemonshowdown.com/data/aliases.js",
			path: "showdown/aliases.js",
			name: "Aliases"
		},
		config: {
			url: "https://play.pokemonshowdown.com/config/config.js",
			path: "showdown/config.js",
			ship: "\n\nexports.Config = Config;",
			name: "Config"
		},
		formatsdata: {
			url: "https://play.pokemonshowdown.com/data/formats-data.js",
			path: "showdown/formats-data.js",
			name: "Formats Data"
		},
		formats: {
			url: "https://play.pokemonshowdown.com/data/formats.js",
			path: "showdown/formats.js",
			name: "Formats"
		},
		items: {
			url: "https://play.pokemonshowdown.com/data/items.js",
			path: "showdown/items.js",
			name: "Items"
		},
		learnsets: {
			url: "https://play.pokemonshowdown.com/data/learnsets.js",
			path: "showdown/learnsets.js",
			name: "Learnsets"
		},
		moves: {
			url: "https://play.pokemonshowdown.com/data/moves.js",
			path: "showdown/moves.js",
			name: "Moves"
		},
		pokedex: {
			url: "https://play.pokemonshowdown.com/data/pokedex.js",
			path: "showdown/pokedex.js",
			name: "Pokedex"
		},
		typechart: {
			url: "https://play.pokemonshowdown.com/data/typechart.js",
			path: "showdown/typechart.js",
			name: "Typechart"
		}
	}
	types = types.map(exports.toID).map(type => links[type]).filter(type => type);
	if (!types.length) types = Object.values(links);
	return new Promise((resolve, reject) => {
		Promise.all(types.map(type => new Promise (res => {
			axios.get(type.url).then(response => {
				const data = response.data;
				fs.writeFile(path.join(__dirname, type.path), (data + (type.ship || '')), err => {
					if (err) return console.error(err.stack);
					try {
						delete require.cache[require.resolve(type.path)];
					} catch {}
					res(type.name);
				});
			}).catch(reject);
		}))).then(resolve);
	});
}

exports.uploadToPastie = function (text) {
	return new Promise((resolve, reject) => {
		axios.post("https://pastie.io/documents", String(text), {
			headers: {
				'Content-Type': 'text/plain'
			}
		}).then(res => {
			resolve(`https://pastie.io/raw/${res.data.key}`);
		}).catch(reject);
	});
}

exports.uploadToPokepaste = function (text, output) {
	return new Promise((resolve, reject) => {
		switch (typeof text) {
			case 'string': {
				text = {
					title: 'Untitled',
					author: 'Anonymous',
					notes: '',
					paste: text.replace(/\n(?:[^\r]|$)/g, match => match.replace(/\n/g, '\r\n'))
				}
				break;
			}
			default: {
				if (text.paste) break;
				reject(new Error("Invalid Paste value."));
				return;
			}
		}
		axios.post("https://pokepast.es/create", querystring.stringify(text)).then(res => {
			if (typeof output === 'function') return output(res.request.res.responseUrl);
			switch (exports.toID(output)) {
				case 'raw': {
					resolve(`https://pokepast.es/raw${res.request.path}`);
					break;
				}
				case 'html': {
					resolve(res.data);
					break;
				}
				default: resolve(res.request.res.responseUrl);
			}
		}).catch(reject);
	});
}