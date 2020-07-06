'use strict';

var APP_NAME = require('./base').appName;
var LOG_PATH = require('./base').logPath;

module.exports = {

  defaultCategory: APP_NAME,

  defaultLogPath: LOG_PATH,

  appenders: [
    {
      type: 'dateFile',
      category: 'console'
    },
    {
      type: 'dateFile',
      category: 'milkyway-dispather'
    }
  ],
  levels: {
    console: 'DEBUG',
    'milkyway-dispather': 'DEBUG'
  }
};
