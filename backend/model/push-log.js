'use strict';

var Module = require('../module/_index');
var Define = require('../define/_index');
var Config = require('../config/_index');
var Util = require('../util/_index');
var logger = Util.log.getLogger(__filename);

var _ = require('lodash');
var Promise = require('bluebird');

var mgClient = Module.mgClient;
var Schema = mgClient.Schema;
var kafka = Module.kafka;
var NOTIFY_KAFKA_COUNT = Define.NOTIFY_KAFKA_COUNT;
/**
 * PushLogSchema
 * `routing_key`: milkyway-routing_key
 * `key_id`: contain._id
 * `contain`: milkyway消息主体
 * `retry_times`: 重试次数
 * `status`: 状态
 * `create_date`: 创建日期
 * `update_date`: 更新日期
 */
var PushLogSchema = new Schema({
  routing_key: String, // milkyway-routing_key
  key_id: String, // contain._id
  contain: Schema.Types.Mixed, // Object 混合数据类型
  status: Number, // 0: 发送失败 1:发送成功
  retry_times: { type: Number, default: 0 },
  create_date: { type: Number, default: Date.now() },
  update_date: Number
});

function sendSuccess(res, success_code) {
  return _.find(res, {
    topicName: Config.kafka.topic,
    errorCode: success_code || 0
  });
};

PushLogSchema.statics = {
  pushMilkway: function(routingKey, contain) {
    var self = this;
    // 1、kafka推送消息 2、保存日志
    return kafka.sendMessage(JSON.stringify(contain))
      .then(function(res) {
        var doc = {
          routing_key: routingKey, // milkyway-routing_key
          key_id: contain.id, // contain.id
          contain: contain, // Object 混合数据类型
          retry_times: 0,
          update_date: Date.now()
        };
        if (sendSuccess(res)) {
          doc.status = 1;
        } else {
          doc.status = 0;
        }
        self.create(doc);
      });
  },

  notifyKafka: function(pushLog) {
    var self = this;
    return kafka.sendMessage(pushLog.routing_key, JSON.stringify(pushLog.contain))
      .then(function(res) {
        var setOpts = { update_time: Date.now() };
        if (sendSuccess(res)) {
          setOpts.status = 1;
        } else {
          setOpts.status = 0;
          setOpts.retry_times = pushLog.retry_times + 1;
        };
        self.update({ _id: pushLog._id }, setOpts).exec();
      });
  },

  rePushMilkway: function() {
    var self = this;
    var options = { limit: NOTIFY_KAFKA_COUNT, sort: { retry_times: 'desc' } };
    self.find({ status: 0, update_date: { $lte: Date.now() - 60 * 1000 } })
      .limit(options.limit)
      .sort(options.sort)
      .exec()
      .then(function(list) {
        var task, taskQueue = [];
        list.forEach(function(log) {
          task = self.notifyKafka(log);
          taskQueue.push(task);
        });
        return Promise.all(taskQueue)
          .then(function() {
            if (list.length == NOTIFY_KAFKA_COUNT) {
              self.rePushMilkway();
            }
          });
      });
  }
};

module.exports = mgClient.model('push_log', PushLogSchema);
