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

module.exports = Room;