#!/usr/bin/env node

var child = require("child_process");
var process = require("process");
var fs = require("fs");
var os = require("os");
var log = require("./log.js");

////////////////////////////////////////////////////////////////
//  UPDATE NPM - install all our dependencies automatically.  //
////////////////////////////////////////////////////////////////

process.chdir("/home/servman/servman");

function update_npm(force){
	var r;
	
	// list our dependencies.
	var deps = JSON.parse(fs.readFileSync("package.json", "utf8")).dependencies;
	var missing = false;
	
	Object.keys(deps).forEach(function(dep){
		if(!missing && !fs.existsSync("node_modules/"+dep)){
			missing = true;
		}
	});
	
	// nothing missing? unless we're forced to update, let's quit.
	if(!missing && !force){return;}
	
	log("INFO", "Updating dependencies: "+Object.keys(deps).join(", "));
	
	var npm = child.spawn(os.platform() == "win32" ? "npm.cmd" : "npm", ["install"]);

	npm.stdout.on("data", function(data){log("INFO", data.toString())});
	npm.stderr.on("data", function(data){log("ERROR", data.toString())});

	npm.on("exit", function(code){
		r = true;
		
		if(code != 0){
			log("ERROR", "Something funky probably happened during the update!"); 
		}else{
			log("INFO", "NPM has finished running.");
		}
	});
	
	while(r === undefined){deasync.runLoopOnce();}
	
	return code == 0; // 0 = success, anything else = oopsie
}

////////////////////////////////////////////////////////////////
// SERVER INFO - Grabs a JSON file and returns it's contents. //
////////////////////////////////////////////////////////////////

function server_info(server){
	var path = "/home/servman/"+server+"/servman.json";
	
	if(fs.existsSync(path)){
		return fs.readJsonSync(path);
	}else{
		return false;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

update_npm();

// redefine fs since we loaded the vanilla one earlier.
fs = require("fs-extra");	

// let's load our defined methods / servers in.

var methods = {};

fs.readdirSync("/home/servman/servman/methods").forEach(function(method){
	methods[method.replace(".js", "")] = require("./methods/"+method);
});

// okay, now we can handle commands.

var args = process.argv;
args.splice(0, 2); // remove command and path

// servman [command] [server] [arguments]

// show servers if nothing was typed.
if(!args[0]){
	log("INFO", "Here's a list of servers you can manage: ");
	
	var total = 0;
	
	fs.readdirSync("/home/servman/").forEach(function(server){
		if(fs.existsSync("/home/servman/"+server+"/servman.json")){
			console.log("    - "+server);
			total = total + 1;
		}
	});
	
	if(total == 0){
		console.log("There are no servers currently configured.");
	}
	
	log("INFO", "To see commands, you'll need to specify a server, as commands are defined on a per-server basis.");
	
	process.exit();
}

// grab the server methods.
var info = server_info(args[0]); 

if(!info){
	log("ERROR", "No server named \""+args[0]+"\" could be found. Check your spelling and try again.");
	process.exit();
}

// okay, load the "class" with our info.
server = methods[info.type];

if(!server){
	log("ERROR", "No methods are defined for handling a \""+info.type+"\" server. Contact your administrator for help.");
	process.exit();
}

// set tne info.
server.info = info;

// check for the command we're trying to use.
command = server[args[1]];

if(args[1] === undefined){
	log("INFO", "Here's a list of commands you can use with "+args[0]+": ");
	
	Object.keys(server).forEach(function(cmd){ 
		if(typeof server[cmd] != "function"){return;}
		if(cmd.indexOf("_") === 0){return;}
		
		console.log("    - "+cmd);
	});
	
	process.exit();
}

if(!command){
	log("ERROR", "Unknown command. Please check your syntax and try again.");
	process.exit();
}

// run it
command(args[0], args.slice(2));























