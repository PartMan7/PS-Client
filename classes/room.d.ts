import type { HTMLopts } from './common.d.ts';
import type { Client } from '../client.d.ts';
import type Message from './message.d.ts';
import type User from './user.d.ts';

export default class Room {
	/**
	 * Formatted name of the room.
	 * @example Bot Development
	 */
	title: string;
	/**
	 * Room ID.
	 * @example botdevelopment
	 */
	roomid: string;
	/**
	 * Room ID.
	 * @example botdevelopment
	 */
	id: string;
	/**
	 * The Bot that this room is registered to.
	 */
	parent: Client;
	/**
	 * Whether the room is a chatroom or a battleroom.
	 */
	type: 'chat' | 'battle';
	/**
	 * Room visibility.
	 */
	visibility: 'public' | 'secret';
	/**
	 * Current modchat level
	 */
	modchat?: string;
	/**
	 * Can be undefined if no auth is defined in the room.
	 * @example { '*': ['partbot'] }
	 */
	auth?: { [key: string]: string[] };
	/**
	 * List of all users currently online, formatted as shown in chat.
	 * @example ['#PartMan@!', '*PartBot']
	 */
	users: string[];

	constructor(name: string, parent: Client);

	/**
	 * Sends a message to the room.
	 * @param text The text to send
	 * @returns A promise that resolves when the message is sent successfully
	 */
	send(text: string): Promise<Message>;

	/**
	 * Privately sends a message to a user in the room.
	 * @param user The user to send the text to
	 * @param text The text to privately send
	 */
	privateSend(user: User | string, text: string): string | false;

	/**
	 * Sends HTML in the room.
	 * @param html The HTML to send
	 * @param opts HTML options. If a string is passed, it is used as HTMLopts.name.
	 */
	sendHTML(html: any, opts?: HTMLopts | string): string | false;

	/**
	 * Privately sends HTML in the room
	 * @param user The user to send the HTML to
	 * @param html The HTML to send
	 * @param opts HTML options. If a string is passed, it is used as HTMLopts.name.
	 */
	privateHTML(user: User | string | (User | string)[], html: any, opts?: HTMLopts | string): string | false;

	/**
	 * Sends HTML pages to multiple users from the room.
	 * @param user The user to send the HTML to
	 * @param html The HTML to send
	 * @param opts HTML options. If a string is passed, it is used as HTMLopts.name.
	 */
	pageHTML(user: User | string | (User | string)[], html: any, opts?: HTMLopts | string): string | false;

	/**
	 * Alias for User#sendHTML() that passes opts.room.
	 * @param user The user to send the HTML to
	 * @param html The HTML to send
	 * @param opts HTML options. If a string is passed, it is used as HTMLopts.name.
	 */
	pmHTML(user: User | string, html: any, opts?: HTMLopts | string): string | false;

	/**
	 * Waits for the first message in the room that fulfills the given condition.
	 * @param condition A function to run on the message. Return a truthy value to satisfy
	 * @param time The time (in ms) to wait before rejecting as a timeout
	 */
	waitFor(condition: (message: Message) => boolean, time?: number): Promise<Message>;

	/**
	 * Re-fetch the room's details from the server.
	 */
	update(): void;
}
