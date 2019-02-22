// standardized log function.
var term = require("terminal-kit").terminal

module.exports = function(type, string, nobr){
	term.brightWhite();
	term("[");
	
	type = type.toUpperCase();
	
	switch(type){
		case "INFO":
			term.brightCyan();
			term("INFO");
			break;
		case "ERROR":
			term.brightRed();
			term("ERROR");
			break;
		case "WARN":
			term.brightYellow();
			term("WARN");
			break;
		case "SUCCESS":
			term.brightGreen();
			term("SUCCESS");
			break;
		case "DEBUG":
			term.magenta();
			term("DEBUG");
			break;
	}
	
	term.brightWhite();
	term("] ");
	
	//term.white();
	if(nobr === true){
		term(string);
	}else{
		console.log(string);
	}
}