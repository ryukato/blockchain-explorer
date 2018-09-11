/*
    SPDX-License-Identifier: Apache-2.0
*/
'use strict';

var syncconfig = require('./explorerconfig.json');
var helper = require('./common/helper');
var ExplorerError = require('./common/ExplorerError');
var logger = helper.getLogger('Synchronizer');
var SyncBuilder = require('./sync/SyncBuilder');
var PersistenceFactory = require('./persistence/PersistenceFactory');
var ExplorerSender = require('./sync/sender/ExplorerSender');

var explorer_const = require('./common/ExplorerConst').explorer.const;
var explorer_error = require('./common/ExplorerMessage').explorer.error;

var dbConfigHelper = require('./common/databaseConfigHelper');

var syncScanner;

class Synchronizer {
  constructor(args) {
    this.args = args;
    this.persistence;
    this.platform;
  }

  getDbConfig() {
    const defaultConfig = syncconfig[syncconfig[explorer_const.PERSISTENCE]];
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
    console.log('_dbConfig', _dbConfig);
    return _dbConfig;
  }

  async initialize() {
    if (!syncconfig[explorer_const.PERSISTENCE]) {
      throw new ExplorerError(explorer_error.ERROR_1001);
    }
    if (!syncconfig[syncconfig[explorer_const.PERSISTENCE]]) {
      throw new ExplorerError(
        explorer_error.ERROR_1002,
        syncconfig[explorer_const.PERSISTENCE]
      );
    }

    let pltfrm;
    if (syncconfig && syncconfig.sync && syncconfig.sync.platform) {
      pltfrm = syncconfig.sync.platform;
    } else {
      throw new ExplorerError(explorer_error.ERROR_1006);
    }

    //if (!this.args || this.args.length == 0) {
    //throw new ExplorerError(explorer_error.ERROR_1007);
    //}

    if (
      !(this.args && this.args.length > 2 && this.args[2] === '1') &&
      syncconfig.sync.type !== explorer_const.SYNC_TYPE_HOST
    ) {
      throw new ExplorerError(explorer_error.ERROR_1008);
    }

    this.persistence = await PersistenceFactory.create(
      syncconfig[explorer_const.PERSISTENCE],
      dbConfigHelper.getDbConfig()
    );

    let sender = new ExplorerSender(syncconfig.sync);
    sender.initialize();

    this.platform = await SyncBuilder.build(pltfrm, this.persistence, sender);

    this.platform.setPersistenceService();

    this.platform.setBlocksSyncTime(syncconfig.sync.blocksSyncTime);

    await this.platform.initialize(this.args);
  }

  close() {
    if (this.persistence) {
      //this.persistence.closeconnection();
    }
    if (this.platform) {
      this.platform.destroy();
    }
  }
}

module.exports = Synchronizer;
