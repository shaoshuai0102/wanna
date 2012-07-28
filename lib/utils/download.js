var fs = require ('fs'),
    http = require('http'),
    https = require('https');

function getFile(url, path, cb) {
    var http_or_https = http;
    if (/^https:\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(url)) {
        http_or_https = https;
    }
    http_or_https.get(url, function(response) {
        var headers = JSON.stringify(response.headers);
        switch(response.statusCode) {
            case 200:
                var file = fs.createWriteStream(path);
                response.on('data', function(chunk){
                    file.write(chunk);
                }).on('end', function(){
                    file.end();
                    cb(null);
                });
                break;
            case 301:
            case 302:
            case 303:
            case 307:
                getFile(response.headers.location, path, cb);
                break;
            default:
                cb(new Error('Server responded with status code ' + response.statusCode));
        }

    })
    .on('error', function(err) {
        cb(err);
    });
}

module.exports = getFile;
/*

getFile('http://www.xiaonei.com/220959947', 'renren.html', function(err) {
    if (err) {
        console.log('error: ' + err.message);
    } else {
        console.log('success');
    }
});
*/
