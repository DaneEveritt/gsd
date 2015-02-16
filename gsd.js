var config = require('./config.json');
var log = require('./log.js');

log.info("+ ========================================== +");
log.info("| GSD logs all information, including errors |");
log.info("| into the logs/ directory. Please check     |");
log.info("| there before asking for help with bugs.    |");
log.info("|                                            |");
log.info("| \x1b[41mSubmit bug reports at the following link:\x1b[0m  |");
log.info("| https://github.com/PufferPanel/PufferPanel |");
log.info("+ ========================================== +");

require('./interfaces/console.js');
var rest = require('./interfaces/rest.js');
require('./interfaces/ftp.js');

var servers = require('./services');
var exec = require('child_process').exec;

process.argv.forEach(function(val, index, array) {

	if(val == 'debug')
	{
		log.d = true;
		log.info("Now running in debug mode!");
	}
	if(val == 'verbose')
	{
		log.v = true;
		log.info("Now running with verbose output!");
	}

});

process.on('SIGINT', function() {

	log.warn("Detected hard shutdown!");
	log.warn("Killing all running java processes on the server!");

	try {

		var server = servers.servers;
		server.forEach(function(s) {
			if(s.ps) {
				run = exec('kill '+ s.ps.pid, function(error, stdout, stderr) {
					log.info("Killing server with pid of "+ s.ps.pid + "out: "+ stdout);
				});
			}
		});

	} catch (ex) {
		log.error("Exception occured trying to stop all running servers.",ex.stack);
		log.warn("Please run 'killall java -9' before restarting GSD!");
	}

	log.info("All shutdown parameters complete. Stopping...\n");
	process.exit();

});
