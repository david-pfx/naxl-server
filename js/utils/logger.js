/*! *******************************************************
 *
 * evolutility-server-node :: utils/logger.js
 * Simple formatted console logger (not logging to file).
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

const config = require('../../config.js'),
	pkg = require('../../package.json'),
	chalk = require('chalk')

let consoleLog = config.consoleLog;

function green(msg){
	if(consoleLog){
		console.error(chalk.green(msg));
	}
}

module.exports = {

	setEnable: function(enable) {
		consoleLog = enable
	},

	banner: function() {
		if (consoleLog) {
			console.log(chalk.cyanBright(
				`Naxl Server v${pkg.version}\n` +
				`http://localhost:${config.apiPort}${config.apiPath}\n` +
				`${new Date()}\n`))
		}
	},

	logReq: function(title, req){
		if(consoleLog){
			console.log(chalk.cyan('\n--- '+title+' : '+req.params.entity+' ---'));
			console.log('params = '+JSON.stringify(req.params, null, 2));
			console.log('query = '+JSON.stringify(req.query, null, 2));
			console.log('body = '+JSON.stringify(req.body, null, 2));
		}
	},

	logObject: function(title, obj){
		if(consoleLog){
			console.log(title+' = '+JSON.stringify(obj, null, 2));
		}
	},

	logSQL: function (sql){
		if(consoleLog){
			console.log('sql = '+sql+'\n');
		}
	},

	logCount: function(nbRecords){
		green('Sending '+nbRecords+' records.');
	},
	
	green: green,

	logSuccess: function(msg){
		green(msg);
	},

	logError: function(err, modeInfo){
		if(consoleLog){
			console.error(chalk.red(err));
			if(modeInfo){
				console.error(chalk.red(modeInfo))
			}
		}
	},

	errorMsg: function(err, method){
		if(consoleLog){
			this.logError(err);
			return {
				error: err,
				method: method
			}
		}else{
			return {
				error: 'Error'
			}
		}
	},

	log: function(...args) {
		if (consoleLog)
			console.log(...args)
	}

};
