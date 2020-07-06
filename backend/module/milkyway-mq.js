'use strict';

var Config = require('../config/_index');
var Util = require('../util/_index');
var logger = Util.log.getLogger(__filename);
var _ = require('lodash');

var amqp = require('amqp-connection-manager');

var R = Config.milkywayMq;
var amqpUrl = Util.util.format('amqp://%s:%s@%s:%s/%s', R.user, R.pwd, R.host, R.port, R.vhost);

var milkywayMq;
var channelWrapper;

var MQ = {};

MQ.connect = function() {
  return new Promise(function(resolve) {
    milkywayMq = amqp.connect(amqpUrl, { json: true });

    channelWrapper = milkywayMq.createChannel({
      setup: function(ch) {
        return Promise.all([
          // 订阅消息 订阅的消息队列是R.subQueue
          ch.assertQueue(R.subQueue),
          // 规定只能同时接受一个任务
          ch.prefetch(1),
          // 消费消息
          ch.consume(R.subQueue, function(msg) {
            var Model = require('../model/_index');
            var PushLog = Model['push-log'];
            var content = msg && msg.content && Util.util.parseJson(msg.content.toString()) || {};
            var milkyway_routingkeys = Util.util.parseJson(R.MILKYWAY_ROUTINGKEY_MAP);
            var fn = Promise.resolve();

            logger.info('Milkyway MQ  received:', content);

            // 如果是指定的routing-key, 则执行存储操作
            if (milkyway_routingkeys.indexOf(content.t) !== -1) {
              fn = PushLog.pushMilkway(content.t, content.p);
            }

            fn
              .then(function() {
                ch.ack(msg);
              })
              .catch(function(err) {
                logger.error('Milkyway MQ sync error:', err);
              });
          }, { noAck: false })
        ]);
      }
    });

    milkywayMq.on('connect', function() {
      logger.info('Milkyway MQ connect success.');
    });

    milkywayMq.on('disconnect', function(params) {
      logger.error('Milkyway MQ disconnected.', params.err.stack);
    });

    channelWrapper.waitForConnect()
      .then(function() {
        logger.info('Milkyway MQ listening for messages');
        resolve(MQ);
      });

  });
};

module.exports = MQ;
