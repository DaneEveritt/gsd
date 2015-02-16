require('date-utils');
var d = new Date();
var fs = require('fs');
var winston = require('winston');

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.File)({
			filename: 'logs/' + d.toYMD('.') + '-' + d.toFormat('HH24.MI.SS') + '.log',
			level: 'info',
			json: false,
			timestamp: function() {
				return d.toFormat('HH24:MI:SS');
			}
		})
	]
	});
var l = {};

l.d = false;
l.v = false;

if (!fs.existsSync('logs/')) {
	fs.mkdirSync('logs/');
}

l.debug = function(l, data) {

	var self = this;
	logger.transports.file.level = 'debug';
	logger.debug(l, { meta: data });
	if(self.d) {

		console.log("[" + d.toFormat('HH24:MI:SS') + "][DEBUG] " + l);

	}

};

l.error = function(l, data) {

	logger.error(l, { meta: data });
	console.error("[" + d.toFormat('HH24:MI:SS') + "]\x1b[1m\x1b[37m\x1b[41m[ERROR]\x1b[0m " + l);

};

l.verbose = function(l, data) {

	var self = this;
	logger.transports.file.level = 'verbose';
	logger.verbose(l, { meta: data });
	if(self.v) {
		console.log("[" + d.toFormat('HH24:MI:SS') + "][VERBOSE] " + l);
	}

};

l.info = function(l, data) {

	logger.info(l, { meta: data });
	console.info("[" + d.toFormat('HH24:MI:SS') + "][INFO] " + l);

};

l.warn = function(l, data) {
	logger.warn(l, { meta: data });
	console.info("[" + d.toFormat('HH24:MI:SS') + "]\x1b[30m\x1b[43m[WARN]\x1b[0m " + l);
};
module.exports = l;
