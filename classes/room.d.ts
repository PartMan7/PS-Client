export type Users = User[] | string[] | User | string;
export class Room {
	/**
	 * @param name {string} Name of the room.
	 * @param parent {Client} Client associated with the room.
	 */
	constructor(name: string, parent: Client);
	/**
	 * Formatted name of the room.
	 * @type string
	 * @example Bot Development
	 */
	title: string;
	/**
	 * Room ID.
	 * @type string
	 * @example 'botdevelopment'
	 */
	roomid: string;
	/**
	 * Room ID.
	 * @type string
	 * @example 'botdevelopment'
	 */
	id: string;
	/**
	 * The Bot that this room is registered to.
	 * @type Client
	 */
	parent: Client;
	/**
	 * Whether the room is a chatroom or a battleroom.
	 * @type {'chat' | 'battle'}
	 */
	type: 'chat' | 'battle';
	/**
	 * Room visibility.
	 * @type {'public' | 'hidden' | 'secret' | 'private'}
	 */
	visibility: 'public' | 'hidden' | 'secret' | 'private';
	/**
	 * Current modchat level.
	 * @type {?string}
	 */
	modchat: string | null;
	/**
	 * Can be undefined if no auth is defined in the room.
	 * @type {Record<string, string[]> | undefined}
	 * @example { '*': ['partbot'] }
	 */
	auth: Record<string, string[]> | undefined;
	/**
	 * List of all users currently online, formatted as shown in chat.
	 * @type string[]
	 * @example ['#PartMan@!', '*PartBot']
	 */
	users: string[];
	_waits: any[];
	/**
	 * Sends a message to the room.
	 * @param text {string} The text to send.
	 * @returns {Promise<Message>} A promise that resolves when the message is sent successfully.
	 */
	send(text: string): Promise<Message>;
	/**
	 * Privately sends a message to a user in the room.
	 * @param user {User | string} The user to send the text to.
	 * @param text {string} The text to privately send.
	 * @returns {string | false}
	 */
	privateSend(user: User | string, text: string): string | false;
	/**
	 * Sends HTML in the room.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts=} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	sendHTML(html: HTML, opts?: HTMLOpts | undefined): string | HTML;
	/**
	 * Privately sends HTML in the room
	 * @param userList {Users} The user to send the HTML to.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	privateHTML(userList: Users, html: HTML, opts?: HTMLOpts): string | HTML;
	/**
	 * Sends HTML pages to multiple users from the room.
	 * @param userList {Users} The user to send the HTML to
	 * @param html {HTML} The HTML to send
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	pageHTML(userList: Users, html: HTML, opts?: HTMLOpts): string | HTML;
	/**
	 * Alias for User#sendHTML() that passes opts.room.
	 * @param user {User | string} The user to send the HTML to.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	pmHTML(user: User | string, html: HTML, opts?: HTMLOpts): string | HTML;
	/**
	 * Waits for the first message in the room that fulfills the given condition.
	 * @param condition {(message: Message) => boolean} A function to run on the message. Return a truthy value to satisfy.
	 * @param time {number=} The time (in ms) to wait before rejecting as a timeout. Defaults to 60s.
	 * @throws Error If timed out.
	 * @return Promise<Message>
	 */
	waitFor(condition: (message: Message) => boolean, time?: number | undefined): Promise<any>;
	/**
	 * Re-fetch the room's details from the server.
	 * @returns void
	 */
	update(): void;
	[customInspectSymbol](depth: any, options: any, inspect: any): any;
}
import type { User } from './user.js';
import type { Client } from '../client.js';
import type { Message } from './message.js';
import type { HTML } from '../types/common.d.ts';
import type { HTMLOpts } from '../types/common.d.ts';
declare const customInspectSymbol: unique symbol;
export {};
