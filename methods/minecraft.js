///////////////////////////////////////////////////////
//    Minecraft / Feed the Beast Dedicated Server    //
///////////////////////////////////////////////////////

var fs = require("fs-extra");
var exec = require("child_process").exec;
var deasync = require("deasync");
var log = require("../log.js");
var term = require("terminal-kit").terminal;
var readline = require("readline");
var colors = require("colors");

module.exports = {
	info: {
		id: "minecraft", // should match folder name.
		
		name: "Minecraft / Feed the Beast",
		desc: "A dedicated Minecraft or Feed the Beast server.",
		type: "minecraft", // the name of this file.
		
		opts: {
			jarfile: "minecraft-server.jar",
			memory: 2048,
		}
	},
	
	_isrunning: function(){
		var r;
		
		var screen = exec(`sudo -H -u servman bash -c "screen -list | grep `+self.info.id+`"`);
		
		var timeout = setTimeout(function(){
			r = false;
		}, 1000);
		
		screen.stdout.on("data", function(data){
			clearTimeout(timeout);
			
			if(data.indexOf("No Sockets found") == -1){
				r = true;
			}else{
				r = false;
			}
		});
		
		while(r === undefined){deasync.runLoopOnce();}
		
		return r;
	},
	
	start: function(){
		if(self._isrunning()){
			log("ERROR", "The "+self.info.id+" server is already running. Use the 'restart' command to restart it."); 
			process.exit();
		}
		
		// check if the jar file is there.
		if(!fs.existsSync("../"+self.info.id+"/"+self.info.opts.jarfile)){
			log("ERROR", "The jarfile ("+self.info.opts.jarfile+") doesn't exist!");
			//return false;
		}
		
		// screen -d -A -m -S `+self.info.id+` "$JAVACMD" -server -Xms512M -Xmx`+self.info.opts.memory+`M -XX:PermSize=256M -jar /home/servman/`+self.info.opts.jarfile+` nogui
		
		log("INFO", "Starting the "+self.info.id+" server...");
		
		exec(`
			cd /home/servman/`+self.info.id+`/
			sudo -H -u servman bash -c "screen -d -A -m -L /home/servman/servman/`+self.info.id+`.log -S `+self.info.id+` java -server -Xms512M -Xmx`+self.info.opts.memory+`M -XX:PermSize=256M -jar /home/servman/`+self.info.id+`/`+self.info.opts.jarfile+` nogui"
			sudo -H -u servman bash -c "screen -S `+self.info.id+` -X multiuser on"
			sudo -H -u servman bash -c "screen -S `+self.info.id+` -X acladd tyler"
			sudo -H -u servman bash -c "screen -S `+self.info.id+` -X acladd danny"
		`);
		
		if(self._isrunning()){
			log("SUCCESS", "The "+self.info.id+" server has successfully started.");
		}else{
			log("ERROR", "The "+self.info.id+" server has failed to start.");
		}
	},
	
	stop: function(){
		if(!self._isrunning()){
			log("ERROR", "The "+self.info.id+" server isn't running. Use the 'start' command to start it."); 
			process.exit();
		}
		
		self.rcon("stop");
		
		log("INFO", "Told "+self.info.id+" to shut down, waiting for a response.", true);
		
		for(var i = 0; i < 10; i++){
			if(!self._isrunning()){
				log("SUCCESS", "The server has shut down gracefully.");
				break;
			}
			
			term(".")
			deasync.sleep(1000);
			
			if(i == 9){
				exec("screen -X -S "+self.info.id+" quit");
				term("\n")
				
				deasync.sleep(1000);
				
				if(self._isrunning()){
					log("ERROR", "The server isn't responding to our termination requests. Contact your administrator for help.");
				}else{
					log("WARN", "The server hasn't responded to our shutdown request in a timeful manner and has been terminated.");
				}
			}
		}
	},
	
	restart: function(){
		self.stop();
		self.start();
	},
	
	console: function(){
		var done = false;
		var path = "/home/servman/servman/"+self.info.id+".log";
		
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: ((self.info.id).yellow)+": "
		});
		
		readline.emitKeypressEvents(process.stdin);
		process.stdin.setRawMode(true);

		rl.prompt();
		
		// run commands
		rl.on("line", function(data){
			rl._refreshLine()
			self.rcon(data);
		});
		
		// comfort the user when they realize they ctrl+c... danny
		rl.on("SIGINT", function(data){
			term.eraseLine();
			term.left(999);
			
			log("INFO", "Terminating console session - don't worry, the server is still running.");
			process.exit();
		});
	
		process.stdin.on("keypress", function(str, key){
			rl._refreshLine()
		})
		
		while(!done){
			var file = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "-- no output --";
			
			var lines = file.split("\n");
			lines = lines.slice(lines.length - term.height);
		
			term.wrap(lines.join("\n"));
			
			rl._refreshLine()
			
			deasync.sleep(500);
		}
		
		// done?
	},
	
	rcon: function(cmd){
		exec(`screen -S `+self.info.id+` -X stuff "`+cmd+`\n"`)
	},
	
	status: function(){
		log("INFO", "The ", true);
		
		term.brightYellow();
		term(self.info.id);
		term.brightWhite();
		
		term(" server is currently... ");
		
		if(self._isrunning()){
			term.brightGreen();
			term("RUNNING");
		}else{
			term.brightRed();
			term("STOPPED");
		}
		
		term.brightWhite();
		term(".\n");
	},
	
	install: function(){
		log("INFO", "This feature is not currently supported.");
	},
	
	update: function(){
		log("INFO", "This feature is not currently supported.");
	}
}

self = module.exports;