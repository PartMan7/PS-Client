import { EventEmitter } from 'events';
import Message from './classes/message';
import Room from './classes/room';
import User from './classes/user';

type UserDetails = { userid: string; [key: string]: any };

type ClientOpts = {
	username: string;
	password?: string;
	avatar?: string;
	status?: string;
	rooms: string[];
	debug?: boolean;
	noFailMessages?: boolean;
	throttle?: number;
	retryLogin?: number;
	autoReconnect?: boolean;
	autoReconnectDelay?: number;
	connectionTimeout?: number;
	server?: string;
	serverid?: string;
	port?: number;
	serverProtocol?: string;
	loginServer?: string;
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

export class Client extends EventEmitter {
	opts: {
		username: string;
		password?: string;
		avatar?: string;
		status?: string;
		rooms: string[];
		debug?: boolean;
		noFailMessages: boolean;
		throttle?: number;
		retryLogin: number;
		autoReconnect: boolean;
		autoReconnectDelay: number;
		connectionTimeout: number;
		server: string;
		serverid: string;
		port: number;
		loginServer: string;
	};
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
	 * @param details The details of the user to add
	 * @returns The added User
	 */
	addUser(details: UserDetails): User;

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
