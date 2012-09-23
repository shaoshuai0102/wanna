var fs = require('fs'),
    shell = require('shelljs'),
    download = require('../utils/download.js'),
    path = require('path'),
    URL = require('url'),
    tgz = require('../utils/tgz.js'),
    validateTheme = require('../utils/validateTheme.js');

var TMPDIR = '.install';

shell.rm('-rf', TMPDIR);

function install(theme) {
    shell.mkdir('-p', TMPDIR);
    if (!theme) {
        var config = require(process.env.PWD + '/config.json');
        theme = config.theme;
    }

    resolveTheme(theme, function(dir) {

        validateTheme(dir);

        var theme_name = require(path.resolve(process.env.PWD, dir + '/theme.json')).name;

        shell.mv(dir, path.dirname(dir) + '/' + theme_name);
        dir = path.dirname(dir) + '/' + theme_name;
        copy(dir, 'themes/');
        shell.rm('-rf', TMPDIR);
        console.log('INSTALL SUCCESS.');
    });
}

function resolveTheme(raw, cb) {
    if (fs.existsSync(raw)) {
        var st = fs.statSync(raw);
        if (st.isFile()) {
            console.log('install <tarbal file>');
            tgz.decompress(raw, TMPDIR, function(err, dir) {
                if (err) {
                    console.error('Error: extract ' + raw + ' error.');
                    process.exit(1);
                }
                var files = shell.ls(dir);
                var files = shell.ls(dir);
                var theme_path;
                files.forEach(function(file) {
                    var st = fs.statSync(TMPDIR + '/' + file);
                    if (st.isDirectory()) {
                        theme_path = file;
                        return;
                    }
                });
                console.log(theme_path);
                cb(TMPDIR + '/' + theme_path);
            });
        } else if (st.isDirectory()) {
            console.log('install <folder>');
            shell.cp('-R', raw, TMPDIR + '/');
            cb(TMPDIR + '/' + path.basename(raw));
        } else {
            console.log('Illegal theme.');
            process.exit(1);
        }
    } else {
        if (/^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(raw)) {
            console.log('install <tarbal url>');

            var path_to_file = TMPDIR + '/' + path.basename(URL.parse(raw).pathname);
            console.log('Downloading "' + raw + '" to "' + path_to_file + '"...');
            download(raw, path_to_file, function(err) {
                if (err) {
                    console.log('Download error: ' + err.message);
                    process.exit(1);
                }
                tgz.decompress(path_to_file, TMPDIR, function(err, dir) {
                    if (err) {
                        console.error('Error: extract ' + raw + ' error.');
                        process.exit(1);
                    }
                    var files = shell.ls(dir);
                    var theme_path;
                    files.forEach(function(file) {
                        var st = fs.statSync(TMPDIR + '/' + file);
                        if (st.isDirectory()) {
                            theme_path = file;
                            return;
                        }
                    });
                    cb(TMPDIR + '/' + theme_path);
                });
            });
        } else if (raw.indexOf('git') > -1) {
            console.log('install <git repo>');
        } else {
            var arr = raw.split('@');
            var themename = arr[0],
                version = arr[1];
            if (version) {
                console.log('install <theme@version>');
            } else {
                console.log('install <theme>');
                version = 'latest';
            }

            var config = require(process.env.PWD + '/config.json');
            var registry = config.registry || 'http://registry.wannajs.org';

            var request = require('request'),
                url = registry + '/' + themename + '/' + version;
            request.get({
                url: url,
                headers: {
                    'Accept': 'application/json'
                }
            }, function(err, res, body) {
                if (err) {
                    console.error("Error", err);
                    process.exit(1);
                }

                if (res.statusCode != 200) {
                    console.error('Wanna registry server responded with code ' + res.statusCode + '.');
                    process.exit(1);
                }

                var json = JSON.parse(body);
                var tarball_url = json.tarball;
                
                if (version == 'latest') {
                    console.log('The latest version of theme ' + themename + ' is ' + json.version);
                }
                
                if (!tarball_url) {
                    console.error('Error: No tarball url specified in the response. This theme has some problems.');
                    process.exit(1);
                }

                var save_path = TMPDIR + '/' + themename + '-' + version + '.tgz';
                request.get({
                    url: url,
                    headers: {
                        'Accept': 'application/x-tar-gz'
                    }
                }, function(err, res, body) {
                    if (err) {
                        console.error('Error:', err);
                        process.exit(1);
                    }

                    if (res.statusCode != 200) {
                        console.error('Wanna registry server responded with code ' + res.statusCode + '.');
                        process.exit(1);
                    }

                    console.log('File downloaded to ' + save_path);
                    resolveTheme(save_path, cb);

                }).pipe(fs.createWriteStream(save_path));
            });
        }
    }

    //cb(dir);
}

function copy(dir, to) {
    console.log('Copy "' + dir + '" to "' + to + '"...');
    shell.rm('-rf', to + '/' + path.basename(dir));
    shell.cp('-R', dir, to)
}

module.exports = {
    command: 'install [theme]',
    description: '\tinstall a theme. If no theme specified, the theme specified in the theme.json is installed.'
                + '\n\tA theme can be:'
                + '\n\t\t<tarball file>                   - wanna install path/to/theme.tgz'
                + '\n\t\t<tarball url>                    - wanna install http://path/to/theme.tgz'
                + '\n\t\t<folder>                     - wanna install ./path/to/theme/'
                + '\n\t\t<theme name>                 - wanna install excellent'
                + '\n\t\t<theme name>@<tag>           - wanna install excellent@latest'
                + '\n\t\t<theme name>@<version>       - wanna install excellent@0.8.1'
                + '\n\t\t<theme name>@<version range> - wanna install excellent@">=0.5"'
                + '\n\t\t<git repo>                   - wanna install https://github.com/shaoshuai0102/wanna-theme-default.git',
    action: install
};
