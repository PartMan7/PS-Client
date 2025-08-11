// @ts-check
'use strict';

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

const { toID } = require('../tools.js');
const { User } = require('./user.js');
const { Room } = require('./room.js');

/**
 * @import { Ranks, HTML, HTMLOpts } from '../types/common.d.ts';
 * @import { Client } from '../client.js';
 */

class Message {
	/**
	 * Author of the message.
	 * @type User
	 * @example User(PartMan)
	 */
	author;
	/**
	 * Full message content.
	 * @type string
	 * @example 'Hi!'
	 */
	content;
	/**
	 * Message string, as-received from the server.
	 * @type string
	 * @example '|c|+PartMan|Hi!'
	 */
	raw;
	/**
	 * Client that received the message.
	 * @type Client
	 */
	parent;
	/**
	 * The rank of the author that sent the message.
	 * @type {Ranks | ' '}
	 * @example '+'
	 */
	msgRank;
	/**
	 * The command of the message. '/botmsg' will only be set as the command if no other command was used.
	 * @type {string | null}
	 * @example '!dt'
	 */
	command;
	/**
	 * Whether the message was received before joining (eg: via history). These messages
	 * will not be emitted if scrollback is not explicitly enabled.
	 * @type boolean
	 */
	isIntro;
	/**
	 * Whether this message fulfilled a waiting condition. See User/Room's `waitFor` for more info.
	 * @see {User.waitFor}
	 * @see {Room.waitFor}
	 * @type boolean
	 */
	awaited;
	/**
	 * UNIX timestamp that the message was received at.
	 * @type number
	 */
	time;
	/**
	 * Chatrooms have 'chat', while PMs have 'pm'. Some methods/properties change accordingly.
	 * @type { 'chat' | 'pm' }
	 */
	type;
	/**
	 * The room / DM in which the message was sent. For PMs, this is always the non-client
	 * User, not necessarily the author of the message!
	 * @type { Room | User | never }
	 */
	target;
	/**
	 * Whether the message is hidden (eg: `/botmsg`).
	 * @type {boolean}
	 */
	isHidden;

	/**
	 * @constructor
	 * @param input {{
	 * 	by: string;
	 * 	text: string;
	 * 	type: 'chat' | 'pm';
	 * 	target: string;
	 * 	raw: string;
	 * 	isIntro: boolean;
	 * 	parent: Client;
	 * 	isHidden?: boolean;
	 * 	time?: number;
	 * }}
	 */
	constructor(input) {
		const { by, text, type, target, raw, isIntro, parent, time, isHidden } = input;

		const msgRank = /** @type {Ranks} */ (by[0]);
		const byId = toID(by);
		if (byId && !parent.users.get(byId)) {
			parent.addUser(by);
		}
		this.author = byId ? parent.users.get(byId) : null;
		this.content = text;
		const match = text.match(/^[/!][^ ]+/);
		if (match) this.command = match[0];
		else this.command = null;
		this.msgRank = msgRank;
		this.raw = raw;
		this.parent = parent;
		this.type = type;
		this.isIntro = Boolean(isIntro);
		this.awaited = false;
		this.time = time || Date.now();
		switch (this.type) {
			case 'chat':
				this.target = this.parent.rooms.get(target);
				break;
			case 'pm':
				this.target = byId ? this.parent.users.get(target) : null;
				this.isHidden = isHidden;
				if (isHidden && !this.command) this.command = '/botmsg';
				break;
			default:
				this.parent.handle(new Error(`Message: Expected type chat/pm; got ${this.type}`));
		}
	}
	/**
	 * Responds to the message.
	 * @param text {string} The text to respond (to the message) with.
	 * @returns {Promise<Message>} A promise that resolves when the message is sent successfully.
	 */
	reply(text) {
		return this.target.send(text);
	}
	/**
	 * Privately responds to the message.
	 * @param text {string} The text to privately respond (to the message) with.
	 * @returns void
	 */
	privateReply(text) {
		if (this.target instanceof User) this.reply(text);
		else if (this.target instanceof Room) {
			const privateSend = this.target.privateSend(this.author.userid, text);
			if (privateSend === false) this.author.send(text);
		}
	}
	/**
	 * Sends HTML in the message context (chatroom for 'chat', PMs for 'pm').
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {HTML | string} Returns HTML only if `opts.notransform` is true.
	 */
	sendHTML(html, opts) {
		return this.target.sendHTML(html, opts);
	}
	/**
	 * Privately sends HTML in the message context (chatroom for 'chat', PMs for 'pm')
	 * @param html {HTML} The HTML to send
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {HTML | string} Returns HTML only if `opts.notransform` is true.
	 */
	replyHTML(html, opts) {
		if (this.target instanceof User) return this.target.sendHTML(html, opts);
		if (this.target instanceof Room) return this.target.privateHTML(this.author.userid, html, opts);
		return '';
	}
	[customInspectSymbol](depth, options, inspect) {
		if (depth < 1) return options.stylize(`${this.content} [PS-Message]`, 'special');
		const logObj = {};
		const keys = ['content', 'type', 'raw', 'time', 'author', 'target', 'command', 'parent', 'isIntro', 'awaited'];
		keys.forEach(key => (logObj[key] = this[key]));
		return `${options.stylize('PS-Message', 'special')} ${inspect(logObj, { ...options, depth: options.depth - 1 })}`;
	}
}

exports.Message = Message;
