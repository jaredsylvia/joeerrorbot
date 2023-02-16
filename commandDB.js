var config = require('./config.js');
var mysql = require('mysql');
const command = require('./command.js');

class commandDB {
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
        var sql = "CREATE TABLE if not exists commands" +
            "(commandID BIGINT NOT NULL," +
            "commandTrigger VARCHAR(64)," +
            "commandText TEXT," +
            "helpText TEXT," +
            "authorID BIGINT," +
            "PRIMARY KEY(commandID)" +
            ")";

        var result = this.performQuery(sql);
        return result;
    }

    updateCommand(selectedCommand) {
        var sql = `INSERT INTO commands` +
            `(commandID, commandTrigger, commandText, helpText, authorID)` +
            `VALUES (${selectedCommand.id}, \"${selectedCommand.trigger}\", \"${selectedCommand.text}\",` +
            `\"${selectedCommand.help}\",${selectedCommand.author})` +
            `ON DUPLICATE KEY UPDATE commandTrigger=\"${selectedCommand.trigger}\", commandText=\"${selectedCommand.text}\", helpText=\"${selectedCommand.help}\"`;
        var result = this.performQuery(sql);
        return result;
    }

    commandObjectToArray(commandArray) {
        var values = [];
        commandArray.forEach(function (element) {
            values.push([element.id, element.trigger, element.text, element.help, element.author]);
        });
        return values;
    }
    updateCommandsBatch(valueArray) {
        var con = this.con;

        var sql = `INSERT INTO commands` +
            `(commandID, commandTrigger, commandText, helpText, authorID)` +
            `VALUES ?` +
            `ON DUPLICATE KEY UPDATE commandTrigger=VALUES(commandTrigger),` +
            `commandText=VALUES(commandText), helpText=VALUES(helpText)`;

        con.query(sql, [valueArray], function (err) {
            if (err) console.log(err);
        });
    }

    retrieveCommand(commandID) {
        var sql = `SELECT * FROM commands` +
            `WHERE commandID = ${commandID}` +
            `LIMIT 1`;
        var result = this.performQuery(sql);
        Object.keys(result).forEach(function (key) {
            var row = result[key];
            console.loge(row.name);
        });
        return result[key];
    }

    retrieveAllCommands() {
        var con = this.con;
        var sql = "SELECT * FROM commands";

        con.query(sql, function (err, result, fields) {
            if (err) console.log(err);
            Object.keys(result).forEach(function (key) {
                var row = result[key];
                //console.log(row);
                config.allCommands.push(new command(row.commandID, row.commandTrigger, row.commandText, row.helpText, row.authorID));

            });
            return result;
        });


    }
}
module.exports = commandDB;