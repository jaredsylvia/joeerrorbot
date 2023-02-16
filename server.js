/*TODO
 * PRetty much everything. Learn react, form a canvas, figure out collision between player and enemies
 * Implement random encounters
 */
'use strict';

require('./tgbot.js');
const player = require('./player.js');
const command = require('./command.js');
var config = require('./config.js');
var playerDB = require('./playerDB.js');
var commandDB = require('./commandDB.js');

var http = require('http');
const { tgcommands } = require('./tgbot.js');
var port = process.env.PORT || 1337;
/*
var playerDatabase = new playerDB(config.databaseInfo[0], config.databaseInfo[1], config.databaseInfo[2], config.databaseInfo[3]);
var commandDatabase = new commandDB(config.databaseInfo[0], config.databaseInfo[1], config.databaseInfo[2], config.databaseInfo[3]);
playerDatabase.openDB(true);
*/
function everyFiveSeconds() {
    config.allPlayers.forEach(function (element) {
        element.heal(1);
    });
    
}

function everyMinute() {
    if (config.allPlayers[0] != null) {
        config.playerDatabase.updatePlayersBatch(config.playerDatabase.playerObjectToArray(config.allPlayers));
        config.allPlayers.forEach(function (element) {
            element.heal(3);
        });
    }
    if (allCommands[0] != null) {
        config.commandDatabase.updateCommandsBatch(config.commandDatabase.commandObjectToArray(allCommands));
    }

}

function everyFiveMinutes() {
    config.allPlayers.forEach(function (element) {
        element.heal(10);
    });
}

function everyTenMinutes() {
    config.allPlayers.forEach(function (element) {
               
        if (element.availableFights < 6) {
            element.availableFights++;
        };


    });
}

function everyHour() {
    config.allPlayers.forEach(function (element) {
        
        element.addXP(500);
        element.addCoin(50);
        if (element.availablePlayerFights < 3) {
            element.availablePlayerFights++;
        };
    });
}

setInterval(everyFiveSeconds, 5000);
setInterval(everyMinute, 60000);
setInterval(everyFiveMinutes, 300000);
setInterval(everyTenMinutes, 600000);
setInterval(everyHour, 3600000);



http.createServer(function (req, res) {
    const newPlayer = new player("Jared", "Master", 0, 0, 1);

    config.allPlayers.forEach(function (element) {
        res.write(`${element.name} the ${element.level} level ${element.charClass}\n`);
    });
    
    

    res.end('\nres.end line\n');
}).listen(port);
