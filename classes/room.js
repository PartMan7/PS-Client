// @ts-check
'use strict';

const { toID, toRoomID, formatText } = require('../tools.js');

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

/**
 * @import { HTMLOpts, HTML } from '../types/common.d.ts';
 * @import { Message } from './message.js';
 * @import { User } from './user.js';
 * @import { Client } from '../client.js';
 */

/** @typedef {User[] | string[] | User | string} Users */

/**
 * Maps an array to user IDs.
 * @param userList {Users}
 * @returns {string[]}
 */
function getUserIds(userList) {
	const arr = Array.isArray(userList) ? userList : [userList];
	return arr
		.map(user => {
			const clientUser = this.parent.getUser(user);
			if (clientUser) return clientUser.userid;
			if (typeof user === 'object') return user.userid;
			if (typeof user === 'string') return toID(user);
		})
		.filter(Boolean);
}

class Room {
	/**
	 * Formatted name of the room.
	 * @type string
	 * @example Bot Development
	 */
	title;
	/**
	 * Room ID.
	 * @type string
	 * @example 'botdevelopment'
	 */
	roomid;
	/**
	 * Room ID.
	 * @type string
	 * @example 'botdevelopment'
	 */
	id;
	/**
	 * The Bot that this room is registered to.
	 * @type Client
	 */
	parent;
	/**
	 * Whether the room is a chatroom or a battleroom.
	 * @type {'chat' | 'battle'}
	 */
	type;
	/**
	 * Room visibility.
	 * @type {'public' | 'hidden' | 'secret' | 'private'}
	 */
	visibility;
	/**
	 * Current modchat level.
	 * @type {?string}
	 */
	modchat;
	/**
	 * Can be undefined if no auth is defined in the room.
	 * @type {Record<string, string[]> | undefined}
	 * @example { '*': ['partbot'] }
	 */
	auth;
	/**
	 * List of all users currently online, formatted as shown in chat.
	 * @type string[]
	 * @example ['#PartMan@!', '*PartBot']
	 */
	users;
	/**
	 * @param name {string} Name of the room.
	 * @param parent {Client} Client associated with the room.
	 */
	constructor(name, parent) {
		this.roomid = toRoomID(name);
		this.parent = parent;
		this._waits = [];
		this.users = [];
	}
	/**
	 * Sends a message to the room.
	 * @param text {string} The text to send.
	 * @returns {Promise<Message>} A promise that resolves when the message is sent successfully.
	 */
	send(text) {
		return new Promise((resolve, reject) => {
			text = `${this.roomid}|${text?.toString() || String(text)}`;
			this.parent.sendQueue(text, resolve, reject);
		});
	}
	/**
	 * Privately sends a message to a user in the room.
	 * @param user {User | string} The user to send the text to.
	 * @param text {string} The text to privately send.
	 * @returns {string | false}
	 */
	privateSend(user, text) {
		if (!['*', '#', '&'].includes(this.users.find(u => toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		const target = typeof user === 'string' ? this.parent.getUser(user) : user;
		if (!target) return '';
		const formatted = formatText(text);
		this.send(`/sendprivatehtmlbox ${target.userid}, ${formatted}`);
		return formatted;
	}
	/**
	 * Sends HTML in the room.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts=} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	sendHTML(html, opts) {
		if (!['*', '#', '&'].includes(this.users.find(u => toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		if (!html) throw new Error('Missing HTML argument');
		if (typeof opts === 'string') opts = { name: opts };
		if (typeof opts !== 'object') throw new TypeError('Options must be an object');
		const fallbackName = this.parent.status.username + Date.now().toString(36);
		const formatted = opts.notransform ? html : this.parent.opts.transformHTML(html, opts);
		const command = `${opts.change ? 'change' : 'add'}${opts.rank ? 'rank' : ''}uhtml`;
		this.send(`/${command} ${opts.rank ? `${opts.rank}, ` : ''}${opts.name ?? fallbackName}, ${formatted}`);
		return formatted;
	}
	/**
	 * Privately sends HTML in the room
	 * @param userList {Users} The user to send the HTML to.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	privateHTML(userList, html, opts = {}) {
		if (!['*', '#', '&'].includes(this.users.find(u => toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		const users = getUserIds.bind(this)(userList);
		if (!users.length) return false;
		if (!html) throw new Error('Missing HTML argument');
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError('Options must be an object');
		const fallbackName = this.parent.status.username + Date.now().toString(36);
		const formatted = opts.notransform ? html : this.parent.opts.transformHTML(html, opts);
		const command = `${opts.change ? 'change' : 'send'}privateuhtml`;
		this.send(`/${command} ${users.join('|')}, ${opts.name ?? fallbackName}, ${formatted}`);
		return formatted;
	}
	/**
	 * Sends HTML pages to multiple users from the room.
	 * @param userList {Users} The user to send the HTML to
	 * @param html {HTML} The HTML to send
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	pageHTML(userList, html, opts = {}) {
		if (!['*', '#', '&'].includes(this.users.find(u => toID(u) === this.parent.status.userid)?.charAt(0))) return false;
		const users = getUserIds.bind(this)(userList);
		if (!users.length) return false;
		if (!html) throw new Error('Missing HTML argument');
		if (typeof opts === 'string') opts = { name: opts };
		if (!opts || typeof opts !== 'object') throw new TypeError('Options must be an object');
		const fallbackName = this.parent.status.username + Date.now().toString(36);
		const formatted = opts.notransform ? html : this.parent.opts.transformHTML(html, opts);
		this.send(`/sendhtmlpage ${users.join('|')}, ${opts.name ?? fallbackName}, ${formatted}`);
		return formatted;
	}
	/**
	 * Alias for User#sendHTML() that passes opts.room.
	 * @param user {User | string} The user to send the HTML to.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	pmHTML(user, html, opts = {}) {
		if (typeof opts === 'string') opts = { name: opts };
		const target = this.parent.addUser(user);
		return target?.sendHTML(html, { ...opts, room: this });
	}
	/**
	 * Waits for the first message in the room that fulfills the given condition.
	 * @param condition {(message: Message) => boolean} A function to run on the message. Return a truthy value to satisfy.
	 * @param time {number=} The time (in ms) to wait before rejecting as a timeout. Defaults to 60s.
	 * @throws Error If timed out.
	 * @return Promise<Message>
	 */
	waitFor(condition, time = 60 * 1000) {
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
				},
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
	/**
	 * Re-fetch the room's details from the server.
	 * @returns void
	 */
	update() {
		this.parent.send(`|/cmd roominfo ${this.roomid}`);
	}
	[customInspectSymbol](depth, options, inspect) {
		if (depth < 1) return options.stylize(`${this.title} [PS-Room]`, 'special');
		const logObj = {};
		// eslint-disable-next-line max-len
		const keys = [
			'roomid',
			'title',
			'type',
			'visibility',
			'modchat',
			'auth',
			'users',
			'parent',
			'send',
			'privateSend',
			'sendHTML',
			'privateHTML',
			'waitFor',
		];
		keys.forEach(key => (logObj[key] = this[key]));
		logObj.auth = {
			[customInspectSymbol]: (depth, options, inspect) => (depth <= 1 ? options.stylize('[Auth]', 'special') : this.auth),
		};
		logObj.users = {
			[customInspectSymbol]: (depth, options, inspect) => (depth <= 1 ? options.stylize('[Users]', 'special') : this.users),
		};
		return `${options.stylize('PS-Room', 'special')} ${inspect(logObj, { ...options, depth: options.depth - 1 })}`;
	}
}

exports.Room = Room;
