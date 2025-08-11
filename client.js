// @ts-check
'use strict';

const EventEmitter = require('events');
const querystring = require('querystring');
const WebSocket = require('isomorphic-ws');
/** @import { ClientOpts, ClientEvents } from './types/client-opts.d.ts'; */

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

const { User } = require('./classes/user.js');
const { Room } = require('./classes/room.js');
const { Message } = require('./classes/message.js');
const Tools = require('./tools.js');

const Data = require('./data.js');

/** @typedef {{ userid: string; [key: string]: any }} UserDetails */

/**
 * The client that will connect to Showdown.
 * @class Client
 * @implements {ClientEvents}
 */
class Client extends EventEmitter {
	/**
	 * Final client options after applying defaults.
	 * @type {ClientOpts}
	 */
	opts;
	/**
	 * Information about the connection status.
	 * @type {{ connected: boolean; loggedIn: boolean; inited: boolean; username?: (string|null); userid?: (string|null) }}
	 */
	status;
	/**
	 * Whether the client is trusted.
	 * @type {boolean}
	 */
	isTrusted;
	/**
	 * Whether the connection is currently closed.
	 * @type {boolean}
	 */
	closed;
	/**
	 * Collection of rooms.
	 * @type {Map<string, Room>}
	 */
	rooms;
	/**
	 * Collection of users.
	 * @type {Map<string, User>}
	 */
	users;
	/**
	 * @constructor
	 * @param opts {ClientOpts}
	 */
	constructor(opts) {
		super();
		this.opts = {
			server: 'sim3.psim.us',
			serverid: 'showdown',
			serverProtocol: 'wss',
			connectionTimeout: 20_000,
			loginServer: 'https://play.pokemonshowdown.com/action.php',
			username: null,
			password: null,
			avatar: null,
			status: null,
			sparse: false,
			retryLogin: 4 * 1000,
			autoReconnectDelay: 5 * 1000,
			rooms: [],
			debug: false,
			throttle: null,
			transformHTML: html => html,
			noFailMessages: false,
			scrollback: false,
		};
		Object.assign(this.opts, opts);
		this.opts[customInspectSymbol] = (depth, options, inspect) => {
			const clonedOpts = { ...this.opts };
			clonedOpts.password = '########';
			return clonedOpts;
		};

		this.isTrusted = null;

		this.status = {
			connected: false,
			loggedIn: false,
			username: null,
			userid: null,
			inited: false,
		};
		this.closed = true;
		this._queue = [];
		this._queued = [];
		this._userdetailsQueue = [];
		this._pendingRoomJoins = [];
		this._deinitedRoomJoins = [];

		// eslint-disable-next-line no-console -- Default debugger
		this.debug = typeof opts.debug === 'function' ? opts.debug : opts.debug ? console.log : () => {};
		// eslint-disable-next-line no-console -- Default handler
		this.handle = opts.handle === null ? () => {} : typeof opts.handle === 'function' ? opts.handle : console.error;
	}

	// Websocket
	/**
	 * Connects to the server.
	 * @param retry {boolean=} Indicates whether this is a reconnect attempt.
	 * @returns void
	 */
	connect(retry) {
		if (retry) this.debug('Retrying...');
		if (this.status.connected) return this.handle('Already connected');
		this.closed = false;

		this.rooms = new Map();
		this.rooms[customInspectSymbol] = function (depth, options) {
			return `Map(${this.size}) { ${[...this.keys()].map(room => options.stylize(room, 'special')).join(', ')} }`;
		};
		this.users = new Map();
		this.users[customInspectSymbol] = function (depth, options) {
			return `Map(${this.size}) { ${options.stylize('...', 'special')} }`;
		};

		const id = ~~(Math.random() * 900) + 100;
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789_'.split('');
		const str = Array.from({ length: 8 }, () => chars[~~(Math.random() * 36)]).join('');
		const { server, serverProtocol, port } = this.opts;
		const websocketUrl = `${serverProtocol}://${server}${port ? `:${port}` : ''}/showdown/${id}/${str}/websocket`;
		this.debug(`Connecting to ${websocketUrl}`);
		const connection = new WebSocket(websocketUrl);
		this.connection = connection;

		connection.onopen = () => {
			this.emit('connect');
			this.debug(`Connected to server: ${this.opts.server}`);
			this.status.connected = true;
		};
		connection.onerror = err => {
			this.debug(`Could not connect to the server ${this.opts.server}`);
			this.handle(err);
			this._resetStatus();
			this.emit('disconnect', err);
			if (this.opts.autoReconnectDelay) {
				this.debug(`Retrying in ${this.opts.autoReconnectDelay / 1000} seconds`);
				setTimeout(() => this.connect(true), this.opts.autoReconnectDelay);
			}
		};
		connection.onmessage = message => {
			this.emit('packet', 'in', message.data);
			this.emit('raw', message.data);
			this.receive(message.data);
		};
		connection.onclose = () => {
			this.debug('Connection closed');
			this.connection = null;
			this._resetStatus();
			this.emit('disconnect', 0);
			if (!this.closed && this.opts.autoReconnectDelay) {
				this.debug(`Retrying in ${this.opts.autoReconnectDelay / 1000} seconds.`);
				setTimeout(() => this.connect(true), this.opts.autoReconnectDelay);
			}
		};
	}
	/**
	 * Disconnects from the server.
	 * @returns void
	 */
	disconnect() {
		this.closed = true;
		this.ready = false;
		clearInterval(this.queueTimer);
		this.connection?.close();
	}
	/**
	 * Reset status after a disconnect.
	 * @private
	 * @returns void
	 */
	_resetStatus() {
		this.status = {
			connected: false,
			loggedIn: false,
			username: null,
			userid: null,
			inited: false,
		};
	}

	/**
	 * Logs in.
	 * @param username {string} The username to use to log in.
	 * @param password {string} The password for the username. Leave blank if unregistered.
	 * @returns {Promise<void>} A promise that resolves when the login message is sent.
	 */
	async login(username, password) {
		this.debug('Sending login request...');
		let res;
		if (!password) {
			res = await fetch(
				`${this.opts.loginServer}?${querystring.stringify({ act: 'getassertion', userid: Tools.toID(username), ...this.challstr })}`
			);
		} else {
			res = await fetch(this.opts.loginServer, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: querystring.stringify({ act: 'login', name: Tools.toID(username), pass: password, ...this.challstr }),
			});
		}
		const response = await res.text();
		try {
			if (response === ';') throw new Error('Username is registered but no password given');
			else if (response.length < 50) throw new Error(`Failed to login: ${response}`);
			else if (response.includes('heavy load')) throw new Error('The login server is under heavy load');

			let trnData;
			try {
				const resData = JSON.parse(response.substr(1));
				if (!resData.assertion) throw new Error(`Failed to login: ${response}`);
				trnData = resData.assertion;
				if (trnData.startsWith(';;')) throw new Error(trnData.substr(2));
			} catch (err) {
				if (err.message.includes('JSON')) trnData = response;
				else throw err;
				// POST (registered) login uses JSON, GET (unregistered) login uses the string directly;
			}
			this.debug('Sending login trn...');
			this.send(`|/trn ${username},0,${trnData}`);
		} catch (err) {
			this.debug('Login error');
			this.handle(err);
			if (this.opts.retryLogin) {
				this.debug(`Retrying login in ${this.opts.retryLogin / 1000} seconds...`);
				setTimeout(() => this.login(username, password), this.opts.retryLogin);
			}
			this.emit('loginfailure', err);
		}
	}

	// Sending data
	/**
	 * Starts sending messages in queue once the throttle is known.
	 * @private
	 * @returns void
	 */
	_activateQueue() {
		const throttle = this.opts.throttle || (this.isTrusted ? 300 : 1800);
		if (this.activatedQueue && this.throttle === throttle) return; // No need to adjust throttle
		this.throttle = throttle;
		this.activatedQueue = true;
		clearInterval(this.queueTimer);
		this.queueTimer = setInterval(() => {
			const messages = this._queue.splice(0, 3);
			if (!messages.length) return;
			this._queued.push(...messages.filter(msg => /^(?:[a-z0-9-]+\|[^/]|\|\/pm [^,]+,[^/])/.test(msg.content)));
			this.send(Object.values(messages).map(message => message.content));
		}, throttle);
	}
	/**
	 * Sends a text message to the server. Unthrottled; use sendQueue for chat messages.
	 * @param text {string | string[]} The text to send.
	 * @returns void
	 */
	send(text) {
		if (!text.length) return;
		if (!this.connection) return this.handle('Not connected!');
		if (!Array.isArray(text)) text = [text];
		if (text.length > 3) this.handle('The message limit is 3 at a time! Please use Client#sendQueue instead.');
		text = JSON.stringify(text);
		this.emit('packet', 'out', text);
		this.connection.send(text);
	}
	/**
	 * Schedules a message to be sent, while being throttled.
	 * @param text {string} The message to send.
	 * @param sent {((msg: Message) => void)=} The resolve method for a promise.
	 * @param fail {((err: { cause: string, message: string }) => void)=} The reject method for a promise.
	 * @returns void
	 */
	sendQueue(text, sent, fail) {
		if (!this.status.connected) return fail?.({ cause: 'Not connected.', message: text });
		const multiTest = text.match(/^([a-z0-9-]*?\|(?:\/pm [^,]*?, ?)?)[^/!].*?\n/);
		if (multiTest) {
			// Multi-line messages
			Promise.all(
				text
					.split('\n')
					.map((line, i) => {
						if (i) line = multiTest[1] + line;
						return line;
					})
					.map(line => {
						return new Promise((resolve, reject) => this._queue.push({ content: line, sent: resolve, fail: reject }));
					})
			)
				.then(messages => {
					const message = messages[messages.length - 1];
					message.content = text;
					sent?.(message);
				})
				.catch(error => fail?.(error));
		} else this._queue.push({ content: text, sent, fail });
	}
	/**
	 * Sends a string to a user (if the user is not already tracked, they are added).
	 * @param user {User | string} The user to send to.
	 * @param text {string} The message to send.
	 * @returns {Promise<Message>} A promise that resolves when the message is sent successfully.
	 */
	sendUser(user, text) {
		let userid;
		if (user instanceof User) userid = user.userid;
		else userid = Tools.toID(user);
		if (!userid) this.handle('Invalid ID in Client#sendUser');
		this.addUser({ userid });
		return this.users.get(userid).send(text);
	}

	// Receiving data
	/**
	 * Maps the incoming packets into data.
	 * @private
	 * @param message {string} The received packet.
	 * @returns void
	 */
	receive(message) {
		this.lastMessage = Date.now();
		const flag = message.substr(0, 1);
		switch (flag) {
			case 'a': {
				const data = JSON.parse(message.substr(1));
				if (Array.isArray(data)) data.forEach(piece => this.receiveMsg(piece));
				else this.receiveMsg(message);
				break;
			}
		}
	}
	/**
	 * Maps the incoming data into individual lines.
	 * @private
	 * @param message {string}
	 * @returns void
	 */
	receiveMsg(message) {
		if (!message) return;
		if (message.includes('\n')) {
			const split = message.split('\n');
			let room = 'lobby';
			if (split[0].charAt(0) === '>') {
				room = split.shift().substring(1);
				if (room === '') room = 'lobby';
			}
			let isIntro = false;

			for (const line of split) {
				if (line.split('|')[1] === 'init') isIntro = true;
				try {
					this.receiveLine(room, line, isIntro);
				} catch (e) {
					this.handle(e);
				}
			}
		} else
			try {
				this.receiveLine('lobby', message);
			} catch (e) {
				this.handle(e);
			}
	}

	/**
	 * Runs on each received line of input and emits events accordingly.
	 * @param room {string} The room the line was received in.
	 * @param message {string} The raw content of the message.
	 * @param isIntro {boolean=} Whether the line was received as part of an `|init|`.
	 */
	receiveLine(room, message, isIntro) {
		if (!isIntro || this.opts.scrollback) this.emit('line', room, message, isIntro);
		const args = message.split('|');
		switch (args[1]) {
			case 'formats': {
				if (!isIntro || this.opts.scrollback) this.emit('formats', room, args.slice(2).join('|'), isIntro);
				break;
			}
			case 'updateuser': {
				this.status.username = args[2].substring(1);
				this.status.userid = Tools.toID(this.status.username);
				if (!args[2].startsWith(' Guest')) {
					this.debug(`Successfully logged in as '${args[2]}.'`);
					this.status.loggedIn = true;
					this.emit('login', args[2]);
					this.send('|/ip');
					this._activateQueue();
					if (!this.ready && this.opts.rooms.length === 0) {
						this.ready = true;
						this.emit('ready');
					}
					if (!this.status.inited) {
						this.opts.rooms.forEach(room => this.joinRoom(room).catch(this.handle));
						if (this.opts.avatar) this.send(`|/avatar ${this.opts.avatar}`);
					}
					this.status.inited = true;
				}
				if (!isIntro || this.opts.scrollback) this.emit('updateuser', room, args.slice(2).join('|'), isIntro);
				break;
			}
			case 'challstr': {
				this.challstr = {
					challengekeyid: args[2],
					challstr: args[3],
				};
				if (this.opts.username) {
					this.debug('Logging in');
					this.login(this.opts.username, this.opts.password).catch(e => this.handle(e));
				}
				break;
			}
			case 'init': {
				if (!this.rooms.get(room)) this.rooms.set(room, new Room(room, this));
				this.send(`|/cmd roominfo ${room}`);
				this.emit('joinRoom', room);
				const pendingIndex = this._pendingRoomJoins.findIndex(obj => obj.room === room);
				if (pendingIndex >= 0) {
					this._pendingRoomJoins[pendingIndex].resolve();
					this._pendingRoomJoins.splice(pendingIndex, 1);
				} else this._deinitedRoomJoins.shift()?.resolve(); // This is a bit hacky, honestly...
				if (!this.ready && this._pendingRoomJoins.length === 0 && this._deinitedRoomJoins.length === 0) {
					this.ready = true;
					this.emit('ready');
				}
				break;
			}
			case 'deinit': {
				if (this.rooms.get(room)) this.rooms.delete(room);
				this.emit('leaveRoom', room);
				const pendingIndex = this._pendingRoomJoins.findIndex(obj => obj.room === room);
				if (pendingIndex >= 0) {
					this._deinitedRoomJoins.push(...this._pendingRoomJoins.splice(pendingIndex, 1));
				} else this._deinitedRoomJoins.unshift({ resolve() {} });
				break;
			}
			case 'noinit': {
				const pendingIndex = this._pendingRoomJoins.findIndex(obj => obj.room === room);
				if (pendingIndex >= 0) {
					this._pendingRoomJoins[pendingIndex].reject(new Error(`Unable to join room '${room}'`));
					this._pendingRoomJoins.splice(pendingIndex, 1);
				}
				if (!this.ready && this._pendingRoomJoins.length === 0 && this._deinitedRoomJoins.length === 0) {
					this.ready = true;
					this.emit('ready');
				}
				break;
			}
			case 'html': {
				if (!isIntro || this.opts.scrollback) this.emit('html', room, args.slice(2).join('|'), isIntro);
				break;
			}
			case 'queryresponse': {
				switch (args[2]) {
					case 'roominfo': {
						let roominfo;
						try {
							roominfo = JSON.parse(args.slice(3).join('|'));
						} catch (e) {
							this.handle(`Error in parsing roominfo: ${e.message}`);
						}
						if (!this.rooms.get(roominfo.roomid)) break;
						Object.keys(roominfo).forEach(key => (this.rooms.get(roominfo.roomid)[key] = roominfo[key]));
						if (!this.opts.sparse) roominfo.users.forEach(user => this.getUserDetails(user).catch(this.handle));
						break;
					}
					case 'userdetails': {
						let userdetails;
						try {
							userdetails = JSON.parse(args.slice(3).join('|'));
						} catch (e) {
							this.handle(`Error in parsing userdetails: ${e.message}`);
						}
						if (!userdetails) break;
						this.addUser(userdetails);
						const user = this._userdetailsQueue.find(u => u.id === userdetails.id);
						if (user) {
							user.resolve(userdetails);
							this._userdetailsQueue.splice(this._userdetailsQueue.indexOf(user), 1);
						}
						break;
					}
				}
				if (!isIntro || this.opts.scrollback) this.emit('queryresponse', room, args.slice(2).join('|'), isIntro);
				break;
			}
			case 'chat':
			case 'c':
			case 'c:': {
				const by = args[3],
					value = args.slice(4).join('|'),
					resolved = [];
				const time = parseInt(args[2]) * (args[1] === 'c:' ? 1_000 : 1);
				const mssg = new Message({
					by,
					text: value,
					type: 'chat',
					target: room,
					raw: message,
					isIntro,
					parent: this,
					time,
				});
				if (mssg.target) {
					mssg.target._waits.forEach(wait => {
						if (wait.condition(mssg)) {
							mssg.awaited = true;
							wait.resolve(mssg);
							clearTimeout(wait.timedOut);
							resolved.push(wait.id);
						}
					});
					mssg.target._waits = mssg.target._waits.filter(wait => !resolved.includes(wait.id));
					if (mssg.author.userid === this.status.userid && !isIntro) {
						const checkVal = `${room}|${value}`;
						if (this._queued.some(msg => msg.content === checkVal)) {
							while (this._queued.length) {
								const msg = this._queued.shift();
								if (msg.content === checkVal) {
									msg.sent?.(mssg);
									break;
								}
								if (this.opts.noFailMessages) msg.fail?.(msg.content);
							}
						}
					}
				}
				if (!isIntro || this.opts.scrollback) this.emit('message', mssg);
				break;
			}
			case 'pm': {
				const by = args[2],
					to = args[3],
					resolved = [];
				let value = args.slice(4).join('|');
				const isHidden = value.startsWith('/botmsg ');
				if (isHidden) value = value.replace(/^\/botmsg /, '');
				const chatWith = by.substr(1) === this.status.username ? to : by,
					comp = `|/pm ${Tools.toID(to)},${value}`;
				const mssg = new Message({
					by: by,
					text: value,
					type: 'pm',
					isHidden,
					target: Tools.toID(chatWith),
					raw: message,
					isIntro: isIntro,
					parent: this,
				});
				if (mssg.command && mssg.command === 'error') mssg.target._waits.shift().fail?.(mssg.content.substr(7));
				if (mssg.target) {
					mssg.target._waits.forEach(wait => {
						if (wait.condition(mssg)) {
							mssg.awaited = true;
							wait.resolve(mssg);
							clearTimeout(wait.timedOut);
							resolved.push(wait.id);
						}
					});
					mssg.target._waits = mssg.target._waits.filter(wait => !resolved.includes(wait.id));
					if (!isIntro && by.substr(1) === this.status.username && this._queued.map(msg => msg.content).includes(comp)) {
						while (this._queued.length) {
							const msg = this._queued.shift();
							if (msg.content === comp) {
								msg.sent?.(mssg);
								break;
							}
							if (this.opts.noFailMessages) msg.fail?.(msg.content);
							// eslint-disable-next-line max-len
							if (/^\/error (?:User .*? is offline\.|User .*? not found\. Did you misspell their name\?)$/.test(value)) break;
						}
					}
				} else {
					if (value.startsWith('/raw ') && this.status?.loggedIn) {
						const oldValue = this.opts.isTrusted;
						this.isTrusted = value.includes('<small style="color:gray">(trusted)</small>');
						if (typeof oldValue !== 'boolean') {
							this.emit('activate');
							this._activateQueue();
						}
					}
				}
				if (!isIntro || this.opts.scrollback) this.emit('message', mssg);
				break;
			}
			case 'j':
			case 'J':
			case 'join': {
				const username = args.slice(2).join('|');
				if (this.opts.sparse) {
					const cacheRoom = this.getRoom(room);
					if (cacheRoom?.users) {
						cacheRoom.users.push(username);
					}
				} else this.send(`|/cmd roominfo ${room}`);
				this.addUser({ userid: Tools.toID(username) });
				if (!isIntro || this.opts.scrollback) this.emit('join', room, username, isIntro);
				break;
			}
			case 'l':
			case 'L':
			case 'leave': {
				const username = args.slice(2).join('|');
				if (this.opts.sparse) {
					const cacheRoom = this.getRoom(room);
					if (cacheRoom?.users) {
						cacheRoom.users = cacheRoom.users.filter(user => user !== username);
					}
				} else this.send(`|/cmd roominfo ${room}`);
				if (!isIntro || this.opts.scrollback) this.emit('leave', room, username, isIntro);
				break;
			}
			case 'n':
			case 'N':
			case 'name': {
				if (!isIntro || this.opts.scrollback) {
					// Nicks are stored in logs for stuff like battlerooms
					this.emit('name', room, args[2], args[3], isIntro);
				}
				const newName = args[2];
				const oldId = Tools.toID(args[3]);
				const newId = Tools.toID(newName);
				if (this.opts.sparse) {
					const cacheRoom = this.getRoom(room);
					if (cacheRoom?.users) {
						cacheRoom.users = cacheRoom.users.map(user => (Tools.toID(user) === oldId ? newName : user));
					}
				} else this.send(`|/cmd roominfo ${room}`);
				if (!this.users[oldId]) break;
				this.users[oldId].alts.add(newId);
				this.users[newId] = this.users[oldId];
				delete this.users[oldId];
				if (!this.opts.sparse) this.getUserDetails(newId);
				break;
			}
			case 'error': {
				if (!isIntro || this.opts.scrollback) this.emit('chatError', room, args.slice(2).join('|'), isIntro);
				break;
			}
			default:
				if (!isIntro || this.opts.scrollback) this.emit(args[1], room, args.slice(2).join('|'), isIntro);
		}
	}

	// Utility
	/**
	 * Adds a user to the list of tracked users on the Bot. Starts fetching userdetails in the background.
	 * @param details {UserDetails | string} The details of the user to add, or the full username of the user.
	 * @returns {User} The added User.
	 */
	addUser(details) {
		let userid, name;
		if (typeof details === 'string') {
			userid = Tools.toID(details);
			name = details.replace(/^\W/, '');
		} else {
			userid = details?.userid;
			name = details?.name;
			name ??= userid;
		}
		if (!userid) throw new Error('Input must be an object with userid or a string for new User');
		let user = this.users.get(userid);
		if (!user) {
			user = new User({ userid, name }, this);
			this.users.set(userid, user);
			if (!this.opts.sparse) this.getUserDetails(userid);
		}
		if (typeof details === 'object') Object.keys(details).forEach(key => (user[key] = details[key]));
		return user;
	}
	/**
	 * Gets the specified user (or their current user, if they were seen on an alt).
	 * @param input {User | string} The user to find.
	 * @param deepSearch {boolean=} Whether to also look for direct alts.
	 * @returns {User | null} The user if found, otherwise null.
	 */
	getUser(input, deepSearch = false) {
		/** @type {string} */
		let str;
		if (typeof input === 'object' && input instanceof User) str = input.userid;
		else str = input;
		if (typeof str !== 'string') return null;
		str = Tools.toID(str);
		if (this.users.get(str)) return this.users.get(str);
		if (deepSearch) {
			for (const user of this.users.values()) {
				if (user.alts?.has(str)) return user;
			}
		}
		return null;
	}
	/**
	 * Queues a request to fetch userdetails
	 * @param userid {string} The user being queried
	 * @returns {Promise<UserDetails>} A promise that resolves with the queried userdetails
	 */
	getUserDetails(userid) {
		userid = Tools.toID(userid);
		const client = this;
		return new Promise(resolve => {
			this.send(`|/cmd userdetails ${userid}`);
			client._userdetailsQueue.push({ id: userid, resolve: resolve });
		});
	}
	/**
	 * Gets a (cached) room from its name (aliases not supported).
	 * @param room {string} The name of the room being fetched.
	 * @returns {Room | null} The room being fetched.
	 */
	getRoom(room) {
		const roomid = Tools.toRoomID(room);
		return this.rooms.get(roomid); // Sadly there's no easy way to update aliases
	}
	/**
	 * Joins a room.
	 * @param room {string} The room to join.
	 * @returns A promise that resolves when the room is joined.
	 */
	joinRoom(room) {
		room = Tools.toRoomID(room);
		return new Promise((resolve, reject) => {
			this._pendingRoomJoins.push({
				room,
				resolve,
				reject,
			});
			this.sendQueue(`|/join ${room}`);
		});
	}

	[customInspectSymbol](depth, options, inspect) {
		if (depth < 1) return options.stylize(`${this.status.username || '-'} [PS-Client]`, 'special');
		const outKeys = ['opts', 'status', 'rooms', 'users', 'isTrusted', 'closed'];
		const logObj = {};
		outKeys.forEach(key => (logObj[key] = this[key]));
		return `${options.stylize('PS-Client', 'special')} ${inspect(logObj, options)}`;
	}
}

module.exports = {
	Client,
	Message,
	User,
	Room,
	Tools,
	Data,
};
