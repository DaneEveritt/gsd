fs = require('fs');
pathlib = require('path');
glob = require('glob');
copyFolder = require('../create.js').copyFolder;
var log = require('../../log.js');
var properties = require ("properties");
var async = require('async');
var trim = require("trim");
var Gamedig = require('gamedig');
var settings = {};

settings.name = "Garry's Mod";
settings.stop_command = 'stop';
settings.started_trigger = 'Connection to Steam servers successful';
settings.defaultvariables = {"+map":"gm_construct", "-game":"garrysmod"};
settings.exe = "./srcds_wrap";
settings.defaultPort = 27015;
settings.joined = [];
settings.log = "";

settings.install = function(server, callback){
	server.updatevariables({"-port":server.gameport}, false);
	symlinkFolder(server, "/mnt/gmod/", ["garrysmod/cfg/*.cfg","garrysmod/cfg/mapcycle*", "garrysmod/maps/*.nav", "garrysmod/cfg/motd*"], function(err){if(err != null){return err;}});
};

settings.query = function query(self) {
	Gamedig.query(
		{
			type: 'Garry\'s Mod',
			host: self.gamehost,
			port: self.gameport
		},
		function(res) {
			if(res.error) {
				self.emit('crash');
			} else {
				self.hostname = res['name'];
				self.numplayers = res['players'].length;
				self.maxplayers = res['maxplayers'];
				self.map        = res['map'];
				self.players    = res['players'];
				self.lastquerytime = new Date().getTime();
			}
		}
	);
};

settings.preflight = function(server, user, group, path){

};

settings.commands = {

};

settings.getTail = function(server, lines) {

}

settings.maplist = function maplist(self){
	maps = [];
	mapspath = pathlib.join(self.config.path, "garrysmod/maps/*.bsp");

	if (fs.existsSync(mapspath)){
		glob("*.bsp", {'cwd':mapspath, 'sync':true}, function (er, files) {
	maps = files
		});
	}

	return maps;
};

settings.configlist = function configlist(self){
	var configs = {};
	configs['core'] = [];

	glob("garrysmod/cfg/*.cfg", {
		'cwd':self.config.path,
		'sync':true
	}, function (er, files) {
		configs['core'] = configs['core'].concat(files);
	});


	return configs;
};

settings.addonlist = function addonlist(self){
	var addons = {};

	return addons;
};

module.exports = settings;