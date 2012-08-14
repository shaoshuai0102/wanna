function publish() {
    var exec = require('child_process').exec,
        child,
        config = require(process.env.PWD + '/config.json');

    console.log('begin publish my site:');
    var cmd = 'rsync -avz -e ssh --timeout=60 --exclude=.git _site ' + config.rsync_username + '@' + config.rsync_host + ":" + config.rsync_path;
    console.log(cmd);
    child = exec(cmd, function (error, stdout, stderr) {
        console.log(stdout);
        if (stderr)
            console.log(stderr);
        if (error !== null) {
            console.log('publish ERROR: ' + error);
        } else {
            console.log('publish success');
        }
    });
}

module.exports = {
    command: 'publish',
    description: '\tpublish my site',
    action: publish
};
