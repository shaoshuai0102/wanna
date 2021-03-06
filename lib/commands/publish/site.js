var fs = require('fs'),
    JSON5 = require('json5');

module.exports = function() {
    var exec = require('child_process').exec,
        child;
        //config = require(process.env.PWD + '/config.json');
    var configfile = fs.readFileSync(process.env.PWD + '/config.json', 'utf-8');
    var config = JSON5.parse(configfile);

    console.log('begin publish my site:');
    var cmd = 'rsync -avz -e ssh --timeout=60 --exclude=.git _site/ ' + config.rsync_username + '@' + config.rsync_host + ":" + config.rsync_path + '/';
    console.log(cmd);
    child = exec(cmd, function (error, stdout, stderr) {
        console.log(stdout);
        if (stderr)
            console.log(stderr);
        if (error !== null) {
            console.log('wanna PUBLISH ERROR: ' + error);
        } else {
            console.log('wanna PUBLISH SUCCESS');
        }
    });
};
