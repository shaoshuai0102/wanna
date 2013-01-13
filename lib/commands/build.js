var logging = require('colorful').logging,
    JSON5 = require('json5'),
    fs = require('fs'),
    _ = require('underscore'),
    idParser = require('../utils/id-parser.js');

//logging.config('debug');

var DIR = {
    posts: 'posts',
    pages: 'pages',
    themes: 'themes',
    raw: 'raw',
    categories: 'categories',
    site: '_site'
};

var DEFAULTS = {
    site : {
        theme: 'default',
        title: 'title: Configure title in config.json.',
        registry: 'http://registry.wannajs.org'
    },
    theme: {
        viewEngine: {
            name: 'jade',
            version: 'latest'
        },
        vars: {
            'date-format': 'YYYY-MM-DD'
        }
    }
};

module.exports = {
    command: 'build',
    description: '\tbuild the site',
    options: [
        ['-v, --verbose', 'Turn on verbose output. Mostly useful for debugging.']
    ],
    action: function(program) {
        logging.config({verbose: program.verbose})

        logging.start('Start building');
        var config = load();

        // load view engine
        var viewEngine = loadViewEngine(config.theme.viewEngine);

        // see https://github.com/shaoshuai0102/wanna/wiki/Data-Structure
        var data = generateData();

        processPosts();
        processPages();
        processResources();
        logging.start('Building done');
    }
};

function load() {
    logging.start('Start loading configuration');

    var configuration = {};

    configuration.wanna = require('../../package.json');
    logging.info('Object "wanna" loaded');
    logging.debug('wanna:', configuration.wanna);

    var site = JSON5.parse(fs.readFileSync(process.env.PWD + '/config.json', 'utf-8'));
    site = _.extend(DEFAULTS.site, site);
    configuration.site = site;
    logging.info('Object "site" loaded');
    logging.debug('site:', site);

    var theme = require(process.env.PWD + '/' + DIR['themes'] + '/' + configuration.site.theme + '/theme.json');
    theme = _.extend(DEFAULTS.theme, theme, site.vars);
    theme.viewEngine = idParser.parse(theme.viewEngine);
    configuration.theme = theme;
    logging.info('Object "theme" loaded');
    logging.debug('theme:', theme);

    logging.end('Configuration loaded');
    return configuration;
}

function loadViewEngine(viewEngineInfo) {
    logging.start('Start loading view engine');
    logging.debug('Use view engine: ' + viewEngineInfo.name + '@' + viewEngineInfo.version);
    /*
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
    */


    logging.end('View engine Loaded');
}

function generateData() {
    logging.start('Start generating data');

    logging.end('Data generated');
    return {};
}

function processPosts() {
    logging.start('Start processing posts');

    logging.end('Posts processed');
}

function processPages() {
    logging.start('Start processing pages');

    logging.end('Posts processed');
}

function processResources() {
    logging.start('Start processing resources');

    logging.end('Resources processed');
}

