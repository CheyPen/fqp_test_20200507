'use strict';

var logger = require('../log').getLogger(__filename);
var util = require('../util');

var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');

// http://mongoosejs.com/docs/promises.html
mongoose.Promise = Promise;

module.exports = function(opts) {
  var mgClient;
  var connStr = 'mongodb://';
  var connOpts = {
    server: {
      auto_reconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      socketOptions: { keepAlive: 1, connectTimeoutMS: 30000, socketTimeoutMS: 0 }
    }
  };
  var mdbArr = [];

  if (opts.replset && opts.replset != '0') {
    logger.info('mongodb use replset');
    connOpts.db = { readPreference: 'secondaryPreferred' };

    _.each(opts.replset.split(','), function(mdb) {
      mdbArr.push(util.format('%s:%s@%s/%s',
        opts.user, opts.pwd, mdb, opts.db));
    });

    connStr += mdbArr.join(',');
  } else {
    logger.info('mongodb use single node');
    connStr += util.format('%s:%s@%s:%s/%s',
      opts.user, opts.pwd, opts.host,
      opts.port, opts.db
    );
  }

  mgClient = mongoose.createConnection(connStr, connOpts);

  // 包装原始Schema类
  mgClient.Schema = function(schema, options) {
    schema._id = { type: String, default: util.uuid };
    if (!options) {
      [].push.call(arguments, { _id: false });
    } else {
      options._id = false;
    }

    mgClient.base.Schema.apply(this, arguments);
  };
  mgClient.Schema.prototype = new mgClient.base.Schema();
  mgClient.Schema.Types = mgClient.base.Schema.Types;

  // 包装原始model方法
  mgClient.originalModel = mgClient.model;
  mgClient.model = function(collectionName, schema) {
    if (!schema) {
      return mgClient.originalModel(collectionName);
    }
    schema.options = schema.options || {};
    schema.options.collection = collectionName;
    schema.options.versionKey = false;
    schema.options.bufferCommands = false;

    return mgClient.originalModel(collectionName, schema);
  };

  mgClient.promise = new Promise(function(resolve, reject) {
    mgClient.once('open', function() {
      logger.info('OK: mongodb connected: %j', opts);
      resolve(mgClient);
    });

    mgClient.on('error', function(err) {
      logger.error('ERR: mongodb connect error:', err);
      reject(err);
    });

    mgClient.on('connected', function() {
      logger.info('mongodb connected!');
    });

    mgClient.on('reconnected', function() {
      logger.warn('mongodb reconnected!');
    });

    mgClient.on('disconnected', function() {
      logger.fatal('mongodb disconnected!');
    });
  });

  return mgClient;
};
