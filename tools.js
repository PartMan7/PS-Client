'use strict';

const crypto = require('crypto');
const querystring = require('querystring');

const { fetch: fetchDatacenters } = require('./datacenters.js');
exports.fetch = fetchDatacenters;

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

exports.HSL = function HSL(name, opts) {
	const original = opts && typeof opts === 'object' ? opts.original : undefined;
	const customColors = opts && typeof opts === 'object' ? opts.customColors : undefined;
	name = toID(name);
	const out = { source: name, hsl: null };
	if (customColors?.[name] && name !== 'constructor' && !original) {
		out.base = exports.HSL(name, { original: true, customColors });
		name = customColors[name];
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
