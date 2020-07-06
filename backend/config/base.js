'use strict';

var path = require('path');

var ROOT_PATH = path.normalize(__dirname + '/../..');

module.exports = {

  isDevelopment: process.env.NODE_ENV === 'development',

  appName: require('../../package.json').name,

  rootPath: ROOT_PATH,
  logPath: path.join(ROOT_PATH, 'log')

};
