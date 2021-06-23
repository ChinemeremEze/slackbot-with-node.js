const fs = require("fs");

class Logger{
    constructor(file){
        this.file = file || 'testlog.txt'
    }
    log(line){
        fs.appendFile(this.file,line, function (err){
            if(err) throw err;
        })
    }
}
module.exports = Logger;