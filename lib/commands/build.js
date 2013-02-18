"use strict";
var JSON5 = require('json5');
var fs = require('fs');
var _ = require('underscore');
var npm = require('npm');
var wanna = require('../wanna');
var sdk = require('../sdk/index'),
    logging = sdk.utils.logging;


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
      if (buf.charAt(buf.length - 1) === '\n') {
        logging.info(buf.slice(0, -1));
        buf = '';
      }
      return true;
    };
    writestream.on('error', function (err) {
      logging.error("ERROR", err);
      process.exit(1);
    });

    npm.load({prefix: process.env._ + '/../../', /*loglevel: 'silent',*/ logstream: writestream}, function (err, data) {
      if (err) {
        logging.error('ERROR', err);
        process.exit(1);
      }

      npm.commands.install([viewEngineInfo.id], function (err, data) {
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
  action: function (program) {
    logging.config({verbose: program.verbose});

    logging.start('Start building');
    // see https://github.com/shaoshuai0102/wanna/wiki/Data-Structure
    var config = sdk.load();

    // load view engine
    installViewEngine(config.theme.viewEngine, function (viewEngine) {
      /*
      wanna.scan()
        .on('file', function(file) {
          //parseFile()
        })
        .on('scanCompleted', function() {

        });
      */
      //processPosts(config, data);
      //processPages(config, data);
      //processResources(config, data);
      logging.start('Building done');
    });
  }
};