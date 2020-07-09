function toID (text) {
	return String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function addUser (input, parent) {
	if (typeof input !== 'object' || !input.userid) throw new Error ('Input must be an object with userid for new User');
	let user = parent.users[input.userid];
	if (!user) {
		parent.users[input.userid] = new User (input, parent);
		user = parent.users[input.userid];
		parent.send(`|/cmd userdetails ${input.userid}`);
	}
	Object.keys(input).forEach(key => user[key] = input[key]);
	return user;
}

class User {
	constructor (init, parent) {
		Object.keys(init).forEach(key => this[key] = init[key]);
		this.parent = parent;
		this.waits = [];
		this.alts = [];
	}
	send (text) {
		let user = this;
		return new Promise(function (resolve, reject) {
			function sent (msg) {
				return resolve(msg);
			}
			function fail (err) {
				return reject(err);
			}
			text = '|/pm ' + user.userid + ',' + text;
			user.parent.sendQueue(text, sent, fail);
		});
	}
	waitFor (condition, time) {
		if (!time && typeof time !== 'number') time = 60 * 1000;
		if (typeof condition !== 'function') throw new Error ('Condition must be a function.');
		let user = this;
		return new Promise ((resolve, reject) => {
			let id = Date.now();
			if (time) setTimeout(() => {
				reject('Timed out.');
				user.waits = user.waits.filter(wait => wait.id !== id);
			}, time);
			user.waits.push({
				condition: condition,
				id: id,
				resolve: msg => {
					user.waits = user.waits.filter(wait => wait.id !== id);
					resolve(msg);
				}
			});
		});
	}
}

class Room {
	constructor (name, parent) {
		this.roomid = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
		this.parent = parent;
		this.waits = [];
	}
	send (text) {
		let room = this;
		return new Promise(function (resolve, reject) {
			function sent (msg) {
				return resolve(msg);
			}
			function fail (err) {
				return reject(err);
			}
			text = room.roomid + '|' + text;
			room.parent.sendQueue(text, sent, fail);
		});
	}
	waitFor (condition, time) {
		if (!time && typeof time !== 'number') time = 60 * 1000;
		if (typeof condition !== 'function') throw new Error ('Condition must be a function.');
		let room = this;
		return new Promise ((resolve, reject) => {
			let id = Date.now();
			if (time) setTimeout(() => {
				reject('Timed out.');
				room.waits = room.waits.filter(wait => wait.id !== id);
			}, time);
			room.waits.push({
				condition: condition,
				id: id,
				resolve: msg => {
					room.waits = room.waits.filter(wait => wait.id !== id);
					resolve(msg);
				}
			});
		});
	}
}

class Message {
	constructor (by, text, type, target, raw, isIntro, parent, time) {
		by = toID(by);
		if (!parent.users[by]) {
			addUser({userid: by}, parent);
			parent.send(`|/cmd userdetails ${by}`);
		}
		this.author = parent.users[by];
		this.content = text;
		let match = text.match(/^[\/\!][^ ]+/);
		if (match) this.command = match[0];
		else this.command = false;
		this.raw = raw;
		this.parent = parent;
		this.type = type;
		this.isIntro = Boolean(isIntro);
		if (time) this.time = time;
		else this.time = Date.now();
		let spl = text.split('|');
		switch (this.type) {
			case 'chat': this.target = this.parent.rooms[target]; break;
			case 'pm': this.target = this.parent.users[target]; break;
			default: console.error(this.type);
		}
	}
	reply (text) {
		switch (typeof text) {
			case 'string': break;
			case 'function': text = text.toString(); break;
			case 'object': text = JSON.stringify(text); break;
			default: String(text);
		}
		return this.target.send(text);
	}
}


module.exports = {
	User: User,
	Room: Room,
	Message: Message,
	addUser: addUser
}