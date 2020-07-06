'use strict';

module.exports = {
  NOTIFY_KAFKA_COUNT: 100,  // 定义通知每次重发的数量不不超过100条
  DEFAULT_THRESHOLD: 2 * 60 * 1000 // 定时器刷新间隔时间
};
