import { HTMLopts } from './common.d.ts';
import { Client } from '../client.d.ts';
import Message from './message.d.ts';
import User from './user.d.ts';


export default class Room {

	title: string;
	roomid: string;
	id: string;
	parent: Client;
	type: 'chat' | 'battle';
	visibility: 'public' | 'secret';
	modchat?: string;
	auth: { [key: string]: string[] };
	users: string[];


	constructor (name: string, parent: Client);

	/**
	 * Sends a message to the room
	 * @param text - The text to send
	 * @returns A promise that resolves when the message is sent successfully
	 */
	send (text: string): Promise<Message>;

	/**
	 * Privately sends a message to a user in the room
	 * @param user - The user to send the text to
	 * @param text - The text to privately send
	 */
	privateReply (user: User | string, text: string);

	/**
	 * Sends HTML in the room
	 * @param html - The HTML to send
	 * @param opts - An instance of HTMLopts (name/rank/change)
	 */
	sendHTML (html: string, opts: HTMLopts);

	/**
	 * Privately sends HTML in the room
	 * @param user - The user to send the HTML to
	 * @param html - The HTML to send
	 * @param opts - An instance of HTMLopts (name/rank/change)
	 */
	privateHTML (user: User | string, html: string, opts: HTMLopts);

	/**
	 * Waits for the first message in the room that fulfills the given condition
	 * @param condition - A function to run on the message. Return a truthy value to satisfy
	 * @param time - The time (in ms) to wait before rejecting as a timeout
	 */
	waitFor (condition: (message: Message) => boolean, time?: number): Promise<Message>;
}
