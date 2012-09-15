var tgz = require('../../utils/tgz'),
    shell = require('shelljs');

module.exports = function() {
    console.log('publish a theme');
    var config = require(process.env.PWD + '/config.json');

    shell.mkdir('-p', 'dist');

    var filename = 'dist/' + config.name + '-' + config.version + '.tgz'
    tgz.compress('.', filename, function(err, file) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        console.log('File ' + file + ' created.');
    });
};
