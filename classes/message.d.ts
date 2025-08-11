/**
 * @import { Ranks, HTML, HTMLOpts } from '../types/common.d.ts';
 * @import { Client } from '../client.js';
 */
export class Message {
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
	constructor(input: {
		by: string;
		text: string;
		type: 'chat' | 'pm';
		target: string;
		raw: string;
		isIntro: boolean;
		parent: Client;
		isHidden?: boolean;
		time?: number;
	});
	/**
	 * Author of the message.
	 * @type User
	 * @example User(PartMan)
	 */
	author: User;
	/**
	 * Full message content.
	 * @type string
	 * @example 'Hi!'
	 */
	content: string;
	/**
	 * Message string, as-received from the server.
	 * @type string
	 * @example '|c|+PartMan|Hi!'
	 */
	raw: string;
	/**
	 * Client that received the message.
	 * @type Client
	 */
	parent: Client;
	/**
	 * The rank of the author that sent the message.
	 * @type {Ranks | ' '}
	 * @example '+'
	 */
	msgRank: Ranks | ' ';
	/**
	 * The command of the message. '/botmsg' will only be set as the command if no other command was used.
	 * @type {string | null}
	 * @example '!dt'
	 */
	command: string | null;
	/**
	 * Whether the message was received before joining (eg: via history). These messages
	 * will not be emitted if scrollback is not explicitly enabled.
	 * @type boolean
	 */
	isIntro: boolean;
	/**
	 * Whether this message fulfilled a waiting condition. See User/Room's `waitFor` for more info.
	 * @see {User.waitFor}
	 * @see {Room.waitFor}
	 * @type boolean
	 */
	awaited: boolean;
	/**
	 * UNIX timestamp that the message was received at.
	 * @type number
	 */
	time: number;
	/**
	 * Chatrooms have 'chat', while PMs have 'pm'. Some methods/properties change accordingly.
	 * @type { 'chat' | 'pm' }
	 */
	type: 'chat' | 'pm';
	/**
	 * The room / DM in which the message was sent. For PMs, this is always the non-client
	 * User, not necessarily the author of the message!
	 * @type { Room | User | never }
	 */
	target: Room | User | never;
	/**
	 * Whether the message is hidden (eg: `/botmsg`).
	 * @type {boolean}
	 */
	isHidden: boolean;
	/**
	 * Responds to the message.
	 * @param text {string} The text to respond (to the message) with.
	 * @returns {Promise<Message>} A promise that resolves when the message is sent successfully.
	 */
	reply(text: string): Promise<Message>;
	/**
	 * Privately responds to the message.
	 * @param text {string} The text to privately respond (to the message) with.
	 * @returns void
	 */
	privateReply(text: string): void;
	/**
	 * Sends HTML in the message context (chatroom for 'chat', PMs for 'pm').
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {HTML | string} Returns HTML only if `opts.notransform` is true.
	 */
	sendHTML(html: HTML, opts: HTMLOpts): HTML | string;
	/**
	 * Privately sends HTML in the message context (chatroom for 'chat', PMs for 'pm')
	 * @param html {HTML} The HTML to send
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {HTML | string} Returns HTML only if `opts.notransform` is true.
	 */
	replyHTML(html: HTML, opts: HTMLOpts): HTML | string;
	[customInspectSymbol](depth: any, options: any, inspect: any): any;
}
import { User } from './user.js';
import type { Client } from '../client.js';
import type { Ranks } from '../types/common.d.ts';
import { Room } from './room.js';
import type { HTML } from '../types/common.d.ts';
import type { HTMLOpts } from '../types/common.d.ts';
declare const customInspectSymbol: unique symbol;
export {};
