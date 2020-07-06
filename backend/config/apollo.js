'use strict';

module.exports = {

  dev: {
    configServerUrl: 'http://172.16.10.5:8080',
    appId: 'milkyway',
    clusterName: 'default',
    namespaceName: ['application']
  },

  local: {
    configServerUrl: 'https://apollo.thor-dev.longqueyun.com:8080',
    appId: 'milkyway',
    clusterName: 'local-dev',
    namespaceName: ['application']
  },

  prod: {
    configServerUrl: 'http://10.0.0.8:8080',
    appId: 'milkyway',
    clusterName: 'default',
    namespaceName: ['application']
  }
};
