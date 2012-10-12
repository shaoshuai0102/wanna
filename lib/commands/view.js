var marked = require('marked'),
    fs = require('fs'),
    path = require('path'),
    npm = require('npm'),
    shell = require('shelljs'),
    moment = require('moment'),
    idParser = require('../utils/id-parser.js'),
    JSON5 = require('json5');

var __dir__ = {
    posts: 'posts',
    pages: 'pages',
    themes: 'themes',
    raw: 'raw',
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

    //config = require(process.env.PWD + '/config.json');
    var configfile = fs.readFileSync(process.env.PWD + '/config.json', 'utf-8');
    config = JSON5.parse(configfile);

    theme = config.theme;

    if (!theme) {
        console.log('No theme specified, use the default theme.');
        theme = 'default';
    }

    dir_theme = __dir__['themes'] + '/' + theme;

    config_theme = require(process.env.PWD + '/' + dir_theme + '/theme.json');
    config_viewEngine = idParser.parse(config_theme['viewEngine']);
    if (!config_viewEngine || !config_viewEngine.name) {
        console.error('Error: A view Engine must be specified in the theme.json!');
        process.exit(1);
    }

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
    shell.cp('-r',  __dir__['raw'], __dir__['site'])

    viewEngine = require(process.env.PWD + '/node_modules/' + config_viewEngine.name);
    viewEngineWrapper = require('../wrappers/' + config_viewEngine.name);

    globalObj = parseGlobal();

    // If a file called lib.js existed in the root directory of theme, then use the wrap function to wrap global object.
    if (fs.existsSync(process.env.PWD + '/' + dir_theme + '/lib.js')) {
        globalObj = require(process.env.PWD + '/' + dir_theme + '/lib.js').wrap(viewEngine, globalObj);
    }

    var files = shell.find(dir_theme + '/layouts')
        .filter(function(file) {
            var stat = fs.statSync(file);
            return stat.isFile();
        })
        .forEach(function(file) {
            var relativepath = path.relative(dir_theme + '/layouts', file),
                dirname = path.dirname(relativepath);
                filename = path.basename(relativepath, path.extname(file));

            if (dirname == '.' || filename == 'index') {
                var conf = {
                    global: globalObj,
                    __dir__: path.relative(path.dirname(file), dir_theme + '/layouts') || '.',
                    title: filename == 'index' ? (dirname == '.' ? '' : dirname) : filename
                };

                conf.path = path.normalize(dirname + '/' + filename + '.html');

                // If a file called lib.js existed in the root directory of theme, then use the wrap function to wrap page object or post object.
                if (fs.existsSync(process.env.PWD + '/' + dir_theme + '/lib.js')) {
                    conf = require(process.env.PWD + '/' + dir_theme + '/lib.js').wrapSingle(viewEngine, conf);
                }

                render(file, conf, path.normalize(__dir__['site'] + '/' + dirname + '/' + filename + '.html'));
            } else {
                globalObj[dirname].forEach(function(partialConfig) {
                    partialConfig.global = globalObj;
                    partialConfig.__dir__ = path.relative(path.dirname(file), dir_theme + '/layouts') || '.';
                    if (!partialConfig.title)
                        partialConfig.title = dirname + '/' + partialConfig.name;

                    // If a file called lib.js existed in the root directory of theme, then use the wrap function to wrap page object or post object.
                    if (fs.existsSync(process.env.PWD + '/' + dir_theme + '/lib.js')) {
                        conf = require(process.env.PWD + '/' + dir_theme + '/lib.js').wrapSingle(viewEngine, partialConfig);
                    }

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
        
        var str = config_viewEngine.id;
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
    var conf = JSON5.parse(json);
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

function render(layout, data, target) {
    layout = fs.readFileSync(layout, ENCODING);
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
            conf.type = type;
            conf.content = marked(content);

            conf.path = path.normalize(type + '/' + conf.filename);

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
            item.date = moment(item.date).format(config['dateFormat'] || config_theme['dateFormat'] || "YYYY-MM-DD hh:mm");
        });
    }

}

module.exports = {
    command: 'view',
    description: '\tview a post',
    action: view
};
