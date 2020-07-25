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

module.exports = User;