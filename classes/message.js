"use strict";

const { toID } = require('../tools.js');

class Message {
	constructor (input) {
		let { by, text, type, target, raw, isIntro, parent, time } = input;
		by = toID(by);
		if (!parent.users[by]) {
			parent.addUser({ userid: by });
			parent.getUserDetails(by);
		}
		this.author = parent.users[by];
		this.content = text;
		let match = text.match(/^[/!][^ ]+/);
		if (match) this.command = match[0];
		else this.command = false;
		this.raw = raw;
		this.parent = parent;
		this.type = type;
		this.isIntro = Boolean(isIntro);
		this.awaited = false;
		if (time) this.time = time * 1000;
		else this.time = Date.now();
		switch (this.type) {
			case 'chat':
				this.target = this.parent.rooms[target];
				break;
			case 'pm':
				this.target = this.parent.users[target];
				break;
			default: console.error(this.type);
		}
	}
	reply (text) {
		switch (typeof text) {
			case 'string': break;
			case 'function':
				text = text.toString();
				break;
			case 'object':
				text = JSON.stringify(text);
				break;
			default: String(text);
		}
		return this.target.send(text);
	}
	privateReply (text) {
		if (!text || this.target.type !== 'chat') this.reply(text);
		else this.target.privateSend(this.author.userid, text);
		return true;
	}
	sendHTML (html, opts) {
		return this.target.sendHTML(html, opts);
	}
	replyHTML (html, opts) {
		if (this.target.type === 'pm') return this.target.sendHTML(html, opts);
		if (this.target.type === 'chat') return this.target.privateHTML(this.author.userid, html, opts);
		return false;
	}
}

module.exports = Message;