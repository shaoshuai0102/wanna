var path = require('path'),
    idParser = require('../utils/id-parser.js'),
    fs = require('fs');

module.exports = function(dir) {
    try {
        var config = require(path.resolve(process.env.PWD, dir + '/theme.json'));
    } catch (e) {
        console.error('ERROR: No theme.json found or the theme.json found invalid.');
        process.exit(0);
    }

    var theme_name = config.name;
    if (!theme_name) {
        console.error('ERROR: The theme name must be specified in the theme.json.');
        process.exit(0);
    }

    var theme_version = config.version;
    if (!theme_version) {
        console.error('ERROR: The theme version must be specified in the theme.json.');
        process.exit(0);
    }

    var viewEngine = config.viewEngine;
    viewEngine = idParser.parse(config['viewEngine']);
    if (!viewEngine || !viewEngine.name) {
        console.error('Error: A view Engine must be specified in the theme.json!');
        process.exit(1);
    }

    var required_dirs = ['layouts', 'assets', 'components'];
    var b = false;
    required_dirs.forEach(function(d, i) {
        if (!fs.existsSync(dir + '/' + d)) {
            console.error('ERROR: "' + d + '" directory cannot be found in the theme.');
            b = true;
        }
    });
    if (b) {
        process.exit(1);
    }
    console.log('Theme validation passed.');
};
