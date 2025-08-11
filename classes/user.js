'use strict';

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

class User {
	constructor(init, parent) {
		Object.keys(init).forEach(key => (this[key] = init[key]));
		this.id ??= init.userid;
		this.parent = parent;
		this._waits = [];
		this.alts = new Set();
	}
	#validateOpts(opts = {}) {
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError('Options must be an object');
		const fallbackName = this.parent.status.username + Date.now().toString(36);
		let room;
		if (opts.room) room = typeof opts.room === 'string' ? this.parent.getRoom(opts.room) : opts.room;
		else {
			const rooms = {};
			for (const room of this.parent.rooms.values()) {
				if (room.auth?.['*']?.includes(this.parent.status.userid) || room.auth?.['#']?.includes(this.parent.status.userid))
					rooms[room.visibility] = room;
			}
			room = rooms.public || rooms.hidden || rooms.secret || rooms.private;
		}
		return { opts: opts.name ? opts : { ...opts, name: fallbackName }, room };
	}
	send(text) {
		const user = this;
		return new Promise(function (resolve, reject) {
			text = `|/pm ${user.userid},${text?.toString() || String(text)}`;
			user.parent.sendQueue(text, resolve, reject);
		});
	}
	sendHTML(html, _opts = {}) {
		if (!html) throw new Error('Missing HTML argument');
		const { opts, room } = this.#validateOpts(_opts);
		if (!room) return null;
		const formatted = opts.notransform ? html : this.parent.opts.transformHTML(html, opts);
		room.send(`/pmuhtml${opts.change ? 'change' : ''} ${this.userid}, ${opts.name}, ${formatted}`);
		return formatted;
	}
	pageHTML(html, _opts = {}) {
		if (!html) throw new Error('Missing HTML argument');
		const { opts, room } = this.#validateOpts(_opts);
		if (!room) return null;
		const formatted = opts.notransform ? html : this.parent.opts.transformHTML(html, opts);
		room.send(`/sendhtmlpage ${this.userid}, ${opts.name}, ${formatted}`);
		return formatted;
	}
	waitFor(condition, time = 60_000) {
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
				},
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
	async update() {
		await this.parent.getUserDetails(this.userid);
		return this;
	}
	[customInspectSymbol](depth, options, inspect) {
		if (depth < 1) return options.stylize(`${this.name || '-'} [PS-User]`, 'special');
		const logObj = {};
		const keys = ['userid', 'name', 'group', 'avatar', 'autoconfirmed', 'status', 'alts', 'rooms', 'parent'];
		keys.forEach(key => (logObj[key] = this[key]));
		logObj.rooms = {
			[customInspectSymbol]: (depth, options, inspect) => (depth <= 1 ? options.stylize('[Rooms]', 'special') : this.rooms),
		};
		return `${options.stylize('PS-User', 'special')} ${inspect(logObj, { ...options, depth: options.depth - 1 })}`;
	}
}

module.exports = User;
