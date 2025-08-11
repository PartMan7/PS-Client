/**
 * @import { HTMLOpts, HTMLOptsObject, HTML } from '../types/common.d.ts';
 * @import { Message } from './message.js';
 * @import { Room } from './room.js';
 * @import { Client } from '../client.js';
 */
export class User {
	/**
	 * @constructor
	 * @param init {{ name: string; userid: string }}
	 * @param parent {Client}
	 */
	constructor(
		init: {
			name: string;
			userid: string;
		},
		parent: Client
	);
	/**
	 * Formatted name of the user.
	 * @type string
	 * @example 'PartBot~'
	 */
	name: string;
	/**
	 * User ID (lowercase, all non-alphanumeric characters stripped).
	 * @type string
	 * @example 'partbot'
	 */
	userid: string;
	/**
	 * User ID (lowercase, all non-alphanumeric characters stripped).
	 * @type string
	 * @example 'partbot'
	 */
	id: string;
	/**
	 * Global rank.
	 * @type string
	 * @example '*'
	 */
	group: string;
	/**
	 * Relative avatar URL.
	 * @type string
	 * @example 'supernerd'
	 */
	avatar: string;
	/**
	 * Whether the user is autoconfirmed.
	 * @type boolean
	 */
	autoconfirmed: boolean;
	/**
	 * User's current status, if set.
	 * @type {string | undefined}
	 */
	status: string | undefined;
	/**
	 * Known list of usernames with a direct rename to/from this user.
	 * @type Set<string>
	 */
	alts: Set<string>;
	/**
	 * List of rooms the user is currently in.
	 * @type {{ [roomId: string]: { isPrivate?: true } } | null}
	 */
	rooms: {
		[roomId: string]: {
			isPrivate?: true;
		};
	} | null;
	/**
	 * The Bot this user is attached to.
	 * @type Client
	 */
	parent: Client;
	_waits: any[];
	/**
	 * Sends a PM to the user.
	 * @param text {string} The text to send.
	 * @returns {Promise<Message>} A promise that resolves when the message is sent successfully
	 */
	send(text: string): Promise<Message>;
	/**
	 * Sends HTML to the user.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	sendHTML(html: HTML, opts?: HTMLOpts): string | HTML;
	/**
	 * Sends an HTML page to the user.
	 * @param html {HTML} The HTML to send.
	 * @param opts {HTMLOpts} HTML options. If a string is passed, it is used as HTMLOpts.name.
	 * @returns {string | HTML} Returns HTML only if `opts.notransform` is true.
	 */
	pageHTML(html: HTML, opts?: HTMLOpts): string | HTML;
	/**
	 * Waits for the first message in the room that fulfills the given condition.
	 * @param condition {(message: Message) => boolean} A function to run on the message. Return a truthy value to satisfy.
	 * @param time {number} The time (in ms) to wait before rejecting as a timeout. Defaults to 60s.
	 * @throws Error If timed out.
	 * @return Promise<Message>
	 */
	waitFor(condition: (message: Message) => boolean, time?: number): Promise<any>;
	/**
	 * Re-fetch the user's details from the server and resolve with the updated user when complete
	 * @returns Promise<User>
	 */
	update(): Promise<this>;
	#private;
}
import type { Client } from '../client.js';
import type { Message } from './message.js';
import type { HTML } from '../types/common.d.ts';
import type { HTMLOpts } from '../types/common.d.ts';
