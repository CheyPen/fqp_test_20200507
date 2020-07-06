'use strict';

module.exports = {

  APOLLO_CONFIG_MAP: {

    mongodb: {
      db: '$apollo:mongodb.db',
      user: '$apollo:mongodb.user',
      pwd: '$apollo:mongodb.pwd',
      host: '$apollo:mongodb.host',
      port: '$apollo:mongodb.port',
      replset: '$apollo:mongodb.replset'
    },

    milkywayMq: {
      user: '$apollo:milkywayMq.user',
      pwd: '$apollo:milkywayMq.pwd',
      host: '$apollo:milkywayMq.host',
      vhost: '$apollo:milkywayMq.vhost',
      port: '$apollo:milkywayMq.port',
      subQueue: '$apollo:milkywayMq.subQueue',
      MILKYWAY_ROUTINGKEY_MAP: '$apollo:milkywayMq.MILKYWAY_ROUTINGKEY_MAP'
    },

    kafka: {
      brokers: '$apollo:kafka.brokers',
      connectionTimeout: '$apollo:kafka.connectionTimeout',
      authenticationTimeout: '$apollo:kafka.authenticationTimeout',
      sasl: {
        mechanism: '$apollo:kafka.sasl.mechanism',
        username: '$apollo:kafka.sasl.username',
        password: '$apollo:kafka.sasl.password'
      },
      topic: '$apollo:kafka.topic',
      key: '$apollo:kafka.key'
    }
  },

  base: require('./base.js'),

  log: require('./log'),

  apollo: require('./apollo')

};

