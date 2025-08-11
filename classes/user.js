// @ts-check
'use strict';

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

/**
 * @import { HTMLOpts, HTMLOptsObject, HTML } from '../types/common.d.ts';
 * @import { Message } from './message.js';
 * @import { Room } from './room.js';
 * @import { Client } from '../client.js';
 */

class User {
	/**
	 * Formatted name of the user.
	 * @type string
	 * @example 'PartBot~'
	 */
	name;
	/**
	 * User ID (lowercase, all non-alphanumeric characters stripped).
	 * @type string
	 * @example 'partbot'
	 */
	userid;
	/**
	 * User ID (lowercase, all non-alphanumeric characters stripped).
	 * @type string
	 * @example 'partbot'
	 */
	id;
	/**
	 * Global rank.
	 * @type string
	 * @example '*'
	 */
	group;
	/**
	 * Relative avatar URL.
	 * @type string
	 * @example 'supernerd'
	 */
	avatar;
	/**
	 * Whether the user is autoconfirmed.
	 * @type boolean
	 */
	autoconfirmed;
	/**
	 * User's current status, if set.
	 * @type {string | undefined}
	 */
	status;
	/**
	 * Known list of usernames with a direct rename to/from this user.
	 * @type Set<string>
	 */
	alts;
	/**
	 * List of rooms the user is currently in.
	 * @type {{ [roomId: string]: { isPrivate?: true } } | null}
	 */
	rooms;
	/**
	 * The Bot this user is attached to.
	 * @type Client
	 */
	parent;

	/**
	 * @constructor
	 * @param init {{ name: string; userid: string }}
	 * @param parent {Client}
	 */
	constructor(init, parent) {
		Object.keys(init).forEach(key => (this[key] = init[key]));
		this.id ??= init.userid;
		this.parent = parent;
		this._waits = [];
		this.alts = new Set();
	}

	/**
	 * Validates and unifies options.
	 * @param opts {HTMLOpts}
	 * @returns {{ opts: HTMLOptsObject, room: Room | null }}
	 */
	#validateOpts(opts = {}) {
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError('Options must be an object');
		const fallbackName = this.parent.status.username + Date.now().toString(36);
		/** @type {Room | null} */
		let room = null;
		if (opts.room) room = typeof opts.room === 'string' ? this.parent.getRoom(opts.room) : opts.room;
		else {
			/** @type {Partial<Record<Room['visibility'], Room>>} */
			const rooms = {};
			for (const room of this.parent.rooms.values()) {
				if (room.auth?.['*']?.includes(this.parent.status.userid) || room.auth?.['#']?.includes(this.parent.status.userid))
					rooms[room.visibility] = room;
			}
			room = rooms.public || rooms.hidden || rooms.secret || rooms.private;
		}
		return { opts: opts.name ? opts : { ...opts, name: fallbackName }, room };
	}
	/**
	 * Sends a PM to the user.
	 * @param text {string} The text to send.
	 * @returns {Promise<Message>} A promise that resolves when the message is sent successfully
	 */
	send(text) {
		const user = this;
		return new Promise(function (resolve, reject) {
			text = `|/pm ${user.userid},${text?.toString() || String(text)}`;
			user.parent.sendQueue(text, resolve, reject);
		});
	}
	/**
	 * Sends HTML to the user.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	sendHTML(html, opts = {}) {
		if (!html) throw new Error('Missing HTML argument');
		const { opts: parsedOpts, room } = this.#validateOpts(opts);
		if (!room) return false;
		const formatted = parsedOpts.notransform ? html : this.parent.opts.transformHTML(html, parsedOpts);
		room.send(`/pmuhtml${parsedOpts.change ? 'change' : ''} ${this.userid}, ${parsedOpts.name}, ${formatted}`);
		return formatted;
	}
	/**
	 * Sends an HTML page to the user.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	pageHTML(html, opts = {}) {
		if (!html) throw new Error('Missing HTML argument');
		const { opts: parsedOpts, room } = this.#validateOpts(opts);
		if (!room) return false;
		const formatted = parsedOpts.notransform ? html : this.parent.opts.transformHTML(html, parsedOpts);
		room.send(`/sendhtmlpage ${this.userid}, ${parsedOpts.name}, ${formatted}`);
		return formatted;
	}
	/**
	 * Waits for the first message in the room that fulfills the given condition.
	 * @param condition {(message: Message) => boolean} A function to run on the message. Return a truthy value to satisfy.
	 * @param time {number} The time (in ms) to wait before rejecting as a timeout. Defaults to 60s.
	 * @throws Error If timed out.
	 * @return Promise<Message>
	 */
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
	/**
	 * Re-fetch the user's details from the server and resolve with the updated user when complete
	 * @returns Promise<User>
	 */
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

exports.User = User;
