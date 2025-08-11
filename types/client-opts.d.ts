// These need to be declared in an actual file because JSDoc is bloody atrocious.

import type { Message } from '../classes/message.js';
import type { HTMLOpts } from './common.d.ts';

export type ClientOpts = {
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
	 * To opt out of error handling (not recommended), set this to null.
	 * @default console.log
	 */
	handle?: ((error: string | Error) => void) | null;
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
	transformHTML?: (input: any, opts: HTMLOpts) => string;
	/**
	 * The time, in milliseconds, that your Bot will wait before attempting to login again after failing.
	 * If this is 0, it will not attempt to login again.
	 * @default 10_000
	 */
	retryLogin?: number;
	autoReconnect?: boolean;
	/**
	 * The time, in milliseconds, that your Bot will wait before attempting to reconnect after a disconnect.
	 * If this is 0, it will not attempt to reconnect.
	 * @default 30_000
	 */
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
	/**
	 * Explicitly specify whether the client is trusted (trusted users on PS
	 * have slightly more permissions and features). The client will try to
	 * infer this by default.
	 */
	isTrusted?: boolean;
};

export interface ClientEvents {
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
