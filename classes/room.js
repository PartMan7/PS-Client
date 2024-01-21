'use strict';

const inlineCss = require('inline-css');
const { toID, formatText } = require('../tools.js');

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

class Room {
	constructor (name, parent) {
		this.roomid = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
		this.parent = parent;
		this._waits = [];
	}
	send (text) {
		return new Promise((resolve, reject) => {
			text = `${this.roomid}|${text?.toString() || String(text)}`;
			this.parent.sendQueue(text, resolve, reject);
		});
	}
	privateSend (user, text) {
		if (!['*', '#', '&'].includes(this.users.find(u => toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		user = this.parent.getUser(user);
		if (!user) return false;
		this.send(`/sendprivatehtmlbox ${user.userid}, ${formatText(text)}`);
		return true;
	}
	sendHTML (html, opts = {}) {
		if (!['*', '#', '&'].includes(this.users.find(u => toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		if (!html) throw new Error('Missing HTML argument');
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError('Options must be an object');
		if (!opts.name) opts.name = this.parent.status.username + Date.now().toString(36);
		inlineCss(html, { url: 'filePath' }).then(formatted => {
			this.send(`/${opts.change ? 'change' : 'add'}${opts.rank ? 'rank' : ''}uhtml` +
				` ${opts.rank ? `${opts.rank}, ` : ''}${opts.name}, ${formatted}`);
		});
		return true;
	}
	privateHTML (user, html, opts = {}) {
		if (!['*', '#', '&'].includes(this.users.find(u => toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		user = this.parent.getUser(user);
		if (!user) return false;
		if (!html) throw new Error('Missing HTML argument');
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError('Options must be an object');
		if (!opts.name) opts.name = this.parent.status.username + Date.now().toString(36);
		inlineCss(html, { url: 'filePath' }).then(formatted => {
			this.send(`/${opts.change ? 'change' : 'send'}privateuhtml ${user.userid}, ${opts.name}, ${formatted}`);
		});
		return true;
	}
	waitFor (condition, time) {
		if (!time && typeof time !== 'number') time = 60 * 1000;
		if (typeof condition !== 'function') throw new TypeError('Condition must be a function.');
		const room = this;
		return new Promise((resolve, reject) => {
			const id = Date.now();
			const waitObj = {
				condition: condition,
				id: id,
				resolve: msg => {
					room._waits = room._waits.filter(wait => wait.id !== id);
					resolve(msg);
				}
			};
			if (time) {
				waitObj.timedOut = setTimeout(() => {
					reject(new Error('Timed out.'));
					room._waits = room._waits.filter(wait => wait.id !== id);
				}, time);
			}
			room._waits.push(waitObj);
		});
	}
	update () {
		this.parent.send(`|/cmd roominfo ${this.roomid}`);
	}
	[customInspectSymbol] (depth, options, inspect) {
		if (depth < 1) return options.stylize(`${this.title} [PS-Room]`, 'special');
		const logObj = {};
		// eslint-disable-next-line max-len
		const keys = ['roomid', 'title', 'type', 'visibility', 'modchat', 'auth', 'users', 'parent', 'send', 'privateSend', 'sendHTML', 'privateHTML', 'waitFor'];
		keys.forEach(key => logObj[key] = this[key]);
		logObj.auth = {
			[customInspectSymbol]: (depth, options, inspect) => depth <= 1 ? options.stylize('[Auth]', 'special') : this.auth
		};
		logObj.users = {
			[customInspectSymbol]: (depth, options, inspect) => depth <= 1 ? options.stylize('[Users]', 'special') : this.users
		};
		return `${options.stylize('PS-Room', 'special')} ${inspect(logObj, { ...options, depth: options.depth - 1 })}`;
	}
}

module.exports = Room;
