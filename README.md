# ps-client
<a href="https://www.npmjs.com/package/ps-client"><img src="https://img.shields.io/npm/v/ps-client.svg?maxAge=3600" alt="NPM version" /></a>
<a href="https://www.npmjs.com/package/ps-client"><img src="https://img.shields.io/npm/dt/ps-client.svg?maxAge=3600" alt="NPM downloads" /></a>

PS-Client is a module that handles connection to Pokémon Showdown servers. Apart from a _very_ minimalistic configuration requirement, it also boasts multiple utility features, like promise-based messages, synchronized room and user data, alt tracking, and a lot of other stuff - go through the documentation for a complete summary.

PS-Client is fully-typed with accompanying `*.d.ts` files, so you can freely integrate it with your TypeScript projects. For reference, you may look at [PartBot's second iteration](https://github.com/PartMan7/PartBotter).

## Table of Contents

- [What's New](#whats-new)
- [Installation](#installation)
- [Example](#example-setup)
- [Configuration](#configuration)
- [Documentation](#documentation)
	- [Client](#client-structure)
	- [Message](#message-structure)
	- [User](#user-structure)
	- [Room](#room-structure)
- [Tools](#tools)
- [Datacenters](#datacenters)
- [Credits](#credits)


## Example Setup

```javascript
const { Client } = require('ps-client');
const Bot = new Client({ username: 'PS-Client', password: 'password', debug: true, avatar: 'supernerd', rooms: ['botdevelopment'] });
Bot.connect();

Bot.on('message', message => {
	if (message.isIntro) return;
	if (message.content === 'Ping!') return message.reply('Pong!');
});
```
```typescript
import type { Client, Message, User, Room } from 'ps-client';
import { Client } from 'ps-client';

const Bot = new Client({ username: 'PS-Client', password: 'password', debug: true, avatar: 'supernerd', rooms: ['botdevelopment'] });
Bot.connect();

Bot.on('message', (message: Message) => {
	if (message.isIntro) return;
	if (message.content === 'Ping!') return message.reply('Pong!');
});
```

## Configuration

Creating a Bot is fairly simple - all you have to do is create a new instance of the Client and pass the configuration options.

```javascript
const { Client } = require('ps-client');
const Bot = new Client({ username: name, password: password });

Bot.connect();
```

There are multiple configuration options that can be specified - here's a complete list.

```typescript
type options = {
	username: string, // The username you wish to connect to. Required parameter.
	password?: string, // The password for the username you're connecting to. Leave this blank if the account is unregistered.
	server?: string, // The server to which you wish to connect to - defaults to 'sim3.psim.us'.
	port?: number, // The port on which you're connecting to. Defaults to 80.
	connectionTimeout?: number, // The time, in milliseconds, after which your connection times out. Defaults to 20s.
	loginServer?: string, // The login server. Defaults to 'https://play.pokemonshowdown.com/~~showdown/action.php'.
	avatar?: string | number, // The avatar your Bot will have on connection. If not specified, PS will set one randomly.
	status?: string, // The status your Bot will have on connection.
	retryLogin?: number, // The time, in milliseconds, that your Bot will wait before attempting to login again after a failing. If this is 0, it will not attempt to login again. Defaults to 10 seconds.
	autoReconnect?: number, // The time, in milliseconds, that your Bot will wait before attempting to reconnect after a disconnect. If this is 0, it will not attempt to reconnect. Defaults to 30 seconds.
	rooms: string[], // An array with the strings of the rooms you want the Bot to join.
	debug?: boolean | (details: string): any; // The function you would like to run on debugs. If this is a falsey value, debug messages will not be displayed. If a true value is given which is not a function, the Bot simply logs messages to the console.
	handle?: boolean | (error: string | Error): any; // Handling for internal errors. If a function is provided, this will run it with an error / string. The default function logs them to the console. To opt out of error handling (not recommended), set this to false.
	noFailMessages?: boolean; // Dictates whether messages throw errors by default. Set to 'false' to enable messages throwing errors. Defaults to true.
	throttle?: number; // The throttle (in milliseconds) for every 'batch' of three messages. PS has a per-message throttle of 25ms for public roombots, 100ms for trusted users, and 600ms for regular users.
}
```

Note: There are four main reasons to ignore an incoming message:
1) `message.isIntro`: Messages in the history of the chat are usually not parsed as commands on logging in.
2) `!message.author.userid`: Messages from the `&Staff` and `&` accounts (formerly `~Staff` and `~`) in DMs usually can't be replied to.
3) `!message.target`: 'Ghost' messages (used as communication from the server to set up info) should be ignored.
4) `message.author.userid === message.parent.status.userid`: It is highly recommended to avoid parsing your own messages as commands, since that's an easy recipe for Botception.

## Documentation

### Client Structure
Client is an instance of an EventEmitter, and is the primary class. You can generate multiple Clients in the same script and execute them in parallel.

Client has the following properties:
* `opts`: An object containing most of the configuration options. Note that Client.opts.password is a function that returns the password instead of a string.
* `isTrusted`: A boolean that indicates whether the Bot is running on a trusted account. Until this is received, this value is null.
* `rooms`: A Map containing all the rooms the Bot is in. The keys are the room IDs, while the values are [Room](#room-structure) instances.
* `users`: A Map containing all the users the Bot is aware of. The keys are the user IDs, while the values are [User](#user-structure) instances.
* `status`: An object containing four keys regarding the status of the connection. These are: ``connected``, which is a Boolean that indicates whether the Bot is currently connected, ``loggedIn``: a boolean that indicates whether the Bot has logged in successfully, ``username``, which is the username the Bot has connected under, and ``userid``, the corresponding user ID.
* `closed`: A boolean that indicates whether the connection is currently closed.
* `debug`, `handle`: These are where the debug and handler functions are stored.

Client also has the following methods:
* `connect (reconnect: boolean): void` - Creates the websocket to connect to the server, then logs in. ``reconnect`` has no significance besides logging the attempt as a reconnection attempt.
* `disconnect: void` - Closes the connection.
* `login (username: string, password: string | undefined): void` - Logs in with the given credentials. Requires the websocket to have been created.
* `getUser (username: string | User): User | false | null` - Finds a user among tracked users. Returns the user instance (in case the user has been tracked while renaming, the new User instance). Returns `null` for an invalid input and `false` if the user is not tracked.
* `sendUser (username: string | User, text: string): Promise<Message>` - Sends the provided string to the specified user.
* `send (text: string): void` - Sends the provided string to the server. This bypasses the queue, and can cause the Bot to exceed the throttle. **Using Room#send or User#send instead is highly recommended.**

Client has the following events:

* `message (message: Message)` - Emitted whenever a message is received (includes both chat and PMs).
* `join (room: string, user: string, isIntro: boolean)` - Emitted whenever a user joins a room.
* `leave (room: string, user: string, isIntro: boolean)` - Emitted whenever a user leaves a room.
* `name (room: string, newName: string, oldName: string, isIntro: boolean)` - Emitted whenever a user renames from `oldName` to `newName`.
* `joinRoom (room: string)` - Emitted whenever the Client joins a room.
* `leaveRoom (room: string)` - Emitted whenever the Client leaves a room.
* `chaterror (room: string, error: string, isIntro: boolean)` - Emitted whenever an error appears in chat, regardless of the source.

(`isIntro` indicates whether the event occurred prior to the connection.)

Apart from these, Client emits all events from [this](https://github.com/smogon/pokemon-showdown/blob/master/PROTOCOL.md) not specified here with the following syntax:
 ``(event) (room: string, line: string, isIntro: boolean)``


### Message Structure
Message represents each message object, regardless of whether it is in PM or chat. It also includes messages sent by the client.
As of now, messages that are redirected to a different username are not resolving / rejecting properly, and will be addressed.

Message has the following properties:
* `author`: The User object of the author of the message.
* `content`: The string of the message content.
* `command`: Represents the command that the message has (!dt, for example). If this is not a command, this is `false`.
* `msgRank`: The rank of the author as shown in the message.
* `parent`: The Client that received the message.
* `type`: The type of the message being received. Can be either `'pm'` or `'chat'`.
* `isIntro`: A boolean that indicates whether the message was received as a past message on connection.
* `time`: The Unix datestamp that indicates when the message was created. This is normally received from PS! wherever possible, but uses `Date.now()` if the data is unavailable.
* `target`: This can be either a [Room](#room-structure) or a [User](#user-structure), depending on whether the type is `'chat'` or `'pm'`. If the type is `'chat'`, this is the Room in which the message was sent. If the type is `'pm'`, this is the User with which the PM is with - note that this is not always the target of the PM, such as in cases where the Bot receives a PM from another user.
* `raw`: The original received message (ie, a message of the form `|c|+PartMan|Hi!` would have that as the raw and `Hi!` as the content).
* `awaited`: A Boolean value indicating whether the message was used to resolve a Room#waitFor or User#waitFor promise.

Message has the following methods:
* `reply (text: string): Promise<Message>` sends a message to the target and returns a Promise that is resolved with the sent Message, or is rejected with the message content. This is a shortcut for `Message#target#send`.
* `privateReply (text: string): true` sends a private response (private HTML message in the room if possible, otherwise a direct message).
* `sendHTML (html: string, opts?: { name?: string, rank?: string, change?: boolean }): boolean` is an alias for [Room#sendHTML](#room-structure) and [User#sendHTML](#user-structure).
* `replyHTML (html: string, opts?: { name?: string, rank?: string, change?: boolean }): boolean` is an alias for [Room#privateHTML](#room-structure) and [User#sendHTML](#user-structure).

Note: A message can have `author` and `target` nullish if sent by the `&` account. Handle those accordingly!


### Room Structure
Room is the class that represents a chatroom on the server. By default, the Client only spawns Room instances for rooms that the Bot is in.

Room has the following properties:
* `parent`: This is the Client that holds the Room object.
* `roomid`: The ID of the room.
* `id`: Also the ID of the room, because why not?
* `title`: The display title of the room. This does not always correspond to the room ID.
* `type`: The type of the room. Can be either `'chat'` or `'battle'`.
* `visibility`: The display permissions of the room. Public rooms have `'public'`, for example.
* `modchat`: The modchat level of the room.
* `auth`: An object that contains the roomauth of the room. The structure is `(rank symbol): userid[]`.
* `users`: An array that contains the display names, as well as ranks, of the users in the room.

Room has the following methods:
* `send (text: string): Promise<Message>` sends a message to the Room and returns a Promise that is resolved with the sent [Message](#message-structure), or is rejected with the message content.
* `privateSend (user: string | User, text: string): boolean` sends a message in chat that is only visible to the specified user. Returns ``false`` if the client does not have permissions.
* `sendHTML (html: string, opts?: { name?: string, rank?: string, change?: boolean }): boolean` sends a UHTML box to the room with the specified (optional) options (reusing a name will overwrite the previous box, rank will only show the HTML to the specified ranks and higher, and `change` toggles the overwriting behaviour between changing at the old location and changing at the bottom of chat). For example: `Room.sendHTML('<b>This is an example.</b>', { rank: '+', change: true })`
* `privateHTML (user: string | User, html: string, opts?: { name?: string, rank?: string, change?: boolean }): boolean` behaves similarly to sendHTML, the difference being that privateHTML only sends the HTML to the specified user.
* `waitFor (condition: (message: Message): boolean, time: number): Promise<Message>` waits for a message in the Room. This is resolved when the Client receives a message from the Room for which `condition` returns true, and is rejected if (time) milliseconds pass without being resolved. By default, time corresponds to 1 minute - you can set it to 0 to disable the time limit.


### User Structure
User is the class that represents a user on the server. By default, the Client only spawns User instances for users that: 
1. Are in one or more of the rooms the Bot is in.
2. Have been sent a message by the Bot (the User is spawned immediately before sending the message).
3. Have sent a PM to the Bot.

User has the following properties:
* `parent`: This is the Client that holds the User object.
* `alts`: This is an array of the userids of known alts of the user.
* `userid`: The ID of the user.
* `id`: (Probably don't use this.)
* `avatar`: The string / number referring to the avatar of the user. This is _not_ the complete avatar URL.
* `name`: The string that shows the displayed name of the user, including capital letters and other characters.
* `group`: The global rank of the user. Is ` ` for regular users.
* `autoconfirmed`: Indicates whether the user is autoconfirmed.
* `status`: The string of the status set by the user. If no status is set, this is ``""``.
* `rooms`: An object containing the rooms of the user, structured as `(rank + roomid): {}` or `(rank + roomid): { isPrivate: true }`.

User has the following methods:
* `send (text: string): Promise<Message>` sends a message to the User and returns a Promise that is resolved with the sent [Message](#message-structure), or is rejected with the message content.
* `sendHTML (html: string, opts?: { name?: string, change?: boolean }): boolean` sends a UHTML box to the user with the specified (optional) options (reusing a name will overwrite the previous box and `change` toggles the overwriting behaviour between changing at the old location and changing at the bottom of the PM). For example: `User.sendHTML('<b>This is an example.</b>', { change: true })`
* `pageHTML (html: string, name?: string): boolean` sends a UHTML box to the user with the specified (optional) name (reusing a name will overwrite the previous page). For example: `User.pageHTML("<b>Let's play chess!</b>", "chess")`
* `waitFor (condition: (message: Message): boolean, time: number): Promise<Message>` waits for a message from the User. This is resolved when the Client receives a message from the User for which `condition` returns true, and is rejected if (time) milliseconds pass without being resolved. By default, time corresponds to 1 minute - you can set it to 0 to disable the time limit.


## Tools
For common purposes and frequently useful methods, a variety of tools have been made available. Tools can be accessed from `require('ps-client').Tools`. It has the following functions: 
* `HSL (name: string, original: boolean): { source: string, hsl: number[], original?: { source: string, hsl: number[] } }`: This function calculates the HSL values of the namecolours of the given username as calculated by PS! (S and L are in percentages). If the provided username has an associated custom colour, and `original` is not set to `true`, the function also generates an identical object keyed as original with the original colours, while hashing the custom one.
* `toID (name: string): string`: Converts a username into their userid.
* `update (data?: string[]): string[]`: Updates the corresponding datacenters in the module. If no parameters are passed, updates all datacenters. Valid inputs are: abilities, aliases, colors, formatsdata, formats, items, learnsets, moves, pokedex, and typechart. Resolves with an array containing the names of all the updated centers, or rejects with any errors.
* `uploadToPastie (text: string, callback?: (url: string)): Promise<string>`: Uploads the given text to Pastie.io. Resolves with the raw link to the uploaded text. A callback may also be used.
* `uploadToPokepaste (sets: string, output?: (url: string) => {} | 'raw' | 'html'): Promise<string>`: Uploads a string containing sets to pokepast.es. Resolves with the URL to the uploaded paste. If `output` is a callback, the callback is instead run. `output` may also be set to `'html'` to resolve with the received HTML, or `'raw'` to resolve with the link to the raw paste.
* `escapeHTML (input: string): string`: Escapes special characters with their HTML sequences.
* `unescapeHTML (input: string): string`: Unescapes HTML sequences into their corresponding characters.

Note: This module uses [axios](https://github.com/axios/axios) for POST requests.<br/>
Note: The various methods that use HTML in the Message / Room / User classes all use the [inline-css](https://www.npmjs.com/package/inline-css) library for expanding `<style>` tags into inline CSS.



## Datacenters
Since this module is for Pokémon Showdown, it also contains references to data from Pokémon Showdown. All of the data in this module is sourced from play.pokemonshowdown.com, and can be updated via Tools#update. This data is exported under `require('ps-client').Data`.

Data has the following entries:
* `abilities`: Contains the data for abilities.
* `aliases`: Contains the list of aliases.
* `colors`: Contains the custom colors for users on PS.
* `formats-data`: Contains tiers and Randoms moves.
* `formats`: Contains the clauses for various tiers.
* `items`: Contains the data for items.
* `learnsets`: Contains the data for Pokémon learnsets.
* `moves`: Contains the data for moves.
* `pokedex`: Contains the basic Pokedex info.
* `typechart`: Contains type matchup data.
More information on how to use these can be found [here](https://github.com/smogon/pokemon-showdown/tree/master/data).



### What's New

**v3.2.1**
* Made `Client#on('name')` also emit an isIntro event.

**v3.2.0**
* Added a `noFailMessages` option in config to prevent messages throwing errors; defaults to true.

**v3.1.1**
* Fixed minor lint errors.
* Added Husky to make sure this doesn't happen again.

**v3.1.0**
* Made `Message#privateReply` send a DM to the author if the client does not have permissions to send private HTML in the room.

**v3.0.0**
* Type definitions for all custom events added.
* The 'chaterror' event was renamed to 'chatError' to be in line with other event names.

**v2.1.1**
* Fixed the d.ts files to actually work.
* Moved the changelog to be lower in the README.

**v2.1.0**
* Added in a `Message#msgRank` field for much easier rank parsing.

**v2.0.0**
* I suck and forgot to document this; `rooms` has been used in place of `autoJoin` in the config now for automatically joining rooms.

**v1.7.1**
* Fixed the crash when a user used `/hidelines` or a similar `&`-sent message.
* Accidentally skipped 1.7.0.

**v1.6.1**
* Cleaned up unit tests and removed unnecessary PartProfessor mentions.

**v1.6.0**
* PS-Client now uses both customcolor sources (the same way the actual client does) to read namecolors.
* Added unit tests.

**v1.5.0**
* Add `*.d.ts` files for method documentation.
* Update descriptions in the README.
* `Client#users` and `Client#rooms` are now Maps instead of objects.
* Updated the util.inspect entries for Client/Room/User/Message.
* Massive code cleanup.

**v1.4.1**
* User#sendHTML and User#pageHTML now work correctly.

**v1.4.0**
* Multi-line messages now resolve at the time of the final line being successfully sent, instead of never resolving.
* Some datacenters now use JSON.

**v1.3.0**
* Added various HTML methods to the Message, Room, and User classes.
* Messages that successfully resolve a waitFor promise now have the `awaited` flag set.
* Various properties of the Client, Room, and User classes have now been privatized.
* Additions to Tools, including escapeHTML, unescapeHTML, and parseMessage.


### Installation
To install `ps-client` using npm, open the terminal and type the following:
```
sudo npm install ps-client
```

If you have it in your package.json, simply run ``npm install``. If you have installed it and wish to update your version, run ``sudo npm update ps-client``.

PS-Client requires **Node.js v14.0.0 or higher**.



## Credits
Written by PartMan7. Many thanks to Ecuacion for the base connection logic.

### To-Do

* Resolve PMs correctly when redirected to another user due to a rename.
* Create an example repository.
* Switch datacenters to JSON.
