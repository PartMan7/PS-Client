exports.toID = function (text) {
	return String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
}