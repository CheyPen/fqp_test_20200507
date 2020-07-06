'use strict';

var Model = require('../model/_index');
var PushLog = Model['push-log'];

var Promise = require('bluebird');

// 是否开启该定时任务
exports.enable = true;

// 每5分钟执行
exports.cron = '*/3 * * * *';

// 定时任务：kafka消息推送失败重新推送
exports.job = function() {
  return Promise.all([
    PushLog.rePushMilkway()
  ]);
};
