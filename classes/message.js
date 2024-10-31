'use strict';

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
const { toID } = require('../tools.js');

class Message {
	constructor(input) {
		let { by, text, type, target, raw, isIntro, parent, time } = input;
		const msgRank = by[0];
		by = toID(by);
		if (by && !parent.users.get(by)) {
			parent.addUser({ userid: by });
			parent.getUserDetails(by);
		}
		this.author = by ? parent.users.get(by) : null;
		this.content = text;
		const match = text.match(/^[/!][^ ]+/);
		if (match) this.command = match[0];
		else this.command = false;
		this.msgRank = msgRank;
		this.raw = raw;
		this.parent = parent;
		this.type = type;
		this.isIntro = Boolean(isIntro);
		this.awaited = false;
		this.time = time || Date.now();
		switch (this.type) {
			case 'chat':
				this.target = this.parent.rooms.get(target);
				break;
			case 'pm':
				this.target = by ? this.parent.users.get(target) : null;
				break;
			default:
				this.parent.handle(new Error(`Message: Expected type chat/pm; got ${this.type}`));
		}
	}
	reply(text) {
		return this.target.send(text);
	}
	privateReply(text) {
		if (this.target.type !== 'chat') this.reply(text);
		else {
			const privateSend = this.target.privateSend(this.author.userid, text);
			if (privateSend === false) this.author.send(text);
		}
	}
	sendHTML(html, opts) {
		return this.target.sendHTML(html, opts);
	}
	replyHTML(html, opts) {
		if (this.target.type === 'pm') return this.target.sendHTML(html, opts);
		if (this.target.type === 'chat') return this.target.privateHTML(this.author.userid, html, opts);
		return '';
	}
	[customInspectSymbol](depth, options, inspect) {
		if (depth < 1) return options.stylize(`${this.title} [PS-Message]`, 'special');
		const logObj = {};
		const keys = ['content', 'type', 'raw', 'time', 'author', 'target', 'command', 'parent', 'isIntro', 'awaited'];
		keys.forEach(key => (logObj[key] = this[key]));
		return `${options.stylize('PS-Message', 'special')} ${inspect(logObj, { ...options, depth: options.depth - 1 })}`;
	}
}

module.exports = Message;
