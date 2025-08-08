import { EventEmitter } from 'events';
import Message from './classes/message';
import Room from './classes/room';
import User from './classes/user';
import { HTMLopts } from './classes/common';

type UserDetails = { userid: string; [key: string]: any };

type ClientOpts = {
	/**
	 * The username you wish to connect to. Required parameter.
	 */
	username: string;
	/**
	 * The password for the username you're connecting to. Leave this blank if the account is unregistered.
	 */
	password?: string;
	/**
	 * The avatar your Bot will have on connection. If not specified, PS will set one randomly.
	 */
	avatar?: string | number;
	/**
	 * The status your Bot will have on connection.
	 */
	status?: string;
	/**
	 * An array with the strings of the rooms you want the Bot to join.
	 */
	rooms: string[];
	/**
	 * The function you would like to run on debugs. If this is a falsy value, debug messages will not be displayed.
	 * If a true value is given which is not a function, the Bot simply logs messages to the console.
	 */
	debug?: boolean | ((details: string) => void);
	/**
	 * Handling for internal errors. If a function is provided, this will run it with an error / string.
	 * To opt out of error handling (not recommended), set this to false.
	 * @default console.log
	 */
	handle?: boolean | ((error: string | Error) => void);
	/**
	 * Does not populate userdetails automatically. Use `Client#getUserDetails` or `User#update` to populate a user.
	 * @warning * Users will not have any properties other than id, userid, name, and alts.
	 * @warning * `User#sendHTML` and `User#pageHTML` will be disabled. Use `Room#pmHTML` or `Room#pageHTML` instead.
	 */
	sparse?: boolean;
	/**
	 * Enables scrollback (messages that are received from before the bot joins, such as
	 * chat history). Scrollback messages will be emitted with the field `isIntro: true`.
	 * @default false
	 */
	scrollback?: boolean;
	/**
	 * Dictates whether messages throw errors by default. Set to 'false' to enable messages throwing errors.
	 * @default true
	 */
	noFailMessages?: boolean;
	/**
	 * The throttle (in milliseconds) for every 'batch' of three messages. PS has a per-message throttle of
	 * 25ms for public roombots, 100ms for trusted users, and 600ms for regular users.
	 */
	throttle?: number;
	// A custom HTML processor, applied on all HTML methods. Defaults to no-transform. See HTML options for more info on opts.
	transformHTML?: (input: any, opts: HTMLopts) => string;
	/**
	 * The time, in milliseconds, that your Bot will wait before attempting to login again after failing.
	 * If this is 0, it will not attempt to login again.
	 * @default 10_000
	 */
	retryLogin?: number;
	/**
	 * The time, in milliseconds, that your Bot will wait before attempting to reconnect after a disconnect.
	 * If this is 0, it will not attempt to reconnect.
	 * @default 30_000
	 */
	autoReconnect?: boolean;
	autoReconnectDelay?: number;
	/**
	 * The time, in milliseconds, after which your connection times out.
	 * @default 20_000
	 */
	connectionTimeout?: number;
	/**
	 * The server to connect to.
	 * @default 'sim3.psim.us'
	 */
	server?: string;
	serverid?: string;
	/**
	 * The port on which you're connecting to. Can also be specified in server as `url:port`, in which case leave this field blank.
	 */
	port?: number;
	/**
	 * The protocol used for the websocket connection. Defaults to wss, but can be changed to ws (insecure).
	 * @default 'ws'
	 */
	serverProtocol?: 'ws' | 'wss';
	/**
	 * The login server.
	 * @default 'https://play.pokemonshowdown.com/~~showdown/action.php'
	 */
	loginServer?: string;
};

export interface Client {
	on(event: 'packet', listener: (direction: 'in' | 'out', data: string) => void): this;
	on(event: 'connect', listener: () => void): this;
	on(event: 'message', listener: (message: Message) => void): this;
	on(event: 'join', listener: (room: string, user: string, isIntro: boolean) => void): this;
	on(event: 'leave', listener: (room: string, user: string, isIntro: boolean) => void): this;
	on(event: 'name', listener: (room: string, newName: string, oldName: string, isIntro: boolean) => void): this;
	on(event: 'joinRoom', listener: (room: string) => void): this;
	on(event: 'leaveRoom', listener: (room: string) => void): this;
	on(event: 'chatError', listener: (room: string, error: string, isIntro: boolean) => void): this;
	on(event: string, listener: (room: string, line: string, isIntro: boolean) => void): this;
}

export class Client extends EventEmitter {
	opts: Required<Omit<ClientOpts, 'password' | 'avatar' | 'status' | 'debug'>> & ClientOpts;
	status: {
		connected: boolean;
		loggedIn: boolean;
		username?: string;
		userid?: string;
	};
	isTrusted?: boolean;
	closed: boolean;
	rooms: Map<string, Room>;
	users: Map<string, User>;

	constructor(opts: ClientOpts);

	/**
	 * Connects to the server
	 * @param retry Indicates whether this is a reconnect attempt
	 */
	connect(retry?: boolean): void;

	/**
	 * Disconnects from the server
	 */
	disconnect(): void;

	/**
	 * Logs in
	 * @param username The username to use to log in
	 * @param password The password for the username. LEave blank if unregistered
	 * @returns A promise that resolves when the login message is sent
	 */
	login(username: string, password?: string): Promise<string>;

	/**
	 * Sends a text message to the server. Unthrottled; use sendQueue for chat messages
	 * @param text The text to send
	 */
	send(text: string): void;

	/**
	 * Schedules a message to be sent, while being throttled
	 * @param text The message to send
	 * @param sent The resolve method for a promise
	 * @param fail The reject method for a promise
	 * @returns A promise that resolves when the message is sent successfully
	 */
	sendQueue(text: string, sent: (msg: Message) => any, fail: (msg: Message) => any): void;

	/**
	 * Sends a string to a user (if the user is not already tracked, they are added)
	 * @param user The user to send to
	 * @param text The message to send
	 * @returns A promise that resolves when the message is sent successfully
	 */
	sendUser(user: User | string, text: string): Promise<Message>;

	/**
	 * Adds a user to the list of tracked users on the Bot. Starts fetching userdetails in the background
	 * @param details The details of the user to add, or the full username of the user.
	 * @returns The added User
	 */
	addUser(details: string | UserDetails): User;

	/**
	 * Gets the specified user (or their current user, if they were seen on an alt)
	 * @param user The user to find
	 * @param deepSearch Whether to also look for direct alts
	 * @returns The user if found, otherwise false
	 */
	getUser(user: string, deepSearch?: boolean): User | false;

	/**
	 * Queues a request to fetch userdetails
	 * @param userid The user being queried
	 * @returns A promise that resolves with the queried userdetails
	 */
	getUserDetails(userid: string): Promise<UserDetails>;

	/**
	 * Gets a (cached) room from its name (aliases not supported)
	 * @param room The name of the room being fetched
	 * @returns The room being fetched
	 */
	getRoom(room: string): Room;

	/**
	 * Joins a room
	 * @param room The room to join
	 * @returns A promise that resolves when the room is joined
	 */
	joinRoom(room: string): Promise<void>;
}

export { Message, Room, User };

export * as Tools from './tools';

export * as Data from './data';
