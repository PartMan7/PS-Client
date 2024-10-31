const baseConsole = require('console');
const chalk = require('chalk');
const EventEmitter = require('events');

function debugLogger(data, dir) {
	const msg = data
		.split('\n')
		.map((message, indent) => `${indent ? '   ' : ''}${message.length > 80 ? `${message.slice(0, 77)}...` : message}`)
		.join('\n');
	baseConsole.log(dir === 'out' ? chalk.green('>>') : chalk.yellow('<<'), chalk.dim(msg));
}

const debug = !!process.env.DEBUG;

const refStamp = Math.round(Date.now() / 1000);
let timeSinceJoin = 10;

const roomInitData = [
	`>botdevelopment
			|init|chat
			|title|Bot Development
			|users|2,#Other User,*PS-Client
			|:|${refStamp}
			|c:|${refStamp - 120}|#Other User|This message was sent two minutes before PS-Client joined`,

	`>botdevelopment
			|raw|<div class="infobox"> You joined Bot Development</div>
			|raw|<div class="infobox infobox-roomintro"><div class="infobox-limited">Roomintro</div></div>`,
].map(text => text.trim().replaceAll(/\t+/g, ''));

class Connection extends EventEmitter {
	constructor(props) {
		super(props);
	}
	receive(message) {
		const msgArray = Array.isArray(message) ? message : [message];
		msgArray.forEach(msg => debugLogger(msg, 'in'));
		this.emit('message', { type: 'utf8', utf8Data: `a${JSON.stringify(msgArray)}` });
	}
	send(messages) {
		JSON.parse(messages).forEach(message => {
			debugLogger(message, 'out');
			// Login /trn
			if (message.startsWith('|/trn ')) {
				expect(message).toBe('|/trn PS-Client,0,challstr_value_then_other_stuff');
				this.receive([
					'|queryresponse|rooms|{"chat":[{"title":"Bot Development","desc":"Beep boop","userCount":69}],"userCount":420,"battleCount":69}',
					'|updatesearch|{"searching":[],"games":null}',
					'|updateuser| PS-Client|1|caitlin-masters|{}',
					'|updatesearch|{"searching":[],"games":null}',
				]);
			}
			// /ip
			if (message === '|/ip') {
				// TODO
			}
			// /cmd details
			if (message.startsWith('|/cmd ')) {
				const [cmd, infotype, target] = message.split(' ');
				if (infotype === 'userdetails') {
					const otherUser = target === 'otheruser';
					const name = otherUser ? 'Other User' : 'PS-Client';
					const info = {
						id: name,
						userid: target,
						name,
						avatar: 'caitlin-masters',
						group: otherUser ? '+' : ' ',
						autoconfirmed: true,
						rooms: otherUser
							? {
									'#botdevelopment': { isPrivate: true },
									'+techcode': {},
								}
							: {
									'*botdevelopment': { isPrivate: true },
								},
					};
					this.receive(`|queryresponse|userdetails|${JSON.stringify(info)}`);
				} else if (infotype === 'roominfo') {
					const info = {
						id: 'botdevelopment',
						roomid: 'botdevelopment',
						title: 'Bot Development',
						type: 'chat',
						visibility: 'secret',
						modchat: null,
						auth: {
							'+': ['morfent'],
							'*': ['psclient'],
							'#': ['otheruser'],
						},
						users: ['#Other User', '*PS-Client'],
					};
					this.receive(`|queryresponse|roominfo|${JSON.stringify(info)}`);
				}
			}
			// /j BotDev
			if (message.startsWith('|/join botdevelopment')) {
				this.receive(roomInitData);
			}
			// Chat mocks
			if (message.startsWith('botdevelopment|')) {
				const content = message.replace('botdevelopment|', '');
				this.receive(`>botdevelopment\n|c:|${refStamp + timeSinceJoin}|*PS-Client|${content}`);
				timeSinceJoin++;
				if (content === '/me pokes Other User') {
					this.receive(`>botdevelopment\n|c:|${refStamp + timeSinceJoin}|#Other User|/me pokes PS-Client`);
					timeSinceJoin += 2;
				}
			}
			// PM mocks
			if (message.startsWith('|/pm otheruser,')) {
				const content = message.replace('|/pm otheruser,', '');
				this.receive(`|pm| PS-Client|+Other User|${content}`);
				if (content === 'Hello!') {
					this.receive('|pm|+Other User| PS-Client|Hi!');
				}
			}
		});
	}
	close() {}
}
class MockSocket extends EventEmitter {
	constructor(props) {
		super(props);
	}
	async connect() {
		const connection = new Connection();
		this.emit('connect', connection);
		connection.receive([
			'|updateuser| Guest 42069|0|169|{"context":"not used"}',
			'|formats|,1|Formats stuff; can ignore',
			'|challstr|challstr_key|challstr_value',
		]);
	}
}

exports.client = MockSocket;
