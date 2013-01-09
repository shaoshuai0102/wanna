var clc = require('cli-color');

module.exports = {
    error: function(str) {
        console.log(clc.red.bold(str));
    },
    warn: function(str) {
        console.log(clc.yellow(str));
    },
    info: function(str) {
        console.log(clc.blue(str));
    },
    log: function(str) {
        console.log(str);
    }
};
