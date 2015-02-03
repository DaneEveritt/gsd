var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':gsd:');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS servers (id INT PRIMARY KEY ASC NOT NULL,"
		 + "name TEXT NOT NULL,"
		 + "user TEXT NOR NULL," 
		 + "overide_command_line TEXT," 
		 + "path TEXT NOT NULL," 
		 + "intall_dir TEXT NOT NULL," 
		 + "disk_hard INT NOT NULL,"
		 + "disk_soft INT NOT NULL,"
		 + "cpu INT NOT NULL,"
		 + "variables TEXT NOT NULL,"
		 + "keys TEXT NOT NULL,"
		 + "gameport INT NOT NULL,"
		 + "gamehost TEXT NOT NULL,"
		 + "plugin TEXT NOT NULL,"
		 + "auto_on BOOL NOT NULL"
		 + ")");
});

var config = require('./config.json');

require('./interfaces/console.js');
var rest = require('./interfaces/rest.js');
require('./interfaces/ftp.js');

var servers = require('./services');
var exec = require('child_process').exec;
var log = require('./log.js');

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

	log.info("Detected hard shutdown!");
	log.info("Killing all running java processes on the server!");

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
