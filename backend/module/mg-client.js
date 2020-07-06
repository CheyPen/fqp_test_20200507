'use strict';

var Config = require('../config/_index');
var Util = require('../util/_index');

module.exports = function() {
  return Util.mongoose({
    user: Config.mongodb.user,
    pwd: Config.mongodb.pwd,
    host: Config.mongodb.host,
    port: Config.mongodb.port,
    db: Config.mongodb.db,
    replset: Config.mongodb.replset
  });
};
