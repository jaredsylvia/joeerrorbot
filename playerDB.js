const player = require('./player.js');
var config = require('./config.js');
var mysql = require('mysql');


class playerDB {
    host;
    user;
    password;
    database;
    con;

    constructor(host, user, password, database) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.database = database;
        this.con = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database
        });
    }

    openDB(action) {
        var con = this.con;
        switch (action) {
            case true:
                con.connect(function (err, result) {
                    if (err) console.log(err);
                });
                
                break;
            case false:
                con.end();
                break;
        }
        this.con = con;        
    }
       
    performQuery(sql) {
        var con = this.con;
            
            con.query(sql, function (err, result) {
                if (err) console.log(err);
                //console.log(result);
                return result;
            });
        
        
        
    }
    createTables() {
        var sql = "CREATE TABLE if not exists players" +
                "(playerID BIGINT NOT NULL," +
                "name VARCHAR(64)," +
                "charClass VARCHAR(64)," +
                "level INT," +
                "xp BIGINT," +
                "maxHP INT," +
                "attack FLOAT," +
                "attackSpeed FLOAT," +
                "kills BIGINT," +
                "coin INT," +
                "PRIMARY KEY(playerID)" +
                ")";
               
        var result = this.performQuery(sql);
        return result;
    }

    updatePlayer(selectedPlayer) {
        var sql = `INSERT INTO players` +
            `(playerID, name, charClass, level, xp, maxHP, attack, attackSpeed, kills, coin)` +
            `VALUES (${selectedPlayer.id}, \"${selectedPlayer.name}\", \"${selectedPlayer.charClass}\",` + 
            `${selectedPlayer.level}, ${selectedPlayer.xp}, ${selectedPlayer.maxHP},` + 
            `${selectedPlayer.attack}, ${selectedPlayer.attackSpeed},` +
            `${selectedPlayer.kills}, ${selectedPlayer.coin})` +
            `ON DUPLICATE KEY UPDATE charClass = VALUES(charClass), level = VALUES(level),` +
            `xp = VALUES(xp), maxHP = VALUES(maxHP), name = VALUES(name), attack = VALUES(attack), ` +
            `attackSpeed = VALUES(attackSpeed), kills = VALUES(kills), coin = VALUES(coin)`;

        var result = this.performQuery(sql);
        return result;
    }

    playerObjectToArray(playerArray) {
        var values = [];
        playerArray.forEach(function (element) {
            values.push([element.id, element.name, element.charClass, element.level,
            element.xp, element.maxHP, element.attack, element.attackSpeed, element.kills,
            element.coin]);
        });
        return values;
    }
    updatePlayersBatch(valueArray) {
        var con = this.con;
        
        var sql = `INSERT INTO players` +
            `(playerID, name, charClass, level, xp, maxHP, attack, attackSpeed, kills, coin)` +
            `VALUES ?` +
            `ON DUPLICATE KEY UPDATE charClass=VALUES(charClass), level=VALUES(level),` +
            `xp=VALUES(xp), maxHP=VALUES(maxHP), name=VALUES(name), attack=VALUES(attack),` +
            `attackSpeed=VALUES(attackSpeed),kills=VALUES(kills), coin=VALUES(coin)`;
               
        con.query(sql, [valueArray], function (err) {
            if (err) console.log(err);
        });
    }

    retrievePlayer(playerID) {
        var sql = `SELECT * FROM players` +
            `WHERE playerID = ${playerID}` +
            `LIMIT 1`;
        var result = this.performQuery(sql);
        Object.keys(result).forEach(function (key) {
            var row = result[key];
            
        });
        return result;
    }

    retrieveAllPlayers() {
        var con = this.con;
        var sql = "SELECT * FROM players";

        con.query(sql, function (err, result, fields) {
            if (err) console.log(err);
            Object.keys(result).forEach(function (key) {
                var row = result[key];
            
                config.allPlayers.push(new player(row.playerID, row.name, row.charClass, row.level, row.xp, row.coin,
                    row.maxHP, row.attack, row.attackSpeed, row.kills));
                
            });
            return result;
        });
              
        
    }
}

module.exports = playerDB;


