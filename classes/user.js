'use strict';

const inlineCss = require('inline-css');

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

class User {
	constructor (init, parent) {
		Object.keys(init).forEach(key => this[key] = init[key]);
		this.parent = parent;
		this._waits = [];
		this.alts = new Set();
	}
	send (text) {
		const user = this;
		return new Promise(function (resolve, reject) {
			text = `|/pm ${user.userid},${text?.toString() || String(text)}`;
			user.parent.sendQueue(text, resolve, reject);
		});
	}
	sendHTML (html, opts = {}) {
		if (!html) throw new Error('Missing HTML argument');
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError('Options must be an object');
		if (!opts.name) opts.name = this.parent.status.username + Date.now().toString(36);
		const rooms = {};
		for (const room of this.parent.values()) {
			if (
				room.auth?.['*']?.includes(this.parent.status.userid) ||
				room.auth?.['#']?.includes(this.parent.status.userid)
			) rooms[room.visibility] = room;
		}
		// Object.values(this.parent.rooms).forEach(room => {
		// 	if (
		// 		room.auth?.['*']?.includes(this.parent.status.userid) ||
		// 		room.auth?.['#']?.includes(this.parent.status.userid)
		// 	) rooms[room.visibility] = room;
		// });
		const room = rooms.public || rooms.hidden || rooms.private;
		if (!room) throw new Error('No common rooms');
		return inlineCss(html, {
			url: 'filePath'
		}).then(formatted => {
			room.send(`/pmuhtml${opts.change ? 'change' : ''} ${this.userid}, ${opts.name}, ${formatted}`);
		});
	}
	pageHTML (html, name) {
		if (!html) throw new Error('Missing HTML argument');
		if (!name) name = this.parent.status.username + Date.now().toString(36);
		name = name.toString();
		const rooms = {};
		for (const room of this.parent.values()) {
			if (
				room.auth?.['*']?.includes(this.parent.status.userid) ||
				room.auth?.['#']?.includes(this.parent.status.userid)
			) rooms[room.visibility] = room;
		}
		const room = rooms.public || rooms.hidden || rooms.private;
		if (!room) throw new Error('No common rooms');
		return inlineCss(html, { url: 'filePath' }).then(formatted => {
			room.send(`/sendhtmlpage ${this.userid}, ${name}, ${formatted}`);
		});
	}
	waitFor (condition, time = 60_000) {
		if (typeof condition !== 'function') throw new TypeError('Condition must be a function.');
		const user = this;
		return new Promise((resolve, reject) => {
			const id = process.uptime();
			const waitObj = {
				condition: condition,
				id: id,
				resolve: msg => {
					user._waits = user._waits.filter(wait => wait.id !== id);
					resolve(msg);
				}
			};
			if (time) {
				waitObj.timedOut = setTimeout(() => {
					reject(new Error('Timed out.'));
					user._waits = user._waits.filter(wait => wait.id !== id);
				}, time);
			}
			user._waits.push(waitObj);
		});
	}
	[customInspectSymbol] (depth, options, inspect) {
		if (depth < 1) return options.stylize(`${this.name || '-'} [PS-User]`, 'special');
		const logObj = {};
		const keys = ['userid', 'name', 'group', 'avatar', 'autoconfirmed', 'status', 'alts', 'rooms', 'parent'];
		keys.forEach(key => logObj[key] = this[key]);
		logObj.rooms = {
			[customInspectSymbol]: (depth, options, inspect) => depth <= 1 ? options.stylize('[Rooms]', 'special') : this.rooms
		};
		return `${options.stylize('PS-User', 'special')} ${inspect(logObj, { ...options, depth: options.depth - 1 })}`;
	}
}

module.exports = User;
