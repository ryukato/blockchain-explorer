/*
    SPDX-License-Identifier: Apache-2.0
*/
'use strict';

const explorerconfig = require('../explorerconfig.json');
const explorer_const = require('./common/ExplorerConst').explorer.const;

function getDbConfig() {
  const defaultConfig =
    explorerconfig[explorerconfig[explorer_const.PERSISTENCE]];
  const _host = process.env.DATABASE_HOST || defaultConfig.host;
  const _port = process.env.DATABASE_PORT || defaultConfig.port;
  const _database = process.env.DATABASE_NAME || defaultConfig.database;
  const _username = process.env.DATABASE_USERNAME || defaultConfig.username;
  const _passwd = process.env.DATABASE_PASSWD || defaultConfig.passwd;
  const _dbConfig = {
    host: _host,
    port: _port,
    database: _database,
    username: _username,
    passwd: _passwd
  };

  return _dbConfig;
}

exports.getDbConfig = getDbConfig;
