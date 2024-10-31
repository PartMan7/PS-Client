import type { HTMLopts } from './common.d.ts';
import type { Client } from '../client.d.ts';
import type Message from './message.d.ts';

export default class User {
	/**
	 * Formatted name of the user
	 * @example PartBot~
	 */
	name: string;
	/**
	 * User ID (lowercase, all non-alphanumeric characters stripped)
	 * @example partbot
	 */
	userid: string;
	/**
	 * User ID (lowercase, all non-alphanumeric characters stripped)
	 * @example partbot
	 */
	id: string;
	/**
	 * Global rank
	 * @example *
	 */
	group: string;
	/**
	 * Relative avatar URL
	 * @example supernerd
	 */
	avatar: string;
	/**
	 * Whether the user is autoconfirmed
	 */
	autoconfirmed: boolean;
	/**
	 * User's current status, if set
	 */
	status?: string;
	/**
	 * Known list of usernames with a direct rename to/from this user
	 */
	alts: string[];
	/**
	 * List of rooms the user is currently in
	 */
	rooms: { [key: string]: { isPrivate?: true } } | false;
	/**
	 * The Bot this user is attached to
	 */
	parent: Client;

	constructor(init: object, parent: Client);

	/**
	 * Sends a PM to the user
	 * @param text The text to send
	 * @returns A promise that resolves when the message is sent successfully
	 */
	send(text: string): Promise<Message>;

	/**
	 * Sends HTML to the user
	 * @param html The HTML to send
	 * @param opts An instance of HTMLopts (name/rank/change)
	 */
	sendHTML(html: string, opts?: HTMLopts): boolean;
	/**
	 * Sends HTML to the user without processing
	 * @param html The HTML to send
	 * @param opts An instance of HTMLopts (name/rank/change)
	 */
	sendRawHTML(html: string, opts?: HTMLopts): boolean;

	/**
	 * Sends an HTML page to the user
	 * @param html The HTML to send
	 * @param name The name of the HTML page
	 */
	pageHTML(html: string, name: string): boolean;
	/**
	 * Sends an HTML page to the user without processing the HTML
	 * @param html The HTML to send
	 * @param name The name of the HTML page
	 */
	pageRawHTML(html: string, name: string): boolean;

	/**
	 * Waits for the first message in the room that fulfills the given condition
	 * @param condition A function to run on incoming messages. Return a truthy value to satisfy
	 * @param time The time (in ms) to wait before rejecting as a timeout
	 */
	waitFor(condition: (message: Message) => boolean, time?: number): Promise<Message>;

	/**
	 * Re-fetch the user's details from the server and resolve with the updated user when complete
	 */
	update(): Promise<User>;
}
