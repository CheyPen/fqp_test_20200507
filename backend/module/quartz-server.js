'use strict';

var Util = require('../util/_index');
var Model = require('../model/_index');
var Define = require('../define/_index');
var QuartzJob = require('../quartz-job/_index');

var Promise = require('bluebird');
var later = require('later');
var _ = require('lodash');

var Quartz = Model.quartz;
var logger = Util.log.getLogger(__filename);
var DEFAULT_THRESHOLD = Define.DEFAULT_THRESHOLD;

// 设置本地时区
later.date.localTime();
function initQuartzJob(job) {
  return Quartz.findOne({ 'job_id': job.id })
    .then(function(quartz) {
      if (!quartz) {
        return Quartz.create({ 'job_id': job.id });
      }
    });
}

function runQuartzJob(quartzJob) {
  var now = Date.now();
  var threshold = quartzJob.threshold || DEFAULT_THRESHOLD;

  Quartz.update({ 'job_id': quartzJob.id, 'last_date': { $lt: now - threshold } },
    { last_date: now }, { multi: true })
    .exec()
    .then(function(result) {
      if (result && result.n > 0) {
        quartzJob.job()
          .then(function() {
            logger.info('执行定时任务成功：' + quartzJob.id);
          })
          .catch(function(err) {
            logger.error('执行定时任务失败：' + quartzJob.id, err);
          });

        return;
      }

      logger.info('放弃执行定时任务：' + quartzJob.id);
    })
    .catch(function(err) {
      logger.error('执行定时任务失败，查询数据库quartz失败：' + quartzJob.id, err);
    });
}

module.exports = function() {
  logger.info('OK: Quartz server is running');

  return Promise.all(_.map(QuartzJob, function(job) {
    if (job && job.enable) {
      return initQuartzJob(job)
        .then(function() {
          later.setInterval(function() {
            runQuartzJob(job);
            // 设置每小时第5分0秒启动
            // var cron = later.parse.cron('5 * * * *');
          }, later.parse.cron(job.cron));
        })
        .catch(function(err) {
          logger.error('ERR: Quartz server start error: ', err);
        });
    }
  }));
};
