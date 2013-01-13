var logging = require('colorful').logging,
    JSON5 = require('json5'),
    fs = require('fs'),
    _ = require('underscore');

logging.config('debug');

var DIR = {
    posts: 'posts',
    pages: 'pages',
    themes: 'themes',
    raw: 'raw',
    categories: 'categories',
    site: '_site'
};

module.exports = {
    command: 'build',
    description: '\tbuild the site',
    action: function() {
        logging.start('Start building');
        var config = load();

        // load view engine
        var viewEngine = loadViewEngine();

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
    logging.info('wanna object loaded');
    logging.debug('wanna:', configuration.wanna);

    var site = JSON5.parse(fs.readFileSync(process.env.PWD + '/config.json', 'utf-8'));
    var default_site = {
        theme: 'default',
        title: 'title: Configure title in config.json.',
        registry: 'http://registry.wannajs.org'
    };
    site = _.extend(default_site, site);
    configuration.site = site;
    logging.info('site object loaded');
    logging.debug('site:', site);

    var theme = require(process.env.PWD + '/' + DIR['themes'] + '/' + configuration.site.theme + '/theme.json');
    var default_theme = {
        viewEngine: {
            name: 'jade',
            version: 'latest'
        },
        vars: {
            'date-format': 'YYYY-MM-DD'
        }
    };
    theme = _.extend(default_theme, theme, site.vars);
    configuration.theme = theme;
    logging.info('theme object loaded');
    logging.debug('theme:', theme);

    logging.end('Configuration loaded');
    return configuration;
}

function generateData() {
    logging.start('Start generating data');

    logging.end('Data generated');
    return {};
}

function loadViewEngine() {
    logging.start('Start loading view engine');

    logging.end('View engine Loaded');
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

