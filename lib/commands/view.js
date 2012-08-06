var marked = require('marked'),
    fs = require('fs'),
    path = require('path'),
    npm = require('npm'),
    shell = require('shelljs'),
    moment = require('moment');

var __dir__ = {
    posts: 'posts',
    pages: 'pages',
    themes: 'themes',
    categories: 'categories',
    site: '_site'
};

var config,
    theme,
    dir_theme,
    config_theme,
    components,
    globalObj,
    config_viewEngine,
    viewEngine,
    ENCODING = 'utf-8';

function view() {

    config = require(process.env.PWD + '/config.json');

    theme = config.theme;

    if (!theme) {
        console.log('No theme specified, use the default theme.');
        theme = 'default';
    }

    dir_theme = __dir__['themes'] + '/' + theme;

    config_theme = require(process.env.PWD + '/' + dir_theme + '/config.json');

    config_viewEngine = config_theme['view-engine'];

    //components = parseComponents();


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

    viewEngine = require(process.env.PWD + '/node_modules/' + config_viewEngine.name);
    viewEngineWrapper = require('../wrappers/' + config_viewEngine.name);

    globalObj = parseGlobal();
    globalObj = require(process.env.PWD + '/' + dir_theme + '/lib.js').wrap(viewEngine, globalObj);

    var files = shell.find(dir_theme + '/layouts')
        .filter(function(file) {
            return file.match(/\.mustache$/);
        })
        .forEach(function(file) {
            var relativepath = path.relative(dir_theme + '/layouts', file),
                dirname = path.dirname(relativepath);
                filename = path.basename(relativepath, '.mustache');

            if (dirname == '.' || filename == 'index') {
                var conf = {
                    global: globalObj,
                    __dir__: path.relative(path.dirname(file), dir_theme + '/layouts') || '.',
                    title: filename == 'index' ? (dirname == '.' ? '' : dirname) : filename
                };
                render(file, conf, path.normalize(__dir__['site'] + '/' + dirname + '/' + filename + '.html'));
            } else {
                globalObj[dirname].forEach(function(partialConfig) {
                    partialConfig.global = globalObj;
                    partialConfig.__dir__ = path.relative(path.dirname(file), dir_theme + '/layouts') || '.';
                    if (!partialConfig.title)
                        partialConfig.title = dirname + '/' + partialConfig.name;
                    render(file, partialConfig, path.normalize(__dir__['site'] + '/' + dirname + '/' + partialConfig.filename));
                });
            }
        });
}

function loadViewEngine(callback) {
    npm.load({}, function(err, data) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        
        var str = config_viewEngine.name;
        if (config_viewEngine.version) {
            str += config_viewEngine.version;
        }
        npm.commands.install([str], function(err, data) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            callback();
        });
    });
}

function viewEngineLoaded() {
    return fs.existsSync(process.env.PWD + '/node_modules/' + config_viewEngine.name)
}

function parseConf(str) {
    var start = str.indexOf('<!--'),
        end = str.indexOf('-->');

    var json = str.slice(start + 4, end);
    var conf = JSON.parse(json);
    conf.date = new Date(conf.date);

    if (conf.categories) {
        if (!(conf.categories instanceof Array)) {
            conf.categories = [conf.categories];
        }
    } else {
        conf.categories = [];
    }

    return conf;
}

/*
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
*/

function render(layout, data, target) {
    layout = fs.readFileSync(layout, ENCODING);
    //var html = viewEngine[config_viewEngine.interface](layout, data, components);
    //console.log(components);
    //var html = viewEngine.to_html(layout, data, components);
    var html = viewEngineWrapper.execute(viewEngine, layout, data, dir_theme);
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
                filename: c + '.html',
                posts: globalObj.categories[c].posts,
                pages: globalObj.categories[c].pages
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
            conf.filename = path.basename(file, '.md') + '.html';
            conf.content = marked(content);
            globalObj[type].push(conf);
            conf.categories.forEach(function(category) {
                if (!globalObj.categories[category]) {
                    globalObj.categories[category] = {pages:[], posts: []};
                }
                globalObj.categories[category][type].push(conf);
            });
        });
        globalObj[type].sort(function(a, b) {
            return a.date.valueOf() < b.date.valueOf();
        });
        globalObj[type].forEach(function(item) {
            item.date = moment(item.date).format(config_theme['date-format'] || "YYYY-MM-DD");
        });
    }

}

module.exports = {
    command: 'view',
    description: '\tview a post',
    action: view
};
