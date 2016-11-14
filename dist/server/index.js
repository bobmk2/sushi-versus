'use strict';

var _dump = require('./utils/dump');

var _dump2 = _interopRequireDefault(_dump);

var _Events = require('./websocket/Events');

var _Events2 = _interopRequireDefault(_Events);

var _ServerPlayer = require('./ServerPlayer');

var _ServerPlayer2 = _interopRequireDefault(_ServerPlayer);

var _ServerBullet = require('./ServerBullet');

var _ServerBullet2 = _interopRequireDefault(_ServerBullet);

var _ServerMass = require('./ServerMass');

var _ServerMass2 = _interopRequireDefault(_ServerMass);

var _ServerEnemy = require('./ServerEnemy');

var _ServerEnemy2 = _interopRequireDefault(_ServerEnemy);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var app = express();


var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/../../public'));

app.get('/js/client.js', function (req, res) {
  res.sendFile('client.js', { root: __dirname + '/..' });
});

app.get('/api/players.json', function (req, res) {
  var tamagoCount = 0;
  var maguroCount = 0;
  players.forEach(function (player) {
    switch (player._typeName) {
      case 'tamago':
        tamagoCount++;
        break;
      case 'maguro':
        maguroCount++;
        break;
    }
  });
  res.json({ tamago: tamagoCount, maguro: maguroCount });
});

/*
  ===========================
        GAME VARIABLES
  ===========================
 */
var util = require('util');
var http = require('http');


var socket;
var players = [];
var playersMapping = {};

var bullets = [];
var bulletsMapping = {};

var enemies = [];
var enemiesMapping = {};

var masses = [];

var socketIO = require('socket.io');
var server = http.createServer(app);
server.listen(port, function (err) {
  console.log('Express server started on port %s', port);

  players = [];
  socket = socketIO.listen(server);

  for (var i = 0; i < 8; i++) {
    var line = [];
    for (var j = 0; j < 12; j++) {
      line.push(new _ServerMass2.default({ indexX: j, indexY: i }));
    }
    masses.push(line);
  }

  setEventHandlers();

  setInterval(onPopEnemy, 7500);
  setInterval(onUpdateEnemyStatus, 100);

  //  var frameRate = 10;
  //  setInterval(() => {
  //    // マスの種類特定
  //    const updatedMasses = [];
  //    let destroyBulletUuids = {};
  //
  //    for(let i =0;i<masses.length;i++){
  //      for(let j=0;j<masses[i].length;j++){
  //        const dBulletUuids = masses[i][j].detectTypeName();
  //        if (dBulletUuids !== null) {
  //          // 更新対象のマス
  //          updatedMasses.push(masses[i][j]);
  //
  //          // 削除対象の弾丸
  //          Object.assign(destroyBulletUuids, dBulletUuids);
  //        }
  //      }
  //    }
  //
  //    if(updatedMasses.length > 0) {
  //      console.log("更新")
  //      dump(updatedMasses)
  //    }
  //
  //    if (Object.keys(destroyBulletUuids).length > 0) {
  //      console.log("相殺");
  //      console.log(destroyBulletUuids)
  ////      this.broadcast.emit(events.DESTROY_BULLETS, );
  //    }
  //
  //
  //  }, 1000 / frameRate);
});

var setEventHandlers = function setEventHandlers() {
  socket.sockets.on('connection', onSocketConnection);
  socket.sockets.on('disconnection', onSocketDisconnection);
};

// FIXME: maybe exists good solution for broadcasting on interval
var clients = {};

function onSocketConnection(client) {
  util.log('player has connected: ' + client.id);
  client.on(_Events2.default.DISCONNECT, onClientDisconnect);
  client.on(_Events2.default.NEW_PLAYER, onNewPlayer);
  client.on(_Events2.default.UPDATE_PLAYER_STATUS, onUpdatePlayerStatus);
  client.on(_Events2.default.CREATE_BULLETS, onCreateBullets);
  client.on(_Events2.default.MOVE_BULLETS, onMoveBullets);
  client.on(_Events2.default.DESTROY_BULLETS, onDestroyBullets);
  client.on(_Events2.default.CHANGE_MASS_TYPENAME, onChangeMassTypeName);
  client.on(_Events2.default.KILL_ENEMY, onKillEnemy);

  clients[client.id] = client;

  //  setInterval(onUpdateEnemyStatus, 100);


  //client.on(events.MOVE_PLAYER, onMovePlayer);
  //client.on('show hmm', onShowHmm);
  //client.on('hide hmm', onHideHmm);
  //client.on('show message', onShowMessage);
  //client.on('drop tamago', onDropTamago);
}

function onSocketDisconnection(client) {
  util.log('player has disconnected' + client.id);
  delete clients[client.id];

  // プレイヤーがいなくなったら敵も消す
  if (Object.keys(clients).length === 0) {
    enemies = [];
    enemiesMapping = {};
  }
}

function onClientDisconnect() {
  util.log('player has disconnected: ' + this.id);
  onDisconnect(this.broadcast, this.id);

  //var removePlayer = playersMapping[this.id];
  //if (typeof removePlayer === 'undefined') {
  //  util.log('Player not found: '+ this.id);
  //  return;
  //}
  //
  //// プレイヤーに紐づく弾丸も削除
  //var desBullets = bullets.filter(
  //  bullet => this.id === bullet.playerId
  //).map(bullet => {
  //  cleanBullet(bullet.uuid);
  //  return bullet.uuid;
  //});
  //
  //players.splice(players.indexOf(removePlayer), 1);
  //delete playersMapping[this.id];
  //this.broadcast.emit(events.REMOVE_PLAYER, {id: this.id});
  //this.broadcast.emit(events.DESTROY_BULLETS, desBullets);
}

function onDisconnect(broadcast, connectionId) {
  var removePlayer = playersMapping[connectionId];
  if (typeof removePlayer === 'undefined') {
    util.log('Player not found: ' + connectionId);
    return;
  }

  // プレイヤーに紐づく弾丸も削除
  var desBullets = bullets.filter(function (bullet) {
    return connectionId === bullet.playerId;
  }).map(function (bullet) {
    cleanBullet(bullet.uuid);
    return bullet.uuid;
  });

  players.splice(players.indexOf(removePlayer), 1);
  delete playersMapping[connectionId];
  broadcast.emit(_Events2.default.REMOVE_PLAYER, { id: connectionId });
  broadcast.emit(_Events2.default.DESTROY_BULLETS, desBullets);

  if (players.length === 0) {
    enemies = [];
    enemiesMapping = {};
  }
}

function onNewPlayer(data) {
  var _this = this;

  console.log('[NEW_PLAYER] id:' + this.id + ' x:' + data.x + ' y:' + data.y);
  var newPlayer = new _ServerPlayer2.default(Object.assign(data, { id: this.id }));

  this.broadcast.emit(_Events2.default.NEW_PLAYER, newPlayer.getEmitData());

  // このプレイヤーに現在の盤面の状態を伝える
  var massesString = '';
  for (var i = 0; i < masses.length; i++) {
    for (var j = 0; j < masses[i].length; j++) {
      var c = '';
      switch (masses[i][j].typeName) {
        case 'default':
          c = 'd';break;
        case 'tamago':
          c = 't';break;
        case 'maguro':
          c = 'm';break;
      }
      massesString += c;
    }
  }
  this.emit(_Events2.default.INITIAL_MASSES, massesString);

  // このプレイヤーに他のプレイヤーのことを伝える
  players.forEach(function (player) {
    _this.emit(_Events2.default.NEW_PLAYER, player.getEmitData());
  });

  // このプレイヤーに既に存在する弾丸のことを伝える
  if (bullets.length > 0) {
    this.emit(_Events2.default.CREATE_BULLETS, bullets.map(function (bullet) {
      return bullet.toEmitData();
    }));
  }

  // このプレイヤーに既に存在する敵のことを伝える
  if (enemies.length > 0) {
    this.emit(_Events2.default.POP_ENEMY, enemies.map(function (enemy) {
      return enemy.getEmitData();
    }));
  }

  players.push(newPlayer);
  playersMapping[this.id] = newPlayer;
}

//function onMovePlayer(data) {
//  util.log(`[MOVE] id:${this.id} x:${data.x} y:${data.y}`);
//
//  var movePlayer = playersMapping[this.id];
//  if (typeof movePlayer === 'undefined') {
//    util.log(`Player not found: ${this.id}`);
//    return;
//  }
//  movePlayer.setPos(data.x, data.y);
//
//  // プレイヤーの移動を全体に伝える
//  this.broadcast.emit(events.MOVE_PLAYER, movePlayer.getEmitData());
//}

function onUpdatePlayerStatus(data) {
  var updatePlayer = playersMapping[this.id];
  if (typeof updatePlayer === 'undefined') {
    util.log('Player not found: ' + this.id);
    return;
  }
  data.id = this.id;
  updatePlayer.updateStatus(data);

  (0, _dump2.default)(data);

  // プレイヤーの移動を全体に伝える
  this.broadcast.emit(_Events2.default.UPDATE_PLAYER_STATUS, data);
}

function onCreateBullets(data) {
  var _this2 = this;

  if (!Array.isArray(data)) {
    data = [data];
  }

  var newBullets = data;
  data.forEach(function (d) {
    var newBullet = _ServerBullet2.default.fromEmitData(_this2.id, d);

    bullets.push(newBullet);
    bulletsMapping[newBullet.uuid] = newBullet;
  });

  // 新しい弾丸を全体に伝える
  this.broadcast.emit(_Events2.default.CREATE_BULLETS, newBullets);
}

function onMoveBullets(data) {
  console.log('onMovedBullets');
  //dump(data);

  var movedBullets = data.filter(function (d) {
    return bulletsMapping.hasOwnProperty(d.uuid);
  });
  movedBullets.forEach(function (b) {
    var bullet = bulletsMapping[b.uuid];
    bullet.setPos(b.x, b.y);

    var y = Math.floor(b.y / 80);
    var x = Math.floor(b.x / 80);

    if (0 <= x && x <= 11 && 0 <= y && y <= 7) {
      masses[y][x].typeName = bullet.typeName;
    }
  });

  // 弾同士の当たり判定
  // 長い目で見ると全体をソートしておいたほうが計算コストが安いはず
  bullets.sort(compareBullet);
  var maguroBullets = bullets.filter(function (bullet) {
    return bullet.typeName === 'maguro';
  });
  var tamagoBullets = bullets.filter(function (bullet) {
    return bullet.typeName === 'tamago';
  });

  var deletedBulletUuids = [];
  for (var i = 0; i < maguroBullets.length; i++) {
    var mB = maguroBullets[i];
    for (var j = 0; j < tamagoBullets.length; j++) {
      var tB = tamagoBullets[j];

      // 近いときだけ計算　この時点で遠かったら以降の要素も遠いのでbreak
      if (Math.abs(mB.x - tB.x) < 12) {
        var length = Math.sqrt(Math.pow(tB.x - mB.x, 2) + Math.pow(tB.y - mB.y, 2));
        if (length < 16) {
          console.log('LENGTH => ' + length);
          // 相殺
          deletedBulletUuids.push(mB.uuid);
          deletedBulletUuids.push(tB.uuid);
          console.log('TARGET =>', deletedBulletUuids);
          break;
        }
      } else {
        break;
      }
    }
  }

  if (deletedBulletUuids.length > 0) {
    deletedBulletUuids.forEach(function (uuid) {
      cleanBullet(uuid);
    });
    console.log(deletedBulletUuids);
    this.broadcast.emit(_Events2.default.DESTROY_BULLETS, deletedBulletUuids);
  }

  this.broadcast.emit(_Events2.default.MOVE_BULLETS, movedBullets);
}

function compareBullet(bulletA, bulletB) {
  if (bulletA.x < bulletB.x) {
    return -1;
  } else if (bulletA.x > bulletB.x) {
    return 1;
  }
  return 0;
}

function onDestroyBullets(data) {
  console.log('[onDestroyBullets]');
  (0, _dump2.default)(data);
  if (!Array.isArray(data)) {
    data = [data];
  }

  // 複数のクライアントから届く可能性があるため"無い"状態は多発する
  console.log(bulletsMapping);
  var uuids = data.filter(function (uuid) {
    return bulletsMapping.hasOwnProperty(uuid);
  }).map(function (uuid) {
    console.log("DELETE BULLET => ", uuid);
    cleanBullet(uuid);
    return uuid;
  });

  if (uuids.length > 0) {
    this.broadcast.emit(_Events2.default.DESTROY_BULLETS, uuids);
  }
}

function onChangeMassTypeName(data) {
  data.forEach(function (d) {
    masses[d.x][d.y].typeName = d.typeName;
  });
  this.broadcast.emit(_Events2.default.CHANGE_MASS_TYPENAME, data);
}

function cleanBullet(uuid) {
  var destroyBullet = bulletsMapping[uuid];
  bullets.splice(bullets.indexOf(destroyBullet), 1);
  delete bulletsMapping[uuid];
}

function onPopEnemy() {
  // TODO 今は増えすぎると何が起きるかわらかないので20制限
  if (enemies.length >= 10) {
    return;
  }

  var existsPlayers = players.filter(function (player) {
    return !player._death;
  });
  if (existsPlayers.length === 0) {
    return;
  }

  // 敵を作る
  var enemy = new _ServerEnemy2.default({ id: _nodeUuid2.default.v4() });
  enemies.push(enemy);
  enemiesMapping[enemy.id] = enemy;

  // 各クライアントに通知
  Object.keys(clients).forEach(function (key) {
    var client = clients[key];
    client.emit(_Events2.default.POP_ENEMY, enemy.getEmitData());
  });
}

function onUpdateEnemyStatus() {
  var existsPlayers = players.filter(function (player) {
    return !player._death;
  });
  if (existsPlayers.length === 0) {
    return;
  }

  // 敵を動かす
  var invasionMasses = {};
  enemies.forEach(function (enemy) {
    enemy.update();
    enemy.move(players);

    // TODO 最適化
    var invasions = enemy.getInvasionMass();
    invasions.forEach(function (i) {
      invasionMasses[i] = true;
    });
  });

  var emitArray = enemies.map(function (enemy) {
    return enemy.getEmitData();
  });
  if (emitArray.length > 0) {
    Object.keys(clients).forEach(function (key) {
      var client = clients[key];
      client.emit(_Events2.default.UPDATE_ENEMY_STATUS, emitArray);
    });
  }

  if (Object.keys(invasionMasses).length > 0) {

    // 変える必要が無いのなら送らない
    var invasions = Object.keys(invasionMasses).map(function (massIndex) {
      var idx = massIndex.split('-').map(function (s) {
        return parseInt(s);
      });
      if (masses[idx[1]][idx[0]].typeName === 'default') {
        return null;
      }

      // ついでに更新しておく
      masses[idx[1]][idx[0]].typeName = 'default';
      return { x: idx[1], y: idx[0], typeName: 'default' };
    }).filter(function (s) {
      return s !== null;
    });

    Object.keys(clients).forEach(function (key) {
      var client = clients[key];
      client.emit(_Events2.default.CHANGE_MASS_TYPENAME, invasions);
    });
  }
}

function onKillEnemy(data) {
  var enemy = enemiesMapping[data.id];
  if (typeof enemy === 'undefined') {
    return;
  }

  enemies.splice(enemies.indexOf(enemy), 1);
  delete enemiesMapping[data.id];

  this.emit(_Events2.default.APPEND_SCORE, { score: 50 });
  this.broadcast.emit(_Events2.default.KILL_ENEMY, { id: data.id });
}