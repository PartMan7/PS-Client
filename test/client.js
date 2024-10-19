const debug = process.env.DEBUG;

const assert = require('assert');
const dotenv = require('dotenv');
require('mocha');

dotenv.config();

const { Client } = require('../client.js');

const Bot = new Client({
	username: process.env.PS_USERNAME ?? 'PS-Client',
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
	else if (['partbot', 'psclient'].includes(message.author.id)) console.log(`    ${message.raw}`);
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

	after(() => {
		Bot.disconnect();
	});
});
