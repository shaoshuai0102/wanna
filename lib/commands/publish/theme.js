var tgz = require('../../utils/tgz'),
    shell = require('shelljs'),
    request = require('request'),
    fs = require('fs'),
    validateTheme = require('../../utils/validateTheme.js');

module.exports = function() {
    validateTheme('.');
    console.log('publish a theme:');
    var config = require(process.env.PWD + '/theme.json');

    shell.mkdir('-p', 'dist');

    // compress
    var file = 'dist/' + config.name + '-' + config.version + '.tgz';
    tgz.compress('.', file, function(err, file) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        console.log('File ' + file + ' created.');

        if (fs.existsSync('~/.wannarc')) {
        }
        //upload
        var registry = config.registry || 'http://registry.wannajs.org';
        var source = registry + '/' + config.name + '/' + config.version;
        //fs.createReadStream(process.env.PWD + '/theme.json')
        var jsonfile = fs.readFileSync(process.env.PWD + '/theme.json', 'utf-8');
        request.put({
            url: source,
            body: jsonfile,
            headers: {
                'content-type': 'application/json',
                'content-length': jsonfile.length
            }
        }, function(err, res, body) {
            if (err) {
                console.log(err);
                process.exit(1);
            }

            if (res.statusCode != 200) {
                console.log('server responded with: ' + res.statusCode + ' ' + res.body);
                process.exit(1);
            }

            console.log('theme.json uploaded.');

            var themetgzfile = fs.readFileSync(file, 'binary');
            
            //fs.createReadStream(file)

            request.put({
                url: source,
                headers: {
                    'content-type': 'application/x-tar-gz',
                    'content-length': themetgzfile.length
                },
                body: themetgzfile
            }, function(err, res, body) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
                if (res.statusCode != 200) {
                    console.log('server responded with: ' + res.statusCode + ' ' + res.body);
                    process.exit(1);
                }

                console.log('tgz file uploaded.');
                console.log('success');
            })
            /*
            .on('end', function() {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
            });
            */
        })
        .on('end', function(err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
        });
    });

};
