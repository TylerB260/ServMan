////////////////////////////////////////
//    Garry's Mod Dedicated Server    //
////////////////////////////////////////

var fs = require("fs-extra");
var exec = require("child_process").exec;
var log = require("../log.js");

module.exports = {
	info: {
		id:   "gmod", // the folder name of the server
		
		name: "Garry's Mod",
		desc: "A dedicated Garry's Mod server.",
		type: "gmod", // the name of this file.
		
		opts: {
			
		}
	},
	
	isrunning: function(server){
		
	},
	
	start: function(server){
		
	},
	
	stop: function(server){
		
	},
	
	install: function(server){
		
	},
	
	update: function(server){
		
	}
}

self = module.exports;