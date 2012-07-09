var marked = require('marked'),
    fs = require('fs'),
    path = require('path'),
    config = require(process.env.PWD + '/config.json'),
    npm = require('npm'),
    shell = require('shelljs');

var __dir__ = {
    posts: 'posts',
    pages: 'pages',
    themes: 'themes',
    site: 'site'
};

var ENCODING = 'utf-8',
    components,
    globalObj;

var theme = config.theme,
    dir_theme = __dir__['themes'] + '/' + theme;

var config_theme = require(process.env.PWD + '/' + dir_theme + '/config.json');
var viewEngineObj = config_theme['view-engine'],
    viewEngine;

function view() {
    if (viewEngineLoaded()) {
        execute();
    } else {
        loadViewEngine(function() {
            execute();
        });
    }
}

function execute() {
    shell.rm('-rf', __dir__['site']);
    fs.mkdirSync(__dir__['site']);
    fs.mkdirSync(__dir__['site'] + '/' + __dir__['posts']);
    fs.mkdirSync(__dir__['site'] + '/' + __dir__['pages']);
    shell.cp('-r', dir_theme + '/assets', __dir__['site'])

    viewEngine = require(process.env.PWD + '/node_modules/' + viewEngineObj.name);
    processPosts();
    processPages();
    processCategories();
    processArchives();
    processIndex();
    processCategoriesIndex();
    processArchivesIndex();
}

function loadViewEngine(callback) {
    npm.load({}, function(err, data) {
        if (err)
            return console.log(err);
        
        var str = viewEngineObj.name;
        if (viewEngineObj.version) {
            str += viewEngineObj.version;
        }
        npm.commands.install([str], function(err, data) {
            if (err) {
                return console.log(err);
            }
        });
    });
}

function viewEngineLoaded() {
    return fs.existsSync(process.env.PWD + '/node_modules/' + viewEngineObj.name)
}

function processPosts() {
    var posts = shell.ls(__dir__['posts']);
    posts.forEach(function(post) {
        processPost(post, __dir__['posts']);
    });
}

function processPages() {
    var pages = shell.ls(__dir__['pages']);
    pages.forEach(function(page) {
        processPage(page, __dir__['pages']);
    });
}

function processIndex() {
    var conf = {
        global: parseGlobal()
    };
    var layout = fs.readFileSync(dir_theme + '/layouts/index.mustache', 'utf-8');
    var html = viewEngine[viewEngineObj.interface](layout, conf, parseComponents());
    fs.writeFileSync(__dir__['site'] + '/index.html', html, 'utf-8');
}

function processCategories() {
}

function processCategoriesIndex() {
}

function processArchives() {
}

function processArchivesIndex() {
}

function processPost(post, dir) {
    generateHtml(dir + '/' + post, __dir__['site'] + '/' + __dir__['posts'], 'post');
}

function processPage(page, dir) {
    generateHtml(dir + '/' + page, __dir__['site'] + '/' + __dir__['pages'], 'page');
}

function generateHtml(file, target_dir, type) {
    var content = fs.readFileSync(file, ENCODING);

    var content = marked(content);

    var conf = parseConf(content);
    conf.content = content;
    conf.global = parseGlobal();
    for (var t in config) {
        conf.global[t] = config[t];
    }

    var layout = fs.readFileSync(dir_theme + '/layouts/' + type + '.mustache', 'utf-8');
    var html = viewEngine[viewEngineObj.interface](layout, conf, parseComponents());

    var fileName = path.basename(file, '.md');
    fs.writeFileSync(target_dir + '/' + fileName + '.html', html, 'utf-8');
}

function parseConf(str) {
    var start = str.indexOf('<!--'),
        end = str.indexOf('-->');

    var json = str.slice(start + 4, end);
    var conf = JSON.parse(json);

    if (conf.categories) {
        if (!(conf.categories instanceof Array)) {
            conf.categories = [conf.categories];
        }
    } else {
        conf.categories = [];
    }

    return conf;
}

function parseComponents() {
    if (!components) {
        components = {};
        var files = shell.ls(dir_theme + '/components');
        files.forEach(function(file) {
            components[file.slice(0, -9)] = fs.readFileSync(dir_theme + '/components/' + file, 'utf-8');
        });
    }
    return components;
}

function parseGlobal() {
    if (!globalObj) {
        globalObj = {
            posts: [],
            pages: []
        };
        var posts = shell.ls(__dir__['posts']),
            pages = shell.ls(__dir__['pages']);

        globalObj.categories = {};
        processFiles(posts, 'posts');
        processFiles(pages, 'pages');
        var arr = [];
        for (var c in globalObj.categories) {
            arr.push({
                name: c,
                count: globalObj.categories[c]
            });
        }
        globalObj.categories = arr;
    }
    return globalObj;

    function processFiles(files, type) {
        files.forEach(function(file) {
            var content = fs.readFileSync(__dir__[type] + '/' + file, 'utf-8');
            var conf = parseConf(content);
            conf.file = path.basename(file, '.md') + '.html';
            globalObj[type].push(conf);
            conf.categories.forEach(function(category) {
                if (globalObj.categories[category]) {
                    globalObj.categories[category]++;
                } else {
                    globalObj.categories[category] = 1;
                }
            });
        });
    }

}

module.exports = {
    command: 'view',
    description: '\tview a post',
    action: view
};
