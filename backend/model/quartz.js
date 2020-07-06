'use strict';

var Module = require('../module/_index');
var mgClient = Module.mgClient;
var Schema = mgClient.Schema;

/**
 * QuartzSchema
 * 定时器记录，用于集群时只跑一次定时器
 * `name`：定时器名
 * `last_date`:最后一次执行的时间
 */
var QuartzSchema = new Schema({
  job_id: String,
  last_date: {type: Number, default: 0}
});

module.exports = mgClient.model('quartz', QuartzSchema);
