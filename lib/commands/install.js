var fs = require('fs');
function install(theme) {
    if (!theme) {
        var config = require(process.env.PWD + '/config.json');
        theme = config.theme;
    }

    console.log(theme);

    resolveTheme(theme, function(err) {
        if (err) {
        }
        copyToThemesDir();
    });
}

function resolveTheme(raw, cb) {
    console.log('resolveTheme');
    var exist = fs.existsSync(raw);
    if (exist) {
        var st = fs.statSync(raw);
        if (st.isFile()) {
            console.log('is file');
        } else if (st.isDirectory()) {
            console.log('is directory');
        } else {
            console.log('Illegal theme.');
            process.exit(1);
        }
    } else {
        console.log('not exist');
    }

    cb();
}

function copyToThemesDir() {
    console.log('copy to dir');
}

module.exports = {
    command: 'install [theme]',
    description: '\tinstall a theme. If no theme specified, the theme specified in the config.json is installed.'
                + '\n\tA theme can be:'
                + '\n\t\t<tarball file>        - wanna install path/to/theme.tgz'
                + '\n\t\t<tarball url>         - wanna install http://path/to/theme.tgz'
                + '\n\t\t<folder>              - wanna install ./path/to/theme/'
                + '\n\t\t<pkg>                 - wanna install excellent'
                + '\n\t\t<pkg>@<tag>           - wanna install excellent@latest'
                + '\n\t\t<pkg>@<version>       - wanna install excellent@0.8.1'
                + '\n\t\t<pkg>@<version range> - wanna install excellent@">=0.5"',
    action: install
};
