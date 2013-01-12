var logging = require('colorful').logging,
    JSON5 = require('json5'),
    fs = require('fs');

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

    configuration.site = JSON5.parse(fs.readFileSync(process.env.PWD + '/config.json', 'utf-8'));
    logging.info('site object loaded');
    logging.debug('site:', configuration.site);

    configuration.theme = require(process.env.PWD + '/' + DIR['themes'] + '/' + configuration.site.theme + '/theme.json');
    logging.info('theme object loaded');
    logging.debug('theme:', configuration.theme);

    logging.end('Configuration loaded');
    return {};
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

