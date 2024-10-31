module.exports = {
	async post(url, data, config) {
		if (url === 'https://play.pokemonshowdown.com/action.php') {
			// Login server
			expect(config.params).toEqual({
				act: 'login',
				name: 'psclient',
				pass: 'PASSWORD',
				challengekeyid: 'challstr_key', // This is actually supposed to be a number
				challstr: 'challstr_value',
			});
			return {
				data: ']{"assertion":"challstr_value_then_other_stuff","username":"psclient"}',
			};
		}
	},
};
