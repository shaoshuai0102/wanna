var logging = require('colorful').logging,
    JSON5 = require('json5'),
    fs = require('fs'),
    _ = require('underscore'),
    idParser = require('../utils/id-parser.js'),
    npm = require('npm'),
    consolidate = require('consolidate'),
    EventEmitter = require('events').EventEmitter,
    util = require("util");

var Build = function() {
    EventEmitter.call(this);
};
util.inherits(Build, EventEmitter);
Build.prototype.scanFiles = function() {
    this.emit('readFile', {});
};

var DEFAULTS = {
    site : {
        theme: 'default',
        title: 'title: Configure title in config.json.',
        registry: 'http://registry.wannajs.org',
        directories: {
            themes: 'themes',
            site: '_site'
        }
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

    var theme = require(process.env.PWD + '/' + site.directories['themes'] + '/' + configuration.site.theme + '/theme.json');
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

function installViewEngine(viewEngineInfo, callback) {
    logging.debug('Use view engine: ' + viewEngineInfo.id);
    var installed = fs.existsSync(process.env._ + '/../../node_modules/' + viewEngineInfo.name);
    if (!installed) {
        logging.info('View engine "' + viewEngineInfo.name + '" hasn\'t been installed before.');
        logging.start('Start install view engine with npm');
        var stream = require('stream');

        var writestream = new stream.Stream();
        writestream.writable = true;
        var buf = '';
        writestream.write = function (data) {
            buf += data;
            if (buf.charAt(buf.length - 1) == '\n') {
                logging.info(buf.slice(0, -1));
                buf = '';
            }
            return true;
        };
        writestream.on('error', function (err) {
            logging.error("ERROR", err);
            process.exit(1);
        });

        npm.load({prefix: process.env._ + '/../../', /*loglevel: 'silent',*/ logstream: writestream}, function(err, data) {
            if (err) {
                logging.error('ERROR', err);
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

            npm.on("log", function (message) {
                logging.debug(message);
            });
            
        });
    } else {
        callback();
        //consolidate[viewEngineInfo.name]
    }
}

function registerObservers(config) {
    logging.start('Start registring observers');
    var theme = config.theme;
    logging.end('Observers registered');
}

function generateData(config) {
    logging.start('Start generating data');
    var data = {};

    scanFiles(function(file) {
    });

    logging.end('Data generated');
    return data;
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

function scanFiles() {
}

module.exports = {
    command: 'build',
    description: '\tbuild the site',
    options: [
        ['-v, --verbose', 'Turn on verbose output. Mostly useful for debugging.']
    ],
    action: function(program) {
        logging.config({verbose: program.verbose})

        logging.start('Start building');
        // see https://github.com/shaoshuai0102/wanna/wiki/Data-Structure
        var config = load();

        registerObservers(config);

        var data = generateData(config);
        // load view engine
        installViewEngine(config.theme.viewEngine, function(viewEngine) {
            processPosts(config, data);
            processPages(config, data);
            processResources(config, data);
            logging.start('Building done');
        });
    }
};

