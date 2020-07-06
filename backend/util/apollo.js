'use strict';

var apollo = require('node-apollo');
var _ = require('lodash');

var MARKER = '$apollo:';

function getConfig(apolloConnOptions) {
  return apollo.remoteConfigServiceSkipCache(apolloConnOptions);
}

function combineDefaultConfig(defaultConfig, configFromApollo) {
  _.each(defaultConfig, function(v, k) {
    if (_.isString(v) && v.indexOf(MARKER) === 0) {
      var apolloConfigKey = v.substring(MARKER.length);
      defaultConfig[k] = configFromApollo[apolloConfigKey];
      return;
    }

    if (_.isObject(v)) {
      combineDefaultConfig(v, configFromApollo);
    }
  });
}

module.exports = {
  getConfig: getConfig,
  combineDefaultConfig: combineDefaultConfig
};
