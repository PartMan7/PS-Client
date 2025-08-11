const querystring = require('querystring');

module.exports = async (url, params) => {
	if (url === 'https://play.pokemonshowdown.com/action.php') {
		expect(querystring.parse(params.body)).toEqual({
			act: 'login',
			name: 'psclient',
			pass: 'PASSWORD',
			challengekeyid: 'challstr_key', // This is actually supposed to be a number
			challstr: 'challstr_value',
		});
		return /** @type Response */ ({ text: async () => ']{"assertion":"challstr_value_then_other_stuff","username":"psclient"}' });
	}
};
