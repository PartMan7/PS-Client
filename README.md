# ps-client
This is a module that handles connection to Pokemon Showdown servers. Apart from a _very_ minimalistic configuration requirement, it also boasts multiple utility features, like promise-based messages, synchronized room and user data, alt tracking, and a lot of other stuff - go through the documentation for a complete summary.

## Table of Contents

- [Example](#example-setup)
- [Configuration](#configuration)
- [Structure](#structrue)
    - [Client](#client-structure)
    - [Message](#message-structure)
    - [User](#user-structure)
    - [Room](#room-structure)
- [Credits](#credits)


## Example Setup

```javascript
const Client = require('ps-client').Client;
let Bot = new Client({username: 'PartMan', password: 'REDACTED', debug: true, avatar: 'supernerd', autoJoin: ['botdevelopment']});

Bot.connect();

Bot.on('message', message => {
    if (message.isIntro) return;
    if (message.content === 'Ping!') return message.reply('Pong!')
});
```

## Configuration

Creating a Bot is fairly simple - all you have to do is create a new instance of the Client and pass the configuration options.

```javascript
const Client = require('ps-client').Client;
let Bot = new Client({username: name, password: password});

Bot.connect();
```

There are multiple configuration options that can be specified - here's a complete list.

```javascript
{
    username: string, // The username you wish to connect to. Required parameter.
    password: string, // The password for the username you're connecting to. Leave this blank if the account is unregistered.
    server: string, //The server to which you wish to connect to - defaults to 'sim.smogon.com'.
    port: number, //The port on which you're connecting to. Defaults to 8000.
    connectionTimeout: number, // The time, in milliseconds, after which your connection times out. Defaults to 2 minutes.
    loginServer: string, // The login server. Defaults to 'https://play.pokemonshowdown.com/~~showdown/action.php'.
    avatar: string | number, // The avatar your Bot will have on connection. If not specified, PS will set one randomly.
    status: string, // The status your Bot will have on connection.
    retryLogin: number, // The time, in milliseconds, that your Bot will wait before attempting to login again after a failing. If this is 0, it will not attempt to login again. Defaults to 10 seconds.
    autoReconnect: number, // The time, in milliseconds, that your Bot will wait before attempting to reconnect after a disconnect. If this is 0, it will not attempt to reconnect. Defaults to 30 seconds.
    autoJoin: string[], // An array with the strings of the rooms you want the Bot to join.
    debug: (details: string): any, // The function you would like to run on debugs. If this is a falsey value, debug messages will not be displayed. If a true value is given which is not a function, the Bot simply logs messages to the console.
    handle: (error: string | Error): any // Handling for internal errors. If a function is provided, this will run it with an error / string. The default function logs them to the console. To opt out of error handling (not recommended), set this to null.
}
```

## Structure

### Client Structure
Client is an instance of an EventEmitter, and is the primary class. You can generate multiple Clients in the same script and execute them in parallel.

Client has the following properties:
* `opts`: An object containing most of the configuration options. Note that Client.opts.password is a function that returns the password instead of a string.
* `isTrusted`: A boolean that indicates whether the Bot is running on a trusted account. Until this is received, this value is null.
* `rooms`: An object containing all the rooms the Bot is in. The keys are the room IDs, while the values are [Room](#room-structure) instances.
* `users`: An object containing all the users the Bot is aware of. The keys are the user IDs, while the values are [User](#user-structure) instances.
* `status`: An object containing three keys regarding the status of the connection. These are: ``connected``, which is a Boolean that indicates whether the Bot is currently connected, ``loggedIn``: a boolean that indicates whether the Bot has logged in successfully, and ``username``, which is the username the Bot has connected under.
* `closed`: A boolean that indicates whether the connection is currently closed.
* `queue`: An array that contains the messages that are currently in an outbound queue. Each element is of the form ``{content: string, sent: function, fail: function}``, where content is the message string, and sent / fail are the functions that handle the message promise.
* `queued`: An array that contains messages that have been sent but not resolved. Elements are of the same structure as above.
* `debug`, `handle`: These are where the debug and handler functions are stored.

Client also has the following methods:
* `connect (reconnect: boolean): void` - Creates the websocket to connect to the server, then logs in. ``reconnect`` has no significance besides logging the attempt as a reconnection attempt.
* `disconnect: void` - Closes the connection.
* `login (username: string, password: string | undefined): void` - Logs in with the given credentials. Requires the websocket to have been created.
* `getUser (username: string): User` - Finds a user among tracked users. Returns the user instance (in case the user has been tracked while renaming, the new User instance).
* `send (text: string): void` - Sends the provided string to the server. This bypasses the queue, and can cause the Bot to exceed the throttle. Use Room#send or User#send instead.

Client has the following events:

* `message (message: Message)` - Emitted whenever a message is received (includes both chat and PMs).
* `join (room: string, user: string, isIntro: boolean)` - Emitted whenever a user joins a room.
* `leave (room: string, user: string, isIntro: boolean)` - Emitted whenever a user leaves a room.
* `name (room: string, newName: string, oldName: string)` - Emitted whenever a user renames from `oldName` to `newName`.
* `joinRoom (room: string)` - Emitted whenever the Client joins a room.
* `leaveRoom (room: string)` - Emitted whenever the Client leaves a room.

(`isIntro` indicates whether the event occurred prior to the connection.)

Apart from these, Client emits all events from [this](https://github.com/smogon/pokemon-showdown/blob/master/PROTOCOL.md) not specified here with the following syntax:
 ``(event) (room: string, line: string, isIntro: boolean)``


### Message Structure
Message represents each message object, regardless of whether it is in PM or chat. It also includes messages sent by the client.

Message has the following properties:
* `author`: The User object of the author of the message.
* `content`: The string of the message content.
* `parent`: The Client that received the message.
* `type`: The type of the message being received. Can be either `'pm'` or `'chat'`.
* `isIntro`: A boolean that indicates whether the message was received as a past message on connection.
* `time`: The Unix datestamp that indicates when the message was created. This is normally received from PS! wherever possible, but uses `Date.now()` if the data is unavailable.
* `target`: This can be either a [Room](#room-structure) or a [User](#user-structure), depending on whether the type is chat or pm. If the type is chat, this is the Room in which the message was sent. If the type is pm, this is the User with which the PM is with - note that this is not always the target of the PM, such as in cases where the Bot receives a PM from another user.
* `original`: The original received message (ie, a message of the form `|c|+PartMan|Hi!` would have that as the original and `Hi!` as the content).

Message only has one method:
* `reply (text: string): Promise<Message>` sends a message to the target and returns a Promise that is resolved with the sent Message, or is rejected with the message content. This is a shortcut for `Message#target#send`.


### User Structure
User is the class that represents a user on the server. By default, the Client only spawns User instances for users that: 
1. Are in one or more of the rooms the Bot is in.
2. Have been sent a message by the Bot (the User is spawned immediately before sending the message).
3. Have sent a PM to the Bot.

User has the following properties:
* `parent`: This is the Client that holds the User object.
* `alts`: This is an array of the userids of known alts of the user.
* `waits`: This is an array of messages that are being awaited. Ideally, leave these alone.
* `userid`: The ID of the user.
* `id`: (Probably don't use this.)
* `avatar`: The string / number referring to the avatar of the user. This is _not_ the complete avatar URL.
* `name`: The string that shows the displayed name of the user, including capital letters and other characters.
* `group`: The global rank of the user. Is ` ` for regular users.
* `autoconfirmed`: Indicates whether the user is autoconfirmed.
* `status`: The string of the status set by the user. If no status is set, this is ``""``.
* `rooms`: An object containing the rooms of the user, structured as `(rank)(roomid): {}` or `(rank)(roomid): {isPrivate: true}`.

User has the following methods:
* `send (text: string): Promise<Message>` sends a message to the User and returns a Promise that is resolved with the sent [Message](#message-structure), or is rejected with the message content.
* `waitFor (condition: (message: Message): boolean, time: number): Promise<Message>` waits for a message from the User. This is resolved when the Client receives a message from the User for which `condition` returns true, and is rejected if (time) milliseconds pass without being resolved. By default, time corresponds to 1 minute - you can set it to 0 to disable the time limit.


### Room Structure
Room is the class that represents a chatroom on the server. By default, the Client only spawns Room instances for rooms that the Bot is in.

Room has the following properties:
* `parent`: This is the Client that holds the Room object.
* `waits`: This is an array of messages that are being awaited. Ideally, leave these alone.
* `roomid`: The ID of the room.
* `id`: Also the ID of the room, because why not?
* `title`: The display title of the room. This does not always correspond to the room ID.
* `type`: The type of the room. Can be either `'chat'` or `'battle'`.
* `visibility`: The display permissions of the room. Public rooms have `'public'`, for example.
* `modchat`: The modchat level of the room.
* `auth`: An object that contains the roomauth of the room. The structure is `(rank symbol): userid[]`.
* `users`: An array that contains the display names, as well as ranks, of the users in the room.

Room has the following methods:
* `send (text: string): Promise<Message>` sends a message to the Room and returns a Promise that is resolved with the sent [Message](#room-structure), or is rejected with the message content.
* `waitFor (condition: (message: Message): boolean, time: number): Promise<Message>` waits for a message in the Room. This is resolved when the Client receives a message from the Room for which `condition` returns true, and is rejected if (time) milliseconds pass without being resolved. By default, time corresponds to 1 minute - you can set it to 0 to disable the time limit.



## Credits
Written by @PartMan7. Many thanks to @Ecuacion for the base connection logic, and many others (@Morfent, @NotBlizzard, and @LegoFigure11, to name a few) for earlier assistance.