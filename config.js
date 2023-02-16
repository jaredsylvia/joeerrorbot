var player = require('./player.js');
var playerDB = require('./playerDB.js');
var commandDB = require('./commandDB.js');
var command = require('./command.js');

allPlayers = [];
allCommands = [];
var databaseInfo = ["SQLhost", "SQLuse", "SQLpass", "SQLdatabase"];
const telegramToken = 'telegramToken';
var adminUser = 000000; //telegramID of admin user

playerDatabase = new playerDB(databaseInfo[0], databaseInfo[1], databaseInfo[2], databaseInfo[3]);
playerDatabase.openDB(true);
commandDatabase = new commandDB(databaseInfo[0], databaseInfo[1], databaseInfo[2], databaseInfo[3]);
commandDatabase.openDB(true);


/* TODO
 * Replace timeouts with better solution. Asynch with callbacks maybe?
 */
setTimeout(() => {
    playerDatabase.createTables();
    commandDatabase.createTables();
}, 500);
setTimeout(() => {
    playerDatabase.retrieveAllPlayers();
    commandDatabase.retrieveAllCommands();
}, 750);

console.log("Config tasks completed.");



module.exports.telegramToken = telegramToken;
module.exports.adminUser = adminUser;
module.exports.databaseInfo = databaseInfo;
module.exports.allPlayers = allPlayers;
module.exports.allCommands = allCommands;

