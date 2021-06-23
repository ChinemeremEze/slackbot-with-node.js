const sqlite3 = require('sqlite3');

class Database {
    constructor(dbFile) {
        this.dbFile = dbFile;
    }

    //  Provide access to the database for the class
    db() { 
        return new sqlite3.Database(this.dbFile); 
    }

    //  Get all message from the database
    //  SELECT * FROM messages;
    async get_messages() { 
        let response_messages = [];
        return new Promise((resolve, reject) => {
            this.db().serialize(() => {
                this.db().each("SELECT * FROM messages;", (error, message) => {
                    if(!error) {
                        response_messages.push(message);
                    } else {
                        //  Provide feedback for the error
                        console.log(error);
                    }
                }, () => {
                    resolve(response_messages);
                });
            });
        });
    }

    //  Get a message from the database
    //  SELECT * FROM messages WHERE msgid = ?;
    async get_message(msgid) { 
        let response_message = [];
        return new Promise((resolve, reject) => {
            this.db().serialize(() => {
                this.db().each("SELECT * FROM messages WHERE msgid = ?;",msgid, (error, message) => {
                    if(!error) {
                        response_message.push(message);
                    } else {
                        //  Provide feedback for the error
                        console.log(error);
                    }
                }, () => {
                    resolve(response_message[0]);
                });
            });
        });
    }

    //  Add a message to the database
    //  INSERT INTO messages (status, message) ?, ?);
    async add_message(values) {
        let response_message = "CREATE ENTRY SUCCESSFUL";

        return new Promise((resolve, reject) => {
            this.db().serialize(() => {
                this.db().run ("INSERT INTO messages (status, message ) VALUES(?,?);",[values.status, values.message], (error, message) => {
                    if(!error) {
                        response_message.push(message);
                    } else {
                        //  Provide feedback for the error
                        console.log(error);
                    }
                }, () => {
                    resolve(response_message);
                });
            });
        });
    }

        //  Update all messages in the database
    //  UPDATE messages SET status = ?, message = ?;
    async update_messages(values) {
        return new Promise((resolve, reject) => {
            this.db().serialize(() => {
                this.db().run ("UPDATE messages SET status=? , message=?;",[values.status, values.message ], (error, message) => {
                    if(!error) {
                        console.log(message);
                    } else {
                        //  Provide feedback for the error
                        console.log(error);
                    }
                }, () => {
                    resolve("REPLACE COLLECTION SUCCESSFUL");
                });
            });
        });
    }  
    //  Update a message in the database
    //  UPDATE messages SET status = ?, message = ? WHERE msgid = ?;
    async update_message(msgid, values) {
        return new Promise((resolve, reject) => {
            this.db().serialize(() => {
                this.db().run("UPDATE messages SET status=? , message=? WHERE msgid=?;",[values.status, values.message, msgid], (error, message) => {
                    if(!error) {
                        console.log(message);
                    } else {
                        //  Provide feedback for the error
                        console.log(error);
                    }
                }, () => {
                    resolve("UPDATE ITEM SUCCESSFUL");
                });
            });
        });
    }               

    //  Delete a message from the database
    //  DELETE FROM messages WHERE msgid = ?;
    async delete_message(msgid) {
        return new Promise((resolve, reject) => {
            this.db().serialize(() => {
                this.db().run("DELETE FROM messages WHERE msgid = ?;",[msgid], (error, message) => {
                    if(!error) {
                        console.log(message);
                    } else {
                        //  Provide feedback for the error
                        console.log(error);
                    }
                }, () => {
                    resolve("DELETE ITEM SUCCESSFUL");
                });
             });
        });
    }

    //  Delete all messages from the database
    //  DELETE FROM messages
    async delete_messages() {
        return new Promise((resolve, reject) => {
            this.db().each("DELETE FROM messages;", (error, message) => {
                if(!error) {
                    console.log(message);
                } else {
                    //  Provide feedback for the error
                    console.log(error);
                    
                }
            }, () => {
                resolve("DELETE COLLECTION SUCCESSFUL");
            });
        });
    }
} 

module.exports = Database;