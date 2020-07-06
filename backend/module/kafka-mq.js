'use strict';

var kafkajs = require('kafkajs');
var Config = require('../config/_index');
var Util = require('../util/_index');

var logger = Util.log.getLogger(__filename);
var Kafka = kafkajs.Kafka;
var logLevel = kafkajs.logLevel;
var kafkaConfig = Config.kafka;

var Promise = require('bluebird');

var kafkaMq = new Kafka({
  clientId: 'Yunzhuli-' + Date.now(),
  brokers: Util.util.parseJson(kafkaConfig.brokers),
  connectionTimeout: kafkaConfig.connectionTimeout,
  authenticationTimeout: kafkaConfig.authenticationTimeout,
  sasl: {
    mechanism: kafkaConfig.sasl.mechanism,
    username: kafkaConfig.sasl.username,
    password: kafkaConfig.sasl.password
  },
  logLevel: logLevel.INFO
});

var producer = kafkaMq.producer();

module.exports = {
  connect: function() {
    return producer.connect();
  },
  sendMessage: function(jsonMsg) {
    return producer
      .send({
        topic: kafkaConfig.topic,
        messages: [{ key: kafkaConfig.key, value: jsonMsg }]
      })
      .then(function(res) {
        logger.info('OK: Kafka Producer Send Message Success: ', res);
        return res;
      });
  }
};
