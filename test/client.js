const debug = process.env.DEBUG;

const assert = require('assert');
const chalk = require('chalk');
const dotenv = require('dotenv');
require('mocha');

dotenv.config();

const { Client } = require('../client.js');

const username = process.env.PS_USERNAME ?? 'PS-Client';

const indent = num => ' '.repeat(num * 2);

const ifBotIt = username === 'PS-Client' ? it : it.skip;

const Bot = new Client({
	username,
	password: process.env.PASSWORD,
	rooms: ['botdevelopment'],
	debug,
	handle: err => {
		if (!debug) throw err;
		else console.error(err);
	}
});

if (debug) Bot.on('line', (room, line) => {
	if (line.startsWith('|queryresponse|')) return;
	if (line.startsWith('|c:|')) return;
	if (line.startsWith('|raw|')) return;
	if (line.startsWith('|formats|')) return;
	if (line.startsWith('|updateuser|')) return;
	console.log(room, line);
});
Bot.on('message', message => {
	if (message.isIntro) return;
	if (debug) console.log(message);
	else if (['partbot', 'psclient'].includes(message.author.id)) console.log(chalk.dim(`${indent(3)}${message.raw}`));
});

describe('PS-Client', () => {
	before(function () {
		this.timeout(30_000);
		return new Promise(resolve => {
			Bot.connect();
			Bot.on('ready', () => resolve());
		});
	});

	it('should be connected', () => {
		assert(Bot.status.connected);
	});

	it('should be in BotDev', () => {
		assert(Bot.getRoom('Bot Development'));
	});

	it('should be able to send chat messages', () => {
		return Bot.getRoom('Bot Development').send('Test');
	});

	it('should detect sent chat messages', () => {
		return new Promise((resolve, reject) => {
			Bot.getRoom('Bot Development').waitFor(msg => {
				return msg.author.userid === 'partbot' && msg.content === '1';
			}).then(resolve).catch(reject);
			Bot.getRoom('Bot Development').send(',eval 1');
		});
	});

	it('should be able to send PMs', () => {
		return Bot.getUser('PartBot').send('Test');
	});

	it('should detect sent PMs', () => {
		if (!Bot.getUser('PartBot')) return;
		return new Promise((resolve, reject) => {
			Bot.getUser('PartBot').waitFor(msg => msg.content.includes('PartMan')).then(resolve).catch(reject);
			Bot.getUser('PartBot').send(',help');
		});
	});

	// Test the following only if the user is PS-Client

	ifBotIt('should be able to send HTML', () => {
		return new Promise((resolve, reject) => {
			Bot.getRoom('Bot Development')
				.waitFor(msg => msg.author.id === 'psclient' && /Test/.test(msg.content))
				.then(resolve);
			Bot.getRoom('Bot Development').sendHTML('<div style="font-weight: bold">Test</div>');
		});
	});

	ifBotIt('should be able to send raw HTML', () => {
		return new Promise((resolve, reject) => {
			Bot.getRoom('Bot Development')
				.waitFor(msg => msg.author.id === 'psclient' && /Test/.test(msg.content))
				.then(resolve);
			Bot.getRoom('Bot Development').sendRawHTML('<div style="font-weight: bold">Test</div>');
		});
	});

	after(() => {
		console.log(chalk.dim(`${indent(2)}Disconnecting...`));
		Bot.disconnect();
	});
});
