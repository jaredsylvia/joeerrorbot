/* TODO
 * Move all /commands to separate classes and functions to remove mess of if statements
 * Figure out a way to return errors trapped by bot api, as they only return "polling error" or undefined using found code snippet
 */
'use strict';
const gTTS = require('gtts');
const command = require('./command.js');
const player = require('./player.js');
const monster = require('./monster.js');
const TelegramBot = require('node-telegram-bot-api');
var config = require('./config.js');

/*var playerDB = require('./playerDB.js');
var commandDB = require('./commandDB.js');*/

var http = require('http');


const token = config.telegramToken;
/*
var playerDatabase = new playerDB(config.databaseInfo[0], config.databaseInfo[1], config.databaseInfo[2], config.databaseInfo[3]);
var commandDatabase = new commandDB(config.databaseInfo[0], config.databaseInfo[1], config.databaseInfo[2], config.databaseInfo[3]);
*/

const bot = new TelegramBot(token, {
    polling: true
});

const callback = function (response) {
    var str = '';

    response.on('data', function (chunk) {
        str += chunk;
        console.log(chunk);
    });

    response.on('end', function () {
        console.log(str);
    });

}
var options = {
    host: 'www.random.org',
    path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
};
http.request(options, callback).end();



bot.onText(/^(?![/\s])/, function(msg){
    var orig;
    if(msg.from.username) {
    orig = msg.from.username;
    }
    else {
    orig = msg.from.first_name;
    }
    console.log(orig);
    if (config.allPlayers.find(item => item.id === msg.from.id)) {
        var currentPlayerLevel = config.allPlayers.find(item => item.id === msg.from.id).level;
        var messageLength = Number(msg.text.length);
        config.allPlayers.find(item => item.id === msg.from.id).addXP(messageLength);
        config.allPlayers.find(item => item.id === msg.from.id).addCoin((messageLength / 7.8));
        if (config.allPlayers.find(item => item.id === msg.from.id).level > currentPlayerLevel) {
            bot.sendMessage(msg.chat.id, `${config.allPlayers.find(item => item.id === msg.from.id).name} has leveled up.\n` +
                `They are now level ${config.allPlayers.find(item => item.id === msg.from.id).level} ` +
                `with ${config.allPlayers.find(item => item.id === msg.from.id).xp} XP ` +
                `and ${config.allPlayers.find(item => item.id === msg.from.id).coin} coins.`);
            config.playerDatabase.updatePlayer(config.allPlayers.find(item => item.id === msg.from.id));
        }
        
        
    }
    
})


/*?
bot.on('polling_error', (error) => {
    console.log(error.code);  // => 'EFATAL'
});
*/

bot.onText(/^\/([^\s]+)/, function (msg, match) {
    const data = match[1];
    var orig;
    var messageMinusCommand = msg.text.replace(`/${data}`, "");

    if (msg.from.username) {
        orig = msg.from.username.trim();
    }
    else {
        orig = msg.from.first_name.trim();
    }

    if (data == "add") {
        var commandElements = messageMinusCommand.split("|");
        var sendString;       
        if (commandElements[0].trim().length < 3) {
            sendString =  "Trigger lenghts must be greater than 2 characters long.";
        }
        else if (commandElements[1].trim().length < 10) {
            sendString = "Command text must be at least 10 characters.";
        }
        else if (commandElements[2].trim().length < 10) {
            sendString = "Help text must be at least 10 characters.";
        }
        else {
            if (config.allPlayers.find(item => item.id === msg.from.id)) {
                if (config.allPlayers.find(item => item.id === msg.from.id).coin >= 50) {
                    config.allPlayers.find(item => item.id === msg.from.id).coin -= 50;
                    
                    var newCommand = new command(msg.message_id, commandElements[0].trim(), commandElements[1].trim(), commandElements[2].trim(), msg.from.id);
                    config.allCommands.push(newCommand);
                    config.commandDatabase.updateCommand(newCommand);
                    sendString = `The command ${commandElements[0]} has been added by ${orig}`;
                }
                else {
                    sendString = "You need 50 coins to add a command.";
                }
            }
            else {
                sendString = "You need a character to use a command. Type /newCharacter.";
            }

        }
        bot.sendMessage(msg.chat.id, sendString);
    }
    else if (data == "voice") {
        var done = false;
        var gtts = new gTTS(messageMinusCommand);
        
                gtts.save('voice.mp3', function (err, result) {
                    if (err) { throw new Error(err); }
                    done = true;
                    
                });
        setTimeout(() => {
            bot.sendAudio(msg.chat.id, 'voice.mp3');
        }, messageMinusCommand.length * 20);      
        
        

    }

    else if (data == "help") {
        var allCommands = "/help - displays this message.\n/add - adds a command using {{orig}} as sender and {{term}} as recipient. \nex. /add trigger|{{orig}} messages {{term}}|help message\n";
        config.allCommands.forEach(function (element) {
            if (config.allPlayers.find(item => item.id === element.author)){
                var author = config.allPlayers.find(item => item.id === element.author).name;
            }
            else {
                var author = "Deleted Player";
            }
            allCommands += `/${element.trigger} - ${element.help}. Added by ${author}.\n`
        });
        bot.sendMessage(msg.chat.id, allCommands);
    }
    else if (data == "newCharacter") {
        var commandElements = messageMinusCommand.split(",");
        if (!commandElements[0] || !commandElements[1] || !commandElements[0].toLowerCase().match(/archer|fighter|rogue|pissmancer/)) {
            bot.sendMessage(msg.chat.id, "Please specify a class and a name.\nAvailable classes are: \"archer\", \"fighter\", \"rogue\", or \"pissmancer\"\n" +
                "ex. /newCharacter archer,joeerror");
        }
        else {
            var newPlayer = new player(msg.from.id, orig, commandElements[0].trim());
            newPlayer.setName(commandElements[1].trim());
            if (config.allPlayers.find(item => item.id === msg.from.id)) {
                
                if (index !== -1) {
                    config.allPlayers.indexOf(config.allPlayers.find(item => item.id === msg.from.id)) = newPlayer;
                }
            }
            else {
                config.allPlayers.push(newPlayer);
            }
            config.playerDatabase.updatePlayer(newPlayer);

            bot.sendMessage(msg.chat.id, `${newPlayer.name} the ${newPlayer.charClass} has been created. You start with ${newPlayer.coin} coins.`);


        }


    }
    else if (data == "character") {
        var commandElements = messageMinusCommand.split(",");
        var target = commandElements[0].trim();
        if (target.charAt(0) == "@") {
            target = target.substring(1);
        }

        var queriedPlayer;
        var sendString;
        var playerFound;
        if (config.allPlayers.find(item => item.name == target.trim())) {
            queriedPlayer = config.allPlayers.find(item => item.name == target.trim())
            playerFound = true;
        }
        else if (!target && config.allPlayers.find(item => item.id === msg.from.id)) {
            queriedPlayer = config.allPlayers.find(item => item.id === msg.from.id);
            playerFound = true;
        }
        else {
            playerFound = false;
        }
        switch (playerFound) {
            case true:
                sendString = `Name: ${queriedPlayer.name}\n` +
                    `Class: ${queriedPlayer.charClass}\n` +
                    `Level: ${queriedPlayer.level}\n` +
                    `XP: ${queriedPlayer.xp}\n` +
                    `XP left until level ${queriedPlayer.level + 1}: ${queriedPlayer.remainingXP}\n` +
                    `HP: ${Math.round(queriedPlayer.hp)}/${queriedPlayer.maxHP}\n` +
                    `Attack: ${Math.round(queriedPlayer.attack)}\n` +
                    `Coins: ${queriedPlayer.coin}\n` +
                    `Available player fights: ${queriedPlayer.availablePlayerFights}\n` +
                    `Available forest fights: ${queriedPlayer.availableFights}`;
                
                break;
            case false:
                queriedPlayer = config.allPlayers.find(item => item.id === msg.from.id);
                sendString = "No character found, try /newCharacter"
                break;
        }

        bot.sendMessage(msg.chat.id, sendString);
    }

    else if (data == "xpForCoins") {
        var sendString;
        var queriedPlayer;
        var commandElements = messageMinusCommand.split(",");
        var xp = Number(commandElements[0].trim());
        
        var commandElements = messageMinusCommand.split(",");
        if (config.allPlayers.find(item => item.id === msg.from.id) && !Number.isNaN(xp)) {
            config.allPlayers.find(item => item.id === msg.from.id).xpForCoins(xp);
            
            sendString = `Traded ${commandElements[0].trim()} XP for coins.`;
        }
        else {
            sendString = "No player found or no XP amount specified, try /newCharacter";
        }
        bot.sendMessage(msg.chat.id, sendString);
    }

    else if (data == "coinsForXP") {
        var sendString;
        var commandElements = messageMinusCommand.split(",");
        var coins = Number(commandElements[0].trim());

        var commandElements = messageMinusCommand.split(",");
        if (config.allPlayers.find(item => item.id === msg.from.id) && !Number.isNaN(coins)) {
            config.allPlayers.find(item => item.id === msg.from.id).coinsForXP(coins);

            sendString = `Traded ${commandElements[0].trim()} coins for XP.`;
        }
        else {
            sendString = "No player found or no coin amount specified, try /newCharacter";
        }
        bot.sendMessage(msg.chat.id, sendString);
    }
    
    else if (data == "heal") {
        var sendString;
        var commandElements = messageMinusCommand.split(",");
        var coins = Math.round(Number(commandElements[0].trim()));
        
        if (!config.allPlayers.find(item => item.id === msg.from.id)) {
            sendString = "Please create a character with /newCharacter.";
        }
        else if (!coins || coins <= 0) {
            
            sendString = "You must enter an amount of coins to spend on healing. Each coin will bring back .8 HP";
        }
        else {
            sendString = `${(config.allPlayers.find(item => item.id === msg.from.id).name)} just cashed in ${coins} to heal ${Math.round(coins * .8)} HP.`;
            config.allPlayers.find(item => item.id === msg.from.id).healWithCoin(coins);
        }
        bot.sendMessage(msg.chat.id, sendString);
    }
    else if (data == "slap") {
        var sendString;
        var commandElements = messageMinusCommand.split(",");
        var target = commandElements[0].trim();
        if (target.charAt(0) == "@") {
            target = target.substring(1);
        }

        if (config.allPlayers.find(item => item.id === msg.from.id) && config.allPlayers.find(item => item.name == target)) {
            var attacker = config.allPlayers.find(item => item.id === msg.from.id);
            var defender = config.allPlayers.find(item => item.name == target);
            var attackDamage = Math.floor((Math.random() * attacker.level) + 3);
            sendString = `${attacker.name} slaps ${defender.name} for ${attackDamage} grueling points of damage.`;
            config.allPlayers.find(item => item.name == target).takeDamage(attackDamage);
            if (config.allPlayers.find(item => item.name == target).isDead) {
                sendString = sendString + `\n${defender.name} then died from a fucking slap.`;
            }
            
        }
        else {
            
            sendString = `${target} doesn't have a character, I bet they're scared.`;
        }
        bot.sendMessage(msg.chat.id, sendString);
    }   

    else if (data == "changeName") {
        var sendString;
        var commandElements = messageMinusCommand.split(",");
        if (config.allPlayers.find(item => item.id === msg.from.id)) {
            var oldName = config.allPlayers.find(item => item.id === msg.from.id).name;
            config.allPlayers.find(item => item.id === msg.from.id).setName(commandElements[0].trim());
            sendString = `${oldName} is now known as ${commandElements[0].trim()}`;
            config.playerDatabase.updatePlayer(config.allPlayers.find(item => item.id === msg.from.id));
        }
        else {
            sendString = "Could not find your character. Try /newCharacter to create a character.";
        }
        bot.sendMessage(msg.chat.id, sendString);
    }

    else if (data == "fight") {
        var fightMessages = [];
        
        if (config.allPlayers.find(item => item.id === msg.from.id) != false) {
            var thisMonster = new monster("Goblin", config.allPlayers.find(item => item.id === msg.from.id).level);
            var attacker = config.allPlayers.find(item => item.id === msg.from.id);
            console.log(Math.random());
            if (Math.random() > attacker.level/100) {
                var thisMonsterDamage = thisMonster.calculateDamage();
                attacker.takeDamage(thisMonsterDamage);
                console.log("Sneak attack!");
                fightMessages.push(`${thisMonster.name} jumps from the tree doing ${thisMonsterDamage} damage!`);
            }
            while (thisMonster.isDead == false && attacker.isDead == false) {
            
                var attackDamage = attacker.calculateDamage();
                var thisMonsterDamage = thisMonster.calculateDamage();
                console.log(attackDamage);
                thisMonster.takeDamage(attackDamage);
                fightMessages.push(`${attacker.name} hits ${thisMonster.name} for ${attackDamage}`);
                if (thisMonster.isDead == true) {
                    console.log(thisMonster.name);
                    fightMessages.push(`${thisMonster.name} has died.`);
                    
                }
                else {
                    console.log(attacker.hp);
                    //config.allPlayers.find(item => item.id === msg.from.id).takeDamage(thisMonsterDamage);
                    fightMessages.push(`${attacker.name} suffers ${thisMonsterDamage} at the hands of a ${thisMonster.name}.`);
                    attacker.takeDamage(thisMonsterDamage);
                    console.log(attacker.hp);
                    
                }
                
            }
            
            if (attacker.isDead == true) {
                
                fightMessages.push(`${attacker.name} suffered wounds beyond their ability and has died.`);
            }
            else {
            
                attacker.addXP(thisMonster.xp);
                attacker.addCoin(thisMonster.coin);
                config.allPlayers.find(item => item.id === msg.from.id).addXP(thisMonster.xp);
                config.allPlayers.find(item => item.id === msg.from.id).addXP(thisMonster.coin);
                fightMessages.push(`${attacker.name} gains ${thisMonster.coin} coins and ${thisMonster.xp} experience.`);
            }
        }
        
        
        
        config.allPlayers.find(item => item.id === msg.from.id).availableFights--;

        var timeout = 0;
        fightMessages.forEach(function (element) {
            console.log(element);
            timeout += 500;
            setTimeout(() => {
                bot.sendMessage(msg.chat.id, element);
            }, timeout);
        });
    }
    else if (data == "attack") {
        var sendString;
        var commandElements = messageMinusCommand.split(",");
        var target = commandElements[0].trim();
        if (target.charAt(0) == "@") {
            target = target.substring(1);
        }
        if (config.allPlayers.find(item => item.id === msg.from.id).availablePlayerFights <= 0) {
            bot.sendMessage(msg.chat.id, "You don't have any player fights available.\nPlease wait and try again later.");
        }
        else if (config.allPlayers.find(item => item.id === msg.from.id) && config.allPlayers.find(item => item.name == target)) {
            var attacker = config.allPlayers.find(item => item.id === msg.from.id);
            var defender = config.allPlayers.find(item => item.name == target);
            var fightMessages = [];
            if (attacker.isDead == true || defender.isDead == true) {
                var sendString = "";
                if (attacker.isDead == true)
                    sendString = sendString + `${attacker.name} is dead.\n`;
                if (defender.isDead == true)
                    sendString = sendString + `${defender.name} is dead.`;
                bot.sendMessage(msg.chat.id, sendString);
                return;
            }
            config.allPlayers.find(item => item.id === msg.from.id).availablePlayerFights -= 1;
            while (config.allPlayers.find(item => item.id === msg.from.id).isDead == false && config.allPlayers.find(item => item.name == target).isDead == false) {
                var attackerDamage = attacker.calculateDamage();
                var defenderDamage = defender.calculateDamage();
                fightMessages.push(`${attacker.name} hits ${defender.name} for ${attackerDamage} damage!`);
                config.allPlayers.find(item => item.name == target).takeDamage(attackerDamage);
                fightMessages.push(`${defender.name} retaliates for ${defenderDamage} damage!`);
                config.allPlayers.find(item => item.id === msg.from.id).takeDamage(defenderDamage);
            }
            if (config.allPlayers.find(item => item.id === msg.from.id).isDead == false && config.allPlayers.find(item => item.name == target).isDead == true) {
                fightMessages.push(`${attacker.name} is victorious. ${defender.name} lays dead at their feet, no mercy was shown.`);
                config.allPlayers.find(item => item.id === msg.from.id).addXP(Math.round(defender.xp * .03));
                config.allPlayers.find(item => item.id === msg.from.id).addCoin(Math.round(defender.coin * .03));
                config.allPlayers.find(item => item.name == target).removeXP(Math.round(defender.xp * .01));
                config.allPlayers.find(item => item.name == target).removeCoin(Math.round(defender.coin * .01));
                fightMessages.push(`${attacker.name} gains ${Math.round(defender.xp * .03)} XP and ${Math.round(defender.coin * .03)} coins.`);
                
            }
            else if (config.allPlayers.find(item => item.id === msg.from.id).isDead == true && config.allPlayers.find(item => item.name == target).isDead == false) {
                fightMessages.push(`${defender.name} succesfully fended off ${attacker.name}. They will not be missed.`);
                config.allPlayers.find(item => item.id === msg.from.id).removeXP(Math.round(attacker.xp * .01));
                config.allPlayers.find(item => item.id === msg.from.id).removeCoin(Math.round(attacker.coin * .01));
                config.allPlayers.find(item => item.name == target).addXP(Math.round(attacker.xp * .03));
                config.allPlayers.find(item => item.name == target).addCoin(Math.round(attacker.coin * .03));
                fightMessages.push(`${defender.name} gains ${Math.round(attacker.xp * .03)} XP and ${Math.round(attacker.coin * .03)} coins.`);
                
            }
            else if (config.allPlayers.find(item => item.id === msg.from.id).isDead == true && config.allPlayers.find(item => item.name == target).isDead == true) {
                fightMessages.push("You both died. Idiots.");
                
            }
            var timeout = 0;
            fightMessages.forEach(function (element) {
                console.log(element);
                timeout += 500;
                
                    setTimeout(() => {
                        bot.sendMessage(msg.chat.id, element);
                    }, timeout);
                
                              
            });
        }

        else {
            bot.sendMessage(msg.chat.id, "Couldn't find one of the players. If you don't have a character yet try /newCharacter");
        }
    }
        
    else if (data == "listPlayers") {
        var sendString = "";
        config.allPlayers.forEach(function (element) {
            sendString = sendString + `${element.name} the level ${element.level} ${element.charClass}\n`;
        });
        bot.sendMessage(msg.chat.id, sendString);
    }
    else if (data == "addXP" && msg.from.id == config.adminUser) {
        var commandElements = messageMinusCommand.split(",");
        config.allPlayers.forEach(function (element) {
            element.addXP(Number(commandElements[0]));
        });
        config.playerDatabase.updatePlayersBatch(config.playerDatabase.playerObjectToArray(config.allPlayers));
        bot.sendMessage(msg.chat.id, `All players received ${commandElements[0]} XP`);
    }
    else if (data == "addCoin" && msg.from.id == config.adminUser) {
        var commandElements = messageMinusCommand.split(",");
        config.allPlayers.forEach(function (element) {
            element.addCoin(Number(commandElements[0]));
        });
        config.playerDatabase.updatePlayersBatch(config.playerDatabase.playerObjectToArray(config.allPlayers));
        bot.sendMessage(msg.chat.id, `All players received ${commandElements[0]} coins.`);
    }
    else if (data == "healAll" && msg.from.id == config.adminUser) {
        var commandElements = messageMinusCommand.split(",");
        config.allPlayers.forEach(function (element) {
            element.hp = element.maxHP;
        });
        bot.sendMessage(msg.chat.id, "All players have been fully healed");
    }

    else if (data == "resetAll" && msg.from.id == config.adminUser) {
        var newPlayers = []
        config.allPlayers.forEach(function (element) {
            var oldPlayer = element;
            var newPlayer = new player(oldPlayer.id, oldPlayer.name, oldPlayer.charClass);
            newPlayers.push(newPlayer);
        });
        config.allPlayers = [];
        config.allPlayers = newPlayers;
        config.playerDatabase.updatePlayersBatch(config.playerDatabase.playerObjectToArray(newPlayers));
        bot.sendMessage(msg.chat.id, "All players have been reset.");
    }
    

    else if (config.allCommands.find(item => item.trigger === data)) {
        const thisCommand = config.allCommands.find(item => item.trigger === data);
        var commandElements = messageMinusCommand.split(",");
        if (config.allPlayers.find(item => item.id === thisCommand.author) && msg.from.id != thisCommand.author) {
            config.allPlayers.find(item => item.id === thisCommand.author).addCoin(10);
        }
        bot.sendMessage(msg.chat.id, thisCommand.commandText(orig, commandElements[0]));
    }

})
