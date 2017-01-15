'use strict';

const winston = require('winston');

const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$ಠ');

/*
 * 'npm' logging levels:
 *   { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 *
 *  RFC5424 'syslog' levels:
 *   { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
 */
winston.setLevels(winston.config.npm.levels);

module.exports = {
  logger: winston,
  shortid: shortid,
  
  fs: require('fs'),
  path: require('path'),
  Promise: require('bluebird')
};


