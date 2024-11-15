import type { HTMLopts } from './common.d.ts';
import type { Client } from '../client.d.ts';
import type Room from './room.d.ts';
import type User from './user.d.ts';

type MessageOpts = {
	by: string;
	text: string;
	type: 'chat' | 'pm';
	target: string;
	raw: string;
	isIntro: boolean;
	parent: Client;
	time: void | number;
};

export default class Message {
	author: User;
	content: string;
	raw: string;
	parent: Client;
	msgRank: HTMLopts['rank'] | ' ';
	isIntro: boolean;
	awaited: boolean;
	time: number;

	type: 'chat' | 'pm';
	target: 'chat' extends this['type'] ? Room : 'pm' extends this['type'] ? User : never;
	isHidden: 'pm' extends this['type'] ? boolean : never;

	constructor(input: MessageOpts);

	/**
	 * Responds to the message
	 * @param text The text to respond (to the message) with
	 * @returns A promise that resolves when the message is sent successfully
	 */
	reply(text: string): Promise<Message>;

	/**
	 * Privately responds to the message
	 * @param text The text to privately respond (to the message) with
	 */
	privateReply(text: string): void;

	/**
	 * Sends HTML in the message context (chatroom for 'chat', PMs for 'pm')
	 * @param html The HTML to send
	 * @param opts HTML options. If a string is passed, it is used as HTMLopts.name.
	 */
	sendHTML(html: any, opts?: HTMLopts | string): boolean;

	/**
	 * Privately sends HTML in the message context (chatroom for 'chat', PMs for 'pm')
	 * @param html The HTML to send
	 * @param opts HTML options. If a string is passed, it is used as HTMLopts.name.
	 */
	replyHTML(html: any, opts?: HTMLopts | string): boolean;
}
