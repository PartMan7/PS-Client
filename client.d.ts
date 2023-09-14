import * as events from 'events';
import type Message from './classes/message.d.ts';
import type Room from './classes/room.d.ts';
import type User from './classes/user.d.ts';

type ClientOpts = {
	username: string,
	password?: string,
	avatar?: string,
	status?: string,
	rooms: string[],
	debug?: boolean,
	noFailMessages?: boolean,
	throttle?: number,
	retryLogin?: number,
	autoReconnect?: boolean,
	autoReconnectDelay?: number,
	connectionTimeout?: number,
	server?: string,
	serverid?: string,
	port?: number,
	loginServer?: string
};

export interface Client {
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

export class Client extends events.EventEmitter {
	opts: {
		username: string,
		password?: string,
		avatar?: string,
		status?: string,
		rooms: string[],
		debug?: boolean,
		noFailMessages: boolean,
		throttle?: number,
		retryLogin: number,
		autoReconnect: boolean,
		autoReconnectDelay: number,
		connectionTimeout: number,
		server: string,
		serverid: string,
		port: number,
		loginServer: string
	};
	status: {
		connected: boolean,
		loggedIn: boolean,
		username?: string,
		userid?: string
	};
	isTrusted?: boolean;
	closed: boolean;
	rooms: Map<string, Room>;
	users: Map<string, User>;


	constructor (opts: ClientOpts);

	/**
	 * Connects to the server
	 * @param retry - Indicates whether this is a reconnect attempt
	 */
	connect (retry?: boolean);

	/**
	 * Disconnects from the server
	 */
	disconnect ();

	/**
	 * Logs in
	 * @param username - The username to use to log in
	 * @param password - The password for the username. LEave blank if unregistered
	 * @returns A promise that resolves when the login message is sent
	 */
	login (username: string, password?: string): Promise<string>;

	/**
	 * Sends a text message to the server. Unthrottled; use sendQueue for chat messages
	 * @param text - The text to send
	 */
	send (text: string);

	/**
	 * Schedules a message to be sent, while being throttled
	 * @param text - the message to send
	 * @param sent - the resolve method for a promise
	 * @param fail - the reject method for a promise
	 * @returns A promise that resolves when the message is sent successfully
	 */
	sendQueue (text: string, sent: (msg: Message) => any, fail: (msg: Message) => any);

	/**
	 * Sends a string to a user (if the user is not already tracked, they are added)
	 * @param user-  The user to send to
	 * @param text - The message to send
	 * @returns A promise that resolves when the message is sent successfully
	 */
	sendUser (user: User | string, text: string): Promise<Message>;

	/**
	 * Adds a user to the list of tracked users on the Bot. Starts fetching userdetails in the background
	 * @param details - The details of the user to add
	 * @returns The added User
	 */
	addUser (details: { userid: string, [key: string]: any }): User;

	/**
	 * Gets the specified user (or their current user, if they were seen on an alt)
	 * @param user-  The user to find
	 * @returns The user if found, otherwise false
	 */
	getUser (user: string): User | false;

	/**
	 * Queues a request to fetch userdetails
	 * @param user - The user being queried
	 * @returns A promise that resolves with the queried userdetails
	 */
	getUserDetails (userid: string): Promise<User>;

	/**
	 * Gets a (cached) room from its name (aliases not supported)
	 * @param room - The name of the room being fetched
	 * @returns The room being fetched
	 */
	getRoom (room: string): Room;

	/**
	 * Joins a room
	 * @param room - The room to join
	 * @returns A promise that resolves when the room is joined
	 */
	joinRoom (room: string): Promise<void>;
}

export { Message, Room, User };
