# ps-client

<a href="https://www.npmjs.com/package/ps-client"><img src="https://img.shields.io/npm/v/ps-client.svg?maxAge=3600" alt="NPM version" /></a>
<a href="https://www.npmjs.com/package/ps-client"><img src="https://img.shields.io/npm/dt/ps-client.svg?maxAge=3600" alt="NPM downloads" /></a>

PS-Client is a module that handles connection to Pokémon Showdown servers. Apart from a _very_ minimalistic configuration requirement, it also boasts multiple utility features, like promise-based messages, synchronized room and user data, alt tracking, and a lot of other stuff - go through the documentation for a complete summary.

PS-Client is fully-typed with accompanying `*.d.ts` files, so you can freely integrate it with your TypeScript projects. For reference, you may look at [PartBot's second iteration](https://github.com/PartMan7/PartBotter).

## Table of Contents

- [Installation](#installation)
- [Example](#example-setup)
- [Configuration](#configuration)
- [Documentation](DOCUMENTATION.md)
- [Tools](#tools)
- [Datacenters](#datacenters)
- [What's New](CHANGELOG.md)
- [Credits](#credits)

## Example Setup

NodeJS

```javascript
const { Client } = require('ps-client');
const Bot = new Client({ username: 'PS-Client', password: 'password', debug: true, avatar: 'supernerd', rooms: ['botdevelopment'] });
Bot.connect();

Bot.on('message', message => {
	if (message.isIntro) return;
	if (message.content === 'Ping!') return message.reply('Pong!');
});
```

TypeScript

```typescript
import { Client, Message } from 'ps-client';

const Bot = new Client({ username: 'PS-Client', password: 'password', debug: true, avatar: 'supernerd', rooms: ['botdevelopment'] });
Bot.connect();

Bot.on('message', (message: Message) => {
	if (message.isIntro) return;
	if (message.content === 'Ping!') return message.reply('Pong!');
});
```

### Installation

To install `ps-client` using npm, open the terminal and type the following:

```
npm install ps-client
```

If you have it in your package.json, simply run `npm install`. If you have installed it and wish to update your version, run `npm update ps-client`.

PS-Client requires **Node.js v14.0.0 or higher**.

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
	username: string; // The username you wish to connect to. Required parameter.
	password?: string; // The password for the username you're connecting to. Leave this blank if the account is unregistered.
	server?: string; // The server to which you wish to connect to - defaults to 'sim3.psim.us'.
	port?: number; // The port on which you're connecting to. Can also be specified in server as `url:port`, in which case leave this field blank.
	serverProtocol?: string; // The protocol used for the websocket connection. Defaults to wss, but can be changed to ws (insecure).
	connectionTimeout?: number; // The time, in milliseconds, after which your connection times out. Defaults to 20s.
	loginServer?: string; // The login server. Defaults to 'https://play.pokemonshowdown.com/~~showdown/action.php'.
	avatar?: string | number; // The avatar your Bot will have on connection. If not specified, PS will set one randomly.
	status?: string; // The status your Bot will have on connection.
	retryLogin?: number; // The time, in milliseconds, that your Bot will wait before attempting to login again after a failing. If this is 0, it will not attempt to login again. Defaults to 10 seconds.
	autoReconnect?: number; // The time, in milliseconds, that your Bot will wait before attempting to reconnect after a disconnect. If this is 0, it will not attempt to reconnect. Defaults to 30 seconds.
	rooms: string[]; // An array with the strings of the rooms you want the Bot to join.
	debug?: boolean | ((details: string) => void); // The function you would like to run on debugs. If this is a falsey value, debug messages will not be displayed. If a true value is given which is not a function, the Bot simply logs messages to the console.
	handle?: boolean | ((error: string | Error) => void); // Handling for internal errors. If a function is provided, this will run it with an error / string. The default function logs them to the console. To opt out of error handling (not recommended), set this to false.
	noFailMessages?: boolean; // Dictates whether messages throw errors by default. Set to 'false' to enable messages throwing errors. Defaults to true.
	throttle?: number; // The throttle (in milliseconds) for every 'batch' of three messages. PS has a per-message throttle of 25ms for public roombots, 100ms for trusted users, and 600ms for regular users.
};
```

Note: There are four main reasons to ignore an incoming message:

1. `message.isIntro`: Messages in the history of the chat are usually not parsed as commands on logging in.
2. `!message.author.userid`: Messages from the `&Staff` and `&` accounts (formerly `~Staff` and `~`) in DMs usually can't be replied to.
3. `!message.target`: 'Ghost' messages (used as communication from the server to set up info) should be ignored.
4. `message.author.userid === message.parent.status.userid`: It is highly recommended to avoid parsing your own messages as commands, since that's an easy recipe for Botception.

## Tools

For common purposes and frequently useful methods, a variety of tools have been made available. Tools can be accessed from `require('ps-client').Tools`. It has the following functions:

- `HSL (name: string, original: boolean): { source: string, hsl: number[], original?: { source: string, hsl: number[] } }`: This function calculates the HSL values of the namecolours of the given username as calculated by PS! (S and L are in percentages). If the provided username has an associated custom colour, and `original` is not set to `true`, the function also generates an identical object keyed as original with the original colours, while hashing the custom one.
- `toID (name: string): string`: Converts a username into their userid.
- `update (...data?: string[]): string[]`: Updates the corresponding datacenters in the module. If no parameters are passed, updates all datacenters. Valid inputs are: `abilities`, `aliases`, `colors`, `formatsdata`, `formats`, `items`, `learnsets`, `moves`, `pokedex`, and `typechart`. Resolves with an array containing the names of all the updated centers, or rejects with any errors.
- `uploadToPastie (text: string, callback?: (url: string)): Promise<string>`: Uploads the given text to Pastie.io. Resolves with the raw link to the uploaded text. A callback may also be used.
- `uploadToPokepaste (sets: string, output?: (url: string) => {} | 'raw' | 'html'): Promise<string>`: Uploads a string containing sets to pokepast.es. Resolves with the URL to the uploaded paste. If `output` is a callback, the callback is instead run. `output` may also be set to `'html'` to resolve with the received HTML, or `'raw'` to resolve with the link to the raw paste.
- `escapeHTML (input: string): string`: Escapes special characters with their HTML sequences.
- `unescapeHTML (input: string): string`: Unescapes HTML sequences into their corresponding characters.
- `formatText (input: string): string`: Formats a string the way PS does for chat messages (this WILL escape HTML).

Note: This module uses [axios](https://github.com/axios/axios) for POST requests.<br/>
Note: The various methods that use HTML in the Message / Room / User classes all use the [juice](https://www.npmjs.com/package/juice) library for expanding `<style>` tags into inline CSS.

## Datacenters

Since this module is for Pokémon Showdown, it also contains references to data from Pokémon Showdown. All the data in this module is sourced from play.pokemonshowdown.com, and can be updated via Tools#update. This data is exported under `require('ps-client').Data`.

Data has the following entries:

- `abilities`: Contains the data for abilities.
- `aliases`: Contains the list of aliases.
- `colors`: Contains the custom colors for users on PS.
- `formats-data`: Contains tiers and Randoms moves.
- `formats`: Contains the clauses for various tiers.
- `items`: Contains the data for items.
- `learnsets`: Contains the data for Pokémon learnsets.
- `moves`: Contains the data for moves.
- `pokedex`: Contains the basic Pokédex info.
- `typechart`: Contains type matchup data.
  More information on how to use these can be found [here](https://github.com/smogon/pokemon-showdown/tree/master/data).

## What's New

The changelog can be found at [CHANGELOG.md](CHANGELOG.md).

## Credits

Written by PartMan7. Many thanks to Ecuacion for the base connection logic.

## Planned Task

Planned features, ongoing projects, and reported bugs may be found / reported at the [issues tracker](https://github.com/PartMan7/PS-Client/issues).
