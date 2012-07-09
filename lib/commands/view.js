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
    categories: 'categories',
    site: 'site'
};

var theme = config.theme,
    dir_theme = __dir__['themes'] + '/' + theme;

var ENCODING = 'utf-8',
    components = parseComponents(),
    globalObj = parseGlobal();

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
    fs.mkdirSync(__dir__['site'] + '/' + __dir__['categories']);
    shell.cp('-r', dir_theme + '/assets', __dir__['site'])

    viewEngine = require(process.env.PWD + '/node_modules/' + viewEngineObj.name);
    processIndex();
    processPosts();
    processPages();
    processCategoriesIndex();
    processCategories();
    processArchives();
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

function processIndex() {
    var conf = {
        global: globalObj,
        __dir__: '.'
    };
    render(dir_theme + '/layouts/index.mustache', conf, __dir__['site'] + '/index.html');
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

function processPost(post, dir) {
    generateHtml(dir + '/' + post, __dir__['site'] + '/' + __dir__['posts'], 'post');
}

function processPage(page, dir) {
    generateHtml(dir + '/' + page, __dir__['site'] + '/' + __dir__['pages'], 'page');
}

function processCategoriesIndex() {
    var conf = {
        global: globalObj,
        __dir__: '..'
    };
    render(dir_theme + '/layouts/categories/index.mustache', conf, __dir__['site'] + '/categories/index.html');
}

function processCategories() {
    var conf = {
        global: globalObj,
        __dir__: '..'
    };
    globalObj.categories.forEach(function(category) {
        render(dir_theme + '/layouts/categories/category.mustache', conf, __dir__['site'] + '/categories/' + category.name + '.html');
    });
}

function processArchives() {
    var conf = {
        global: globalObj,
        __dir__: '.'
    };
    render(dir_theme + '/layouts/archives.mustache', conf, __dir__['site'] + '/archives.html');
}

function generateHtml(file, target_dir, type) {
    var content = fs.readFileSync(file, ENCODING);

    var content = marked(content);

    var conf = parseConf(content);
    conf.content = content;
    conf.__dir__ = '..';
    conf.global = globalObj;

    render(dir_theme + '/layouts/' + type + 's/' + type + '.mustache', conf, target_dir + '/' + path.basename(file, '.md') + '.html');
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
            components[file.slice(0, -9)] = fs.readFileSync(dir_theme + '/components/' + file, ENCODING);
        });
    }
    return components;
}

function render(layout, data, target) {
    layout = fs.readFileSync(layout, ENCODING);
    var html = viewEngine[viewEngineObj.interface](layout, data, components);
    fs.writeFileSync(target, html, ENCODING);
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

        for (var t in config) {
            globalObj[t] = config[t];
        }
    }
    return globalObj;

    function processFiles(files, type) {
        files.forEach(function(file) {
            var content = fs.readFileSync(__dir__[type] + '/' + file, ENCODING);
            var conf = parseConf(content);
            conf.file = path.basename(file, '.md') + '.html';
            conf.content = marked(content);
            globalObj[type].push(conf);
            conf.categories.forEach(function(category) {
                if (globalObj.categories[category]) {
                    globalObj.categories[category].push(conf);
                } else {
                    globalObj.categories[category] = [conf];
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
