"use strict";

var logging = require('./utils').logging,
    JSON5 = require('json5'),
    _ = require('underscore'),
    fs = require('fs'),
    idParser = require('../utils/id-parser.js');


// TODO scheme ะฃั้


var wanna, site, theme;

var DEFAULTS = {
  site: {
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

module.exports = function() {
  return {
    wanna: exports.loadWanna(),
    site: exports.loadSite(),
    theme: exports.loadTheme()
  };
};

exports.loadWanna = function() {
  if (!wanna) {
    wanna = require('../../package.json');
    logging.info('Object "wanna" loaded');
    logging.debug('wanna:', wanna);
  }
  return wanna;
};

exports.loadSite = function() {
  if (!site) {
    site = JSON5.parse(fs.readFileSync(process.env.PWD + '/config.json',
        'utf-8'));
    site = _.extend(DEFAULTS.site, site);
    logging.info('Object "site" loaded');
    logging.debug('site:', site);
  }
  return site;
};

exports.loadTheme = function() {
  if (!theme) {
    var site = exports.loadSite();
    theme = require(process.env.PWD + '/' + site.directories.themes + '/' +
        site.theme + '/theme.json');
    theme = _.extend(DEFAULTS.theme, theme, site.vars);
    // parse view engine object
    theme.viewEngine = idParser.parse(theme.viewEngine);
    if (!theme.viewEngine) {
      logging.error('Loading object "theme" error: no view engine specified' +
          ' in the theme.json file.');
      process.exit(1);
    }
    logging.info('Object "theme" loaded');
    logging.debug('theme:', theme);
  }
  return theme;
};