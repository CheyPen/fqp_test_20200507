'use strict';

var requireDirectory = require('require-directory');
var _ = require('lodash');

var jobs = requireDirectory(module, './');
_.each(jobs, function(job, id) {
  job.id = id;

  if (!job.enable) {
    delete jobs[id];
  }
});

module.exports = jobs;
