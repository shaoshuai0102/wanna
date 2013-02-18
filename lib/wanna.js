"use strict";

var EventEmitter = require('events').EventEmitter,
    util = require("util");

var Wanna = function (config) {
  EventEmitter.call(this);
};
util.inherits(Wanna, EventEmitter);

Wanna.prototype.scan = function () {
  this.emit('readFile', {});
};

module.exports = new Wanna();