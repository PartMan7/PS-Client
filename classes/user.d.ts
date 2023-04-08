import { HTMLopts } from './common.d.ts';
import { Client } from '../client.d.ts';
import Message from './message.d.ts';


export default class User {

	name: string;
	userid: string;
	id: string;
	group: string;
	avatar: string;
	autoconfirmed: boolean;
	status?: string;
	alts: string[];
	rooms: { [key: string]: { isPrivate?: true } };
	parent: Client;


	constructor (init: object, parent: Client);

	/**
	 * Sends a PM to the user
	 * @param text - The text to send
	 * @returns A promise that resolves when the message is sent successfully
	 */
	send (text: string): Promise<Message>;

	/**
	 * Sends HTML to the user
	 * @param html - The HTML to send
	 * @param opts - An instance of HTMLopts (name/rank/change)
	 */
	sendHTML (html: string, opts: HTMLopts);

	/**
	 * Sends an HTML page to the user
	 * @param html - The HTML to send
	 * @param name - The name of the HTML page
	 */
	pageHTML (html: string, name: string);

	/**
	 * Waits for the first message in the room that fulfills the given condition
	 * @param condition - A function to run on incoming messages. Return a truthy value to satisfy
	 * @param time - The time (in ms) to wait before rejecting as a timeout
	 */
	waitFor (condition: (message: Message) => boolean, time?: number);
}
