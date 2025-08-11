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

export default class Message<Type extends 'chat' | 'pm' = 'chat'> {
	/**
	 * Author of the message.
	 * @example User(PartMan)
	 */
	author: User;
	/**
	 * Full message content.
	 * @example 'Hi!'
	 */
	content: string;
	/**
	 * Message string, as-received from the server.
	 * @example '|c|+PartMan|Hi!'
	 */
	raw: string;
	/**
	 * Client that received the message.
	 */
	parent: Client;
	/**
	 * The rank of the author that sent the message.
	 * @example '+'
	 */
	msgRank: HTMLopts['rank'] | ' ';
	/**
	 * The command of the message. '/botmsg' will only be set as the command if no other command was used.
	 * @example '!dt'
	 */
	command: string | null;
	/**
	 * Whether the message was received before joining (eg: via history). These messages
	 * will not be emitted if scrollback is not explicitly enabled.
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
	 */
	type: Type;
	/**
	 * The room / DM in which the message was sent. For PMs, this is always the non-client
	 * User, not necessarily the author of the message!
	 * @type { Room | User | never }
	 */
	target: 'chat' extends Type ? Room : 'pm' extends Type ? User : never;
	/**
	 * Whether the message is a hidden message (from botmsg).
	 */
	isHidden: 'pm' extends Type ? boolean : never;

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
