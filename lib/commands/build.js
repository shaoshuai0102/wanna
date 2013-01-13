var logging = require('colorful').logging,
    JSON5 = require('json5'),
    fs = require('fs'),
    _ = require('underscore'),
    idParser = require('../utils/id-parser.js'),
    npm = require('npm'),
    consolidate = require('consolidate');

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
        loadViewEngine(config.theme.viewEngine, function(viewEngine) {

            // see https://github.com/shaoshuai0102/wanna/wiki/Data-Structure
            var data = generateData();

            processPosts();
            processPages();
            processResources();
            logging.start('Building done');
        });
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
    // parse view engine object
    theme.viewEngine = idParser.parse(theme.viewEngine);
    if (!theme.viewEngine) {
        logging.error('Loading object "theme" error: no view engine specified in the theme.json file.');
        process.exit(1);
    }
    configuration.theme = theme;
    logging.info('Object "theme" loaded');
    logging.debug('theme:', theme);

    logging.end('Configuration loaded');
    return configuration;
}

function loadViewEngine(viewEngineInfo, callback) {
    logging.start('Start loading view engine');
    logging.debug('Use view engine: ' + viewEngineInfo.id);
    var installed = fs.existsSync(process.env._ + '/../../node_modules/' + viewEngineInfo.name);
    if (!installed) {
        logging.info('View engine "' + viewEngineInfo.name + '" hasn\'t been installed before.');
        installViewEngine(viewEngineInfo, function() {
            logging.end('View engine Loaded');
            callback(consolidate[viewEngineInfo.name]);
        });
    } else {
        logging.end('View engine Loaded');
        callback(consolidate[viewEngineInfo.name]);
    }
}

function installViewEngine(viewEngineInfo, callback) {
    logging.start('Start install view engine with npm');
    var stream = require('stream');
        stream = new stream.Stream();
    stream.writable = true;
    npm.load({prefix: process.env._ + '/../../', /*loglevel: 'silent',*/ logstream: stream}, function(err, data) {
        if (err) {
            logging.error('Npm error: ', err);
            process.exit(1);
        }

        
        npm.commands.install([viewEngineInfo.id], function(err, data) {
            if (err) {
                logging.error(err);
                process.exit(1);
            }
            logging.end('View engine "' + viewEngineInfo.name + '" installed');
            callback();
        });

        /*
        npm.on("log", function (message) {
            logging.debug(message);
        });
        */
        
    });
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

