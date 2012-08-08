var shell = require('shelljs'),
    fs = require('fs'),
    path = require('path');

var ENCODING = 'utf-8';

function execute(Handlebars, tpl, data, dir_theme) {
    var components = getComponents(dir_theme);
    for (var name in components) {
        Handlebars.registerPartial(name, components[name]);
    }

    var template = Handlebars.compile(tpl);
    return template(data);
}

var components;

function getComponents(dir_theme) {
    if (!components) {
        components = {};
        var files = shell.ls(dir_theme + '/components');
        files.forEach(function(file) {
            components[path.basename(file, path.extname(file))] = fs.readFileSync(dir_theme + '/components/' + file, ENCODING);
        });
    }
    return components;
}

exports.execute = execute;
