"use strict";

const inlineCss = require('inline-css');
const Tools = require('../tools.js');

class Room {
	constructor (init, parent) {
		Object.assign(this, init);
		this.parent = parent;
		this._waits = [];
	}
	send (text) {
		let room = this;
		return new Promise(function (resolve, reject) {
			text = room.roomid + '|' + text;
			room.parent.sendQueue(text, resolve, reject);
		});
	}
	privateSend (user, text) {
		if (!['*', '#', '&'].includes(this.users.find(u => Tools.toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		user = this.parent.getUser(user);
		if (!user) return false;
		this.send(`/sendprivatehtmlbox ${user.userid}, ${Tools.escapeHTML(text)}`);
		return true;
	}
	sendHTML (html, opts = {}) {
		if (!['*', '#', '&'].includes(this.users.find(u => Tools.toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		if (!html) throw new Error("Missing HTML argument");
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError("Options must be an object");
		if (!opts.name) opts.name = this.parent.status.username + Date.now().toString(36);
		inlineCss(html, {
			url: 'filePath'
		}).then(formatted => {
			this.send(`/${opts.change ? 'change' : 'add'}${opts.rank ? 'rank' : ''}uhtml` +
				`${opts.rank ? `${opts.rank}, ` : ''}${opts.name}, ${formatted}`);
		}).catch(err => {
			throw err;
		});
		return true;
	}
	privateHTML (user, html, opts = {}) {
		if (!['*', '#', '&'].includes(this.users.find(u => Tools.toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		user = this.parent.getUser(user);
		if (!user) return false;
		if (!html) throw new Error("Missing HTML argument");
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError("Options must be an object");
		if (!opts.name) opts.name = this.parent.status.username + Date.now().toString(36);
		inlineCss(html, {
			url: 'filePath'
		}).then(formatted => {
			this.send(`/${opts.change ? 'change' : 'send'}privateuhtml ${user.userid}, ${opts.name}, ${formatted}`);
		}).catch(err => {
			throw err;
		});
		return true;
	}
	waitFor (condition, time) {
		if (!time && typeof time !== 'number') time = 60 * 1000;
		if (typeof condition !== 'function') throw new TypeError('Condition must be a function.');
		let room = this;
		return new Promise((resolve, reject) => {
			let id = Date.now();
			if (time) setTimeout(() => {
				reject(new Error('Timed out.'));
				room._waits = room._waits.filter(wait => wait.id !== id);
			}, time);
			room._waits.push({
				condition: condition,
				id: id,
				resolve: msg => {
					room._waits = room._waits.filter(wait => wait.id !== id);
					resolve(msg);
				}
			});
		});
	}
}

module.exports = Room;