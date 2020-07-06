'use strict';

var fs = require('fs');
var _ = require('lodash');

var logger = require('./log').getLogger(__filename);

function parseJson(str) {
  if (_.isObject(str)) {
    return str;
  }
  try {
    return JSON.parse(str);
  } catch (err) {
    logger.error('解析json字符异常' + str, err);
    return {};
  }
};


module.exports = {
  format: require('util').format,
  parseJson: parseJson,
  uuid: require('node-uuid').v4
};
