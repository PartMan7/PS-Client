"use strict";

const inlineCss = require('inline-css');

class User {
	constructor (init, parent) {
		Object.assign(this, init);
		this.parent = parent;
		this._waits = [];
		this.alts = [];
	}
	send (text) {
		let user = this;
		return new Promise(function (resolve, reject) {
			text = '|/pm ' + user.userid + ',' + text;
			user.parent.sendQueue(text, resolve, reject);
		});
	}
	sendHTML (html, opts = {}) {
		if (!html) throw new Error("Missing HTML argument");
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError("Options must be an object");
		if (!opts.name) opts.name = this.parent.status.username + Date.now().toString(36);
		const rooms = new Map();
		[...this.parent.rooms.values()].forEach(room => {
			if (
				room.auth?.['*']?.includes(this.parent.status.userid) ||
				room.auth?.['#']?.includes(this.parent.status.userid)
			) rooms.set(room.visibility, room);
		});
		const room = rooms.public || rooms.hidden || rooms.private;
		if (!room) return false;
		inlineCss(html, {
			url: 'filePath'
		}).then(formatted => {
			room.send(`/pmuhtml${opts.change ? 'change' : ''} ${this.userid}, ${opts.name}, ${formatted}`);
		}).catch(err => {
			throw err;
		});
		return true;
	}
	pageHTML (html, name) {
		if (!html) throw new Error("Missing HTML argument");
		if (!name) name = this.parent.status.username + Date.now().toString(36);
		name = name.toString();
		const rooms = new Map();
		[...this.parent.rooms.values()].forEach(room => {
			if (
				room.auth?.['*']?.includes(this.parent.status.userid) ||
				room.auth?.['#']?.includes(this.parent.status.userid)
			) rooms.set(room.visibility, room);
		});
		const room = rooms.public || rooms.hidden || rooms.private;
		if (!room) return false;
		inlineCss(html, {
			url: 'filePath'
		}).then(formatted => {
			room.send(`/sendhtmlpage ${this.userid}, ${name}, ${formatted}`);
		}).catch(err => {
			throw err;
		});
		return true;
	}
	waitFor (condition, time) {
		if (!time && typeof time !== 'number') time = 60 * 1000;
		if (typeof condition !== 'function') throw new TypeError('Condition must be a function.');
		let user = this;
		return new Promise((resolve, reject) => {
			let id = Date.now();
			if (time) setTimeout(() => {
				reject(new Error('Timed out.'));
				user._waits = user._waits.filter(wait => wait.id !== id);
			}, time);
			user._waits.push({
				condition: condition,
				id: id,
				resolve: msg => {
					user._waits = user._waits.filter(wait => wait.id !== id);
					resolve(msg);
				}
			});
		});
	}
}

module.exports = User;
