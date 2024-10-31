# Documentation

### Client Structure

Client is an instance of an EventEmitter, and is the primary class. You can generate multiple Clients in the same script and execute them in parallel.

Client has the following properties:

- `opts`: An object containing most of the configuration options. Note that Client.opts.password is a function that returns the password instead of a string.
- `isTrusted`: A boolean that indicates whether the Bot is running on a trusted account. Until this is received, this value is null.
- `rooms`: A Map containing all the rooms the Bot is in. The keys are the room IDs, while the values are [Room](#room-structure) instances.
- `users`: A Map containing all the users the Bot is aware of. The keys are the user IDs, while the values are [User](#user-structure) instances.
- `status`: An object containing four keys regarding the status of the connection. These are: `connected`, which is a Boolean that indicates whether the Bot is currently connected, `loggedIn`: a boolean that indicates whether the Bot has logged in successfully, `username`, which is the username the Bot has connected under, and `userid`, the corresponding user ID.
- `closed`: A boolean that indicates whether the connection is currently closed.
- `debug`, `handle`: These are where the debug and handler functions are stored.

Client also has the following methods:

- `connect (reconnect: boolean): void` - Creates the websocket to connect to the server, then logs in. `reconnect` has no significance besides logging the attempt as a reconnection attempt.
- `disconnect: void` - Closes the connection.
- `login (username: string, password: string | undefined): void` - Logs in with the given credentials. Requires the websocket to have been created.
- `getUser (username: string | User, deep: boolean): User | false | null` - Finds a user among tracked users. Returns the user instance (in case deep is true and the user has been tracked while renaming, it returns the new User instance). Returns `null` for an invalid input and `false` if the user is not tracked.
- `sendUser (username: string | User, text: string): Promise<Message>` - Sends the provided string to the specified user.
- `send (text: string): void` - Sends the provided string to the server. This bypasses the queue, and can cause the Bot to exceed the throttle. **Using Room#send or User#send instead is highly recommended.**

Client has the following events:

- `message (message: Message)` - Emitted whenever a message is received (includes both chat and PMs).
- `join (room: string, user: string, isIntro: boolean)` - Emitted whenever a user joins a room.
- `leave (room: string, user: string, isIntro: boolean)` - Emitted whenever a user leaves a room.
- `name (room: string, newName: string, oldName: string, isIntro: boolean)` - Emitted whenever a user renames from `oldName` to `newName`.
- `joinRoom (room: string)` - Emitted whenever the Client joins a room.
- `leaveRoom (room: string)` - Emitted whenever the Client leaves a room.
- `chaterror (room: string, error: string, isIntro: boolean)` - Emitted whenever an error appears in chat, regardless of the source.

(`isIntro` indicates whether the event occurred prior to the connection.)

Apart from these, Client emits all events from [this](https://github.com/smogon/pokemon-showdown/blob/master/PROTOCOL.md) not specified here with the following syntax:
`(event) (room: string, line: string, isIntro: boolean)`

### Message Structure

Message represents each message object, regardless of whether it is in PM or chat. It also includes messages sent by the client.
As of now, messages that are redirected to a different username are not resolving / rejecting properly, and will be addressed.

Message has the following properties:

- `author`: The User object of the author of the message.
- `content`: The string of the message content.
- `command`: Represents the command that the message has (!dt, for example). If this is not a command, this is `false`.
- `msgRank`: The rank of the author as shown in the message.
- `parent`: The Client that received the message.
- `type`: The type of the message being received. Can be either `'pm'` or `'chat'`.
- `isIntro`: A boolean that indicates whether the message was received as a past message on connection.
- `time`: The Unix datestamp that indicates when the message was created. This is normally received from PS! wherever possible, but uses `Date.now()` if the data is unavailable.
- `target`: This can be either a [Room](#room-structure) or a [User](#user-structure), depending on whether the type is `'chat'` or `'pm'`. If the type is `'chat'`, this is the Room in which the message was sent. If the type is `'pm'`, this is the User with which the PM is with - note that this is not always the target of the PM, such as in cases where the Bot receives a PM from another user.
- `raw`: The original received message (ie, a message of the form `|c|+PartMan|Hi!` would have that as the raw and `Hi!` as the content).
- `awaited`: A Boolean value indicating whether the message was used to resolve a Room#waitFor or User#waitFor promise.

Message has the following methods:

- `reply (text: string): Promise<Message>` sends a message to the target and returns a Promise that is resolved with the sent Message, or is rejected with the message content. This is a shortcut for `Message#target#send`.
- `privateReply (text: string): true` sends a private response (private HTML message (formatted by `Tools#formatText`) in the room if possible, otherwise a direct message).
- `sendHTML (html: string, opts?: HTMLopts): boolean` is an alias for [Room#sendHTML](#room-structure) and [User#sendHTML](#user-structure).
- `replyHTML (html: string, opts?: HTMLopts): boolean` is an alias for [Room#privateHTML](#room-structure) and [User#sendHTML](#user-structure).

Note: A message can have `author` and `target` nullish if sent by the `&` account. Handle those accordingly!

### Room Structure

Room is the class that represents a chatroom on the server. By default, the Client only spawns Room instances for rooms that the Bot is in.

Room has the following properties:

- `parent`: This is the Client that holds the Room object.
- `roomid`: The ID of the room.
- `id`: Also the ID of the room, because why not?
- `title`: The display title of the room. This does not always correspond to the room ID.
- `type`: The type of the room. Can be either `'chat'` or `'battle'`.
- `visibility`: The display permissions of the room. Public rooms have `'public'`, for example.
- `modchat`: The modchat level of the room.
- `auth`: An object that contains the roomauth of the room. The structure is `(rank symbol): userid[]`.
- `users`: An array that contains the display names, as well as ranks, of the users in the room.

Room has the following methods:

- `send (text: string): Promise<Message>` sends a message to the Room and returns a Promise that is resolved with the sent [Message](#message-structure), or is rejected with the message content.
- `privateSend (user: string | User, text: string): boolean` sends a message in chat that is only visible to the specified user. Returns `false` if the client does not have permissions. Text is formatted using `Tools#formatText`.
- `sendHTML (html: string, opts?: HTMLopts): boolean` sends a UHTML box to the room with the specified (optional) options. For example: `Room.sendHTML('<b>This is an example.</b>', { rank: '+', change: true })`
- `privateHTML (user: string | User, html: string, opts?: HTMLopts): boolean` behaves similarly to sendHTML, the difference being that privateHTML only sends the HTML to the specified user.
- `waitFor (condition: (message: Message): boolean, time: number): Promise<Message>` waits for a message in the Room. This is resolved when the Client receives a message from the Room for which `condition` returns true, and is rejected if (time) milliseconds pass without being resolved. By default, time corresponds to 1 minute - you can set it to 0 to disable the time limit.
- `update (): void` refetches the entire room metadata (as well as all userdetails of users in the room).

### User Structure

User is the class that represents a user on the server. By default, the Client only spawns User instances for users that:

1. Are in one or more of the rooms the Bot is in.
2. Have been sent a message by the Bot (the User is spawned immediately before sending the message).
3. Have sent a PM to the Bot.

User has the following properties:

- `parent`: This is the Client that holds the User object.
- `alts`: This is an array of the userids of known alts of the user.
- `userid`: The ID of the user.
- `id`: (Probably don't use this.)
- `avatar`: The string / number referring to the avatar of the user. This is _not_ the complete avatar URL.
- `name`: The string that shows the displayed name of the user, including capital letters and other characters.
- `group`: The global rank of the user. Is ` ` for regular users.
- `autoconfirmed`: Indicates whether the user is autoconfirmed.
- `status`: The string of the status set by the user. If no status is set, this is `""`.
- `rooms`: An object containing the rooms of the user, structured as `(rank + roomid): {}` or `(rank + roomid): { isPrivate: true }`.

User has the following methods:

- `send (text: string): Promise<Message>` sends a message to the User and returns a Promise that is resolved with the sent [Message](#message-structure), or is rejected with the message content.
- `sendHTML (html: string, opts?: HTMLopts): boolean` sends a UHTML box to the user with the specified (optional) options. For example: `User.sendHTML('<b>This is an example.</b>', { change: true })`
- `pageHTML (html: string, opts?: HTMLopts): boolean` sends a UHTML box to the user with the specified (optional) options (reusing a name will overwrite the previous page). For example: `User.pageHTML("<b>Let's play chess!</b>", { name: "chess" })`
- `waitFor (condition: (message: Message): boolean, time: number): Promise<Message>` waits for a message from the User. This is resolved when the Client receives a message from the User for which `condition` returns true, and is rejected if (time) milliseconds pass without being resolved. By default, time corresponds to 1 minute - you can set it to 0 to disable the time limit.
- `update (): Promise<User>` updates and resolves with the current user's information after re-fetching from the server.

### HTML Options

`HTMLopts` has four possible options:

- `name`: The name of the HTML page / UHTML box.
- `rank`: Minimum rank required to see the HTML.
- `change`: Whether to add a new entry and remove the old UHTML, or to modify the old UHTML in-place.
- `notransform`: To skip running `transformHTML` on the given HTML.
