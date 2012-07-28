var fs = require('fs'),
    shell = require('shelljs'),
    download = require('../utils/download.js'),
    path = require('path'),
    URL = require('url');

function install(theme) {
    if (!theme) {
        var config = require(process.env.PWD + '/config.json');
        theme = config.theme;
    }

    console.log(theme);

    resolveTheme(theme, function(dir) {
        copy(dir, 'themes/');
    });
}

function resolveTheme(raw, cb) {
    console.log('resolveTheme');
    var exist = fs.existsSync(raw);

    var dir;
    if (exist) {
        var st = fs.statSync(raw);
        if (st.isFile()) {
            console.log('is file');
            //decompress
        } else if (st.isDirectory()) {
            console.log('is directory');
            dir = raw;
        } else {
            console.log('Illegal theme.');
            process.exit(1);
        }
    } else {
        console.log('not exist');
        if (/^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(raw)) {
            //url
            //download first
            download(raw, path.basename(URL.parse(raw)), function(err) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
            });
        } else {
            //
        }
    }

    cb(dir);
}

function copy(dir, to) {
    console.log('copy to dir');
    shell.cp('-R', dir, to)
}

module.exports = {
    command: 'install [theme]',
    description: '\tinstall a theme. If no theme specified, the theme specified in the config.json is installed.'
                + '\n\tA theme can be:'
                + '\n\t\t<zip file>        - wanna install path/to/theme.zip'
                + '\n\t\t<zip url>         - wanna install http://path/to/theme.zip'
                + '\n\t\t<folder>              - wanna install ./path/to/theme/'
                + '\n\t\t<pkg>                 - wanna install excellent'
                + '\n\t\t<pkg>@<tag>           - wanna install excellent@latest'
                + '\n\t\t<pkg>@<version>       - wanna install excellent@0.8.1'
                + '\n\t\t<pkg>@<version range> - wanna install excellent@">=0.5"',
    action: install
};
