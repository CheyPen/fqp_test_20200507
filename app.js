'use strict';

var _ = require('lodash');

var Config = require('./backend/config/_index');
var Module = require('./backend/module/_index');
var Util = require('./backend/util/_index');

var apolloUtil = Util.apollo;
var logger = Util.log.getLogger(__filename);
function initConfig() {
  if (process.argv.length < 4) {
    throw new Error("Need arguments to start app!");
  }
  var apolloConnOptions = Config.apollo[process.argv[2]];
  apolloConnOptions.secret = process.argv[3];
  return apolloUtil.getConfig(apolloConnOptions)
    .then(function(result) {
      apolloUtil.combineDefaultConfig(Config.APOLLO_CONFIG_MAP, result);
      _.each(Config.APOLLO_CONFIG_MAP, function(value, item) {
        Config[item] = _.extend(Config[item] || {}, value);
      });
    })
    .then(function() {
      logger.info('Final Config:', JSON.stringify(Config));
    })
    .catch(function(err) {
      logger.error('initConfig error:', err);
      throw err;
    });
}

function initKafkaMq() {
  return (Module.kafka = require('./backend/module/kafka-mq')).connect();
}

function initMgClient() {
  return (Module.mgClient = require('./backend/module/mg-client')()).promise;
}

function initQuartzServer() {
  return (Module.quartzServer = require('./backend/module/quartz-server'))();
}

function initMilkywayMq() {
  return (Module.milkywayMq = require('./backend/module/milkyway-mq')).connect();
}

Promise.resolve()
  .then(initConfig)
  .then(initKafkaMq)
  .then(initMgClient)
  .then(initQuartzServer)
  .then(initMilkywayMq)
  .then(function() {
    logger.info('OK: app start success!');
  })
  .catch(function(err) {
    logger.error('ERR: app start fail:', err);

    setTimeout(function() {
      process.exit(1);
    }, 3000);
  });

process.on('uncaughtException', function(err) {
  console.error('App uncaught exception:', err);
  logger.error('App uncaught exception:', err); // may not printed with pm2

  process.nextTick(function() {
    process.exit(1);
  });
});

