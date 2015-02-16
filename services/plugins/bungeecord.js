mcping = require('mcquery');
fs = require('fs');
pathlib = require('path');
glob = require('glob');
copyFolder = require('../create.js').copyFolder;
var log = require('../../log.js');
var yaml = require('js-yaml');
var async = require('async');
var trim = require("trim");
var Gamedig = require('gamedig');
var settings = {};

settings.name = "Bungeecord"
settings.stop_command = 'end'
settings.started_trigger = ')! For help, type "help" or "?"'
settings.eula_trigger = 'Go to eula.txt for more info.'
settings.defaultvariables = {"-Xmx":"256M", "-jar":"BungeeCord.jar","nogui":""}
settings.exe = "java",
settings.joined = ["-Xmx", "-XX:PermSize=", "-Djline.terminal="];
settings.log = "/logs/proxy.log"

settings.query = function query(self) {
	ip = self.gamehost;
	port = parseInt(self.gameport);
	Gamedig.query(
	{
		type: 'minecraft',
		host: ip,
		port: port
	},
	function(res) {
		if(res.error) {
			log.verbose(self.gamehost + ":" + self.gameport + " query error ", res.error);
			self.emit('crash');
		}
	});
};

settings.commands = {
	'player':{
	'kick':'kick {{player}}',
	'ban':'ban {{player}}',
	'kill':'kill {{player}}',
	'clearinventory':'clearinventory {{player}}'
	}
};

settings.preflight = function(server, user, group, path){
	jarPath = pathlib.join(path, server.config.variables['-jar']);
	settingsPath = pathlib.join(path, "config.yml");

	if (!fs.existsSync(jarPath)){
		throw new Error(server.config.variables['-jar'] + " does not seem to be in the server directory!");
	}

	if(fs.existsSync(settingsPath)){

		try{

			var rewrite = false;
			var obj = yaml.safeLoad(fs.readFileSync(settingsPath, 'utf8'));

			if(obj['enable-query'] != 'true') {
				obj['enable-query'] = 'true';
				rewrite = true;
			}

			if(obj['server-port'] != server.config.gameport) {
				obj['server-port'] = server.config.gameport;
				rewrite = true;
			}

			if(obj['query.port'] != server.config.gameport) {
				obj['query.port'] = server.config.gameport;
				rewrite = true;
			}

			if(obj['server-ip'] != server.config.gamehost) {
				obj['server-ip'] = server.config.gamehost;
				rewrite = true;
			}

			if(obj['enable-query'] != 'true') {
				obj['enable-query'] = 'true';
				rewrite = true;
			}

			if(rewrite && !fs.writeFileSync(settingsPath, yaml.safeDump(obj))) {
				log.error("An error occured trying to update the server.properties file.", error);
			}

		} catch(ex){

			log.error("An uncaught error occured trying to update config.yml for "+ server, ex);

		}

	} else {

		log.error("Cannot boot server without a valid config.yml file.");

	}
};

settings.install = function(server, callback){

	if(typeof server.config.build == 'undefined' || typeof server.config.build.install_dir == 'undefined'){

		installDir = '/mnt/MC/BungeeCord/';
		log.warn("No install directory defined. Using default " + installDir);

	} else {

		installDir = server.config.build.install_dir;

	}

	try {

		copyFolder(server, installDir, function(){ callback(); });


	} catch(ex) {

		log.error("An error occured trying to copy over the files for the following server: "+ server.config.name, ex);

	}

};

settings.getTail = function(server, lines) {

	try {
		l = fs.readFileSync(pathlib.join(server.path + settings.log)).toString().split('\n');
	} catch(ex) {
		return "No log was found to read from. ["+ settings.log +"]";
	}

	out = "";
	lines = parseInt(lines) + parseInt(1);
	lines = (lines < 0) ? 1 : lines;
	for(i = l.length-lines; i<l.length; i++){

		if(l[i] != null) {
			out += l[i]+"\n";
		}

	}

	return trim.right(out) + "\n";

}

settings.maplist = function maplist(self){
	maps = [];

	fs.readdirSync(self.config.path).forEach(function(directory){

		path = pathlib.join(self.config.path, directory);

		if (fs.lstatSync(path).isDirectory()){
	if (fs.existsSync(pathlib.join(path, "level.dat"))){
	  maps.push(directory)
	}
		}
	});

	return maps;
};

settings.configlist = function configlist(self){
	var configs = {};
	configs['core'] = [];

	glob("*.yml", {'cwd':self.config.path, 'sync':true}, function (er, files) {
	configs['core'] = configs['core'].concat(files);
	});

	return configs;
};

settings.addonlist = function addonlist(self){
	var addons = {};

	if (fs.existsSync(pathlib.join(self.config.path, "plugins"))){
	glob("plugins/*.jar", {'cwd':self.config.path, 'sync':true}, function (er, files) {
		addons['bukkit'] = files;
	});
	}

	return addons;
};

module.exports = settings;