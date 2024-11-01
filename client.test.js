const { Client } = require('./client.js');
const chalk = require('chalk');

const Bot = new Client({
	username: 'PS-Client',
	password: 'PASSWORD',
	rooms: ['botdevelopment'],
});

jest.mock('ws', () => require('./mocks/ws.js'));
jest.spyOn(global, 'fetch').mockImplementation((...args) => require('./mocks/fetch.js')(...args));

describe('PS-Client', () => {
	beforeAll(() => {
		return new Promise(resolve => {
			Bot.connect();
			Bot.on('activate', () => resolve());
		});
	});

	it('should have the right info', () => {
		expect(Bot.status.connected).toBe(true);
		expect(Bot.isTrusted).toBe(true);
	});

	it('should be in BotDev', () => {
		expect(Bot.getRoom('Bot Development')).toBeDefined();
	});

	it('should be able to send chat messages', () => {
		return Bot.getRoom('Bot Development').send('Test');
	});

	it('should detect sent chat messages', () => {
		return new Promise((resolve, reject) => {
			Bot.getRoom('Bot Development')
				.waitFor(msg => {
					return msg.author.userid === 'otheruser' && msg.content === '/me pokes PS-Client';
				})
				.then(resolve)
				.catch(reject);
			Bot.getRoom('Bot Development').send('/me pokes Other User');
		});
	});

	it('should be able to send PMs', () => {
		return Bot.getUser('Other User').send('Test');
	});

	it('should detect sent PMs', () => {
		return new Promise((resolve, reject) => {
			Bot.getUser('Other User')
				.waitFor(msg => msg.content === 'Hi!')
				.then(resolve)
				.catch(reject);
			Bot.getUser('Other User').send('Hello!');
		});
	});

	it.skip('should be able to send HTML', () => {
		return new Promise((resolve, reject) => {
			Bot.getRoom('Bot Development')
				.waitFor(msg => msg.author.id === 'psclient' && /Test/.test(msg.content))
				.then(resolve)
				.catch(reject);
			Bot.getRoom('Bot Development').sendHTML('<div style="font-weight: bold">Test</div>');
		});
	});

	it.skip('should be able to send raw HTML', () => {
		return new Promise((resolve, reject) => {
			Bot.getRoom('Bot Development')
				.waitFor(msg => msg.author.id === 'psclient' && /Test/.test(msg.content))
				.then(resolve)
				.catch(reject);
			Bot.getRoom('Bot Development').sendRawHTML('<div style="font-weight: bold">Test</div>');
		});
	});

	afterAll(() => {
		require('console').log(chalk.red('xx'), chalk.dim('Disconnecting...'), '\n');
		Bot.disconnect();
	});
});
