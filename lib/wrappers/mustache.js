var shell = require('shelljs'),
    fs = require('fs');

var ENCODING = 'utf-8';

function execute(mustache, tpl, data, dir_theme) {
    var components = getComponents(dir_theme);
    return mustache.to_html(tpl, data, components);
}

var components;

function getComponents(dir_theme) {
    if (!components) {
        components = {};
        var files = shell.ls(dir_theme + '/components');
        files.forEach(function(file) {
            components[file.slice(0, -9)] = fs.readFileSync(dir_theme + '/components/' + file, ENCODING);
        });
    }
    return components;
}

exports.execute = execute;
