var tgz = require('../../utils/tgz'),
    shell = require('shelljs'),
    request = require('request'),
    fs = require('fs');

module.exports = function() {
    console.log('publish a theme:');
    var config = require(process.env.PWD + '/config.json');

    shell.mkdir('-p', 'dist');

    // compress
    var file = 'dist/' + config.name + '-' + config.version + '.tgz';
    tgz.compress('.', file, function(err, file) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        console.log('File ' + file + ' created.');

        //upload
        var source = 'http://localhost:3000/' + config.name + '/' + config.version;
        fs.createReadStream(process.env.PWD + '/config.json')
        .pipe(request.put(source, function(err, res, body) {
            if (err) {
                console.log(err);
                process.exit(1);
            }

            if (res.statusCode != 200) {
                console.log('server responded with: ' + res.statusCode + ' ' + res.body);
                process.exit(1);
            }

            console.log('config.json uploaded.');

            fs.createReadStream(file)
            .pipe(request.put(source, function(err, res, body) {
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
            }))
            .on('end', function() {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
            });
        }))
        .on('end', function(err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
        });

        /*
           request(source, function(err, response, body) {
           if (err || response.statusCode != 200) {
           console.log('upload error');
           process.exit(1);
           }

        //console.log(arguments);
        fs.createReadStream(file)
        .pipe(request.put(source))
        .on('end', function() {
        console.log('upload end', arguments);
        });
        });
        */
    });

};
