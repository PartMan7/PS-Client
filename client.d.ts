export type UserDetails = {
	userid: string;
	[key: string]: any;
};
/** @typedef {{ userid: string; [key: string]: any }} UserDetails */
/**
 * The client that will connect to Showdown.
 * @class Client
 * @implements {ClientEvents}
 */
export class Client extends EventEmitter<any> implements ClientEvents {
	/**
	 * @constructor
	 * @param opts {ClientOpts}
	 */
	constructor(opts: ClientOpts);
	/**
	 * Final client options after applying defaults.
	 * @type {ClientOpts}
	 */
	opts: ClientOpts;
	/**
	 * Information about the connection status.
	 * @type {{ connected: boolean; loggedIn: boolean; inited: boolean; username?: (string|null); userid?: (string|null) }}
	 */
	status: {
		connected: boolean;
		loggedIn: boolean;
		inited: boolean;
		username?: string | null;
		userid?: string | null;
	};
	/**
	 * Whether the client is trusted.
	 * @type {boolean}
	 */
	isTrusted: boolean;
	/**
	 * Whether the connection is currently closed.
	 * @type {boolean}
	 */
	closed: boolean;
	/**
	 * Collection of rooms.
	 * @type {Map<string, Room>}
	 */
	rooms: Map<string, Room>;
	/**
	 * Collection of users.
	 * @type {Map<string, User>}
	 */
	users: Map<string, User>;
	_queue: any[];
	_queued: any[];
	_userdetailsQueue: any[];
	_pendingRoomJoins: any[];
	_deinitedRoomJoins: any[];
	debug: {
		(...data: any[]): void;
		(message?: any, ...optionalParams: any[]): void;
	};
	handle: {
		(...data: any[]): void;
		(message?: any, ...optionalParams: any[]): void;
	};
	/**
	 * Connects to the server.
	 * @param retry {boolean=} Indicates whether this is a reconnect attempt.
	 * @returns void
	 */
	connect(retry?: boolean | undefined): void;
	connection: any;
	/**
	 * Disconnects from the server.
	 * @returns void
	 */
	disconnect(): void;
	ready: boolean;
	/**
	 * Reset status after a disconnect.
	 * @private
	 * @returns void
	 */
	private _resetStatus;
	/**
	 * Logs in.
	 * @param username {string} The username to use to log in.
	 * @param password {string} The password for the username. Leave blank if unregistered.
	 * @returns {Promise<void>} A promise that resolves when the login message is sent.
	 */
	login(username: string, password: string): Promise<void>;
	/**
	 * Starts sending messages in queue once the throttle is known.
	 * @private
	 * @returns void
	 */
	private _activateQueue;
	throttle: number;
	activatedQueue: boolean;
	queueTimer: NodeJS.Timeout;
	/**
	 * Sends a text message to the server. Unthrottled; use sendQueue for chat messages.
	 * @param text {string | string[]} The text to send.
	 * @returns void
	 */
	send(text: string | string[]): void;
	/**
	 * Schedules a message to be sent, while being throttled.
	 * @param text {string} The message to send.
	 * @param sent {((msg: Message) => void)=} The resolve method for a promise.
	 * @param fail {((err: { cause: string, message: string }) => void)=} The reject method for a promise.
	 * @returns void
	 */
	sendQueue(
		text: string,
		sent?: ((msg: Message) => void) | undefined,
		fail?: ((err: { cause: string; message: string }) => void) | undefined
	): void;
	/**
	 * Sends a string to a user (if the user is not already tracked, they are added).
	 * @param user {User | string} The user to send to.
	 * @param text {string} The message to send.
	 * @returns {Promise<Message>} A promise that resolves when the message is sent successfully.
	 */
	sendUser(user: User | string, text: string): Promise<Message>;
	/**
	 * Maps the incoming packets into data.
	 * @private
	 * @param message {string} The received packet.
	 * @returns void
	 */
	private receive;
	lastMessage: number;
	/**
	 * Maps the incoming data into individual lines.
	 * @private
	 * @param message {string}
	 * @returns void
	 */
	private receiveMsg;
	/**
	 * Runs on each received line of input and emits events accordingly.
	 * @param room {string} The room the line was received in.
	 * @param message {string} The raw content of the message.
	 * @param isIntro {boolean=} Whether the line was received as part of an `|init|`.
	 */
	receiveLine(room: string, message: string, isIntro?: boolean | undefined): void;
	challstr: {
		challengekeyid: string;
		challstr: string;
	};
	/**
	 * Adds a user to the list of tracked users on the Bot. Starts fetching userdetails in the background.
	 * @param details {UserDetails | string} The details of the user to add, or the full username of the user.
	 * @returns {User} The added User.
	 */
	addUser(details: UserDetails | string): User;
	/**
	 * Gets the specified user (or their current user, if they were seen on an alt).
	 * @param input {User | string} The user to find.
	 * @param deepSearch {boolean=} Whether to also look for direct alts.
	 * @returns {User | null} The user if found, otherwise null.
	 */
	getUser(input: User | string, deepSearch?: boolean | undefined): User | null;
	/**
	 * Queues a request to fetch userdetails
	 * @param userid {string} The user being queried
	 * @returns {Promise<UserDetails>} A promise that resolves with the queried userdetails
	 */
	getUserDetails(userid: string): Promise<UserDetails>;
	/**
	 * Gets a (cached) room from its name (aliases not supported).
	 * @param room {string} The name of the room being fetched.
	 * @returns {Room | null} The room being fetched.
	 */
	getRoom(room: string): Room | null;
	/**
	 * Joins a room.
	 * @param room {string} The room to join.
	 * @returns A promise that resolves when the room is joined.
	 */
	joinRoom(room: string): Promise<any>;
	[customInspectSymbol](depth: any, options: any, inspect: any): any;
}
import { Message } from './classes/message.js';
import { User } from './classes/user.js';
import { Room } from './classes/room.js';
import Tools = require('./tools.js');
import Data = require('./data.js');
import type { ClientEvents } from './types/client-opts.d.ts';
import EventEmitter = require('events');
import type { ClientOpts } from './types/client-opts.d.ts';
/** @import { ClientOpts, ClientEvents } from './types/client-opts.d.ts'; */
declare const customInspectSymbol: unique symbol;
export { Message, User, Room, Tools, Data };
