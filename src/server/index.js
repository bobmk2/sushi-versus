var express = require('express')
var app = express();
import dump from './utils/dump';

const port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/../../public'))

app.get('/js/client.js', function(req, res) {
  res.sendFile('client.js', {root: __dirname + '/..'});
});

app.get('/api/players.json', function(req, res) {
  let tamagoCount = 0;
  let maguroCount = 0;
  players.forEach(player => {
    switch (player._typeName) {
      case 'tamago':
        tamagoCount ++;
        break;
      case 'maguro':
        maguroCount ++;
        break;
    }
  });
  res.json({tamago: tamagoCount, maguro: maguroCount});
});

/*
  ===========================
        GAME VARIABLES
  ===========================
 */
var util = require('util');
var http = require('http');
import events from './websocket/Events';
import Player from './ServerPlayer';
import Bullet from './ServerBullet';
import Mass from './ServerMass';

var socket;
var players = [];
var playersMapping = {};

var bullets = [];
var bulletsMapping = {};

var masses = [];

var socketIO = require('socket.io');
const server = http.createServer(app);
server.listen(port, function(err){
  console.log('Express server started on port %s', port);

  players = [];
  socket = socketIO.listen(server);


  for(let i=0;i<8;i++){
    let line = [];
    for(let j=0;j<12;j++){
      line.push(new Mass({indexX: j, indexY:i}))
    }
    masses.push(line);
  }

  setEventHandlers();

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

var setEventHandlers = function() {
  socket.sockets.on('connection', onSocketConnection);
};

function onSocketConnection(client) {
  util.log('player has connected: ' + client.id);
  client.on(events.DISCONNECT, onClientDisconnect);
  client.on(events.NEW_PLAYER, onNewPlayer);
  client.on(events.UPDATE_PLAYER_STATUS, onUpdatePlayerStatus);
  client.on(events.CREATE_BULLETS, onCreateBullets);
  client.on(events.MOVE_BULLETS, onMoveBullets);
  client.on(events.DESTROY_BULLETS, onDestroyBullets);
  //client.on(events.MOVE_PLAYER, onMovePlayer);
  //client.on('show hmm', onShowHmm);
  //client.on('hide hmm', onHideHmm);
  //client.on('show message', onShowMessage);
  //client.on('drop tamago', onDropTamago);
}


function onClientDisconnect(){
  util.log('player has disconnected: ' + this.id);

  var removePlayer = playersMapping[this.id];
  if (typeof removePlayer === 'undefined') {
    util.log('Player not found: '+ this.id);
    return;
  }

  // プレイヤーに紐づく弾丸も削除
  var desBullets = bullets.filter(
    bullet => this.id === bullet.playerId
  ).map(bullet => {
    cleanBullet(bullet.uuid);
    return bullet.uuid;
  });

  players.splice(players.indexOf(removePlayer), 1);
  delete playersMapping[this.id];
  this.broadcast.emit(events.REMOVE_PLAYER, {id: this.id});

  this.broadcast.emit(events.DESTROY_BULLETS, desBullets);
}

function onNewPlayer(data) {
  console.log(`[NEW_PLAYER] id:${this.id} x:${data.x} y:${data.y}`);
  const newPlayer = new Player(Object.assign(data, {id: this.id}));

  this.broadcast.emit(events.NEW_PLAYER, newPlayer.getEmitData());

  // このプレイヤーに現在の盤面の状態を伝える
  let massesString = '';
  for(let i=0;i<masses.length;i++) {
    for(let j=0;j<masses[i].length;j++){
      var c = '';
      switch(masses[i][j].typeName) {
        case 'default': c ='d';break;
        case 'tamago': c='t';break;
        case 'maguro': c='m';break;
      }
      massesString += c;
    }
  }
  this.emit(events.INITIAL_MASSES, massesString);

  // このプレイヤーに他のプレイヤーのことを伝える
  players.forEach(player => {
    this.emit(events.NEW_PLAYER, player.getEmitData())
  });

  // このプレイヤーに既に存在する弾丸のことを伝える
  if (bullets.length > 0 ){
    this.emit(events.CREATE_BULLETS, bullets.map(bullet => bullet.toEmitData()));
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
  //console.log('[UPDATE] ');
  //dump(data);

  var updatePlayer = playersMapping[this.id];
  if (typeof updatePlayer === 'undefined') {
    util.log(`Player not found: ${this.id}`);
    return;
  }
  data.id = this.id;
  updatePlayer.updateStatus(data);

  // プレイヤーの移動を全体に伝える
  this.broadcast.emit(events.UPDATE_PLAYER_STATUS, data);
}

function onCreateBullets(data) {

  if(!Array.isArray(data)) {
    data = [data];
  }

  const newBullets = data;
  data.forEach(d => {
    const newBullet = Bullet.fromEmitData(this.id, d);

    bullets.push(newBullet);
    bulletsMapping[newBullet.uuid] = newBullet;
  });

  // 新しい弾丸を全体に伝える
  this.broadcast.emit(events.CREATE_BULLETS, newBullets);

}

function onMoveBullets(data) {
  console.log('onMovedBullets');
  dump(data);

  var movedBullets = data.filter(d => bulletsMapping.hasOwnProperty(d.uuid));
  movedBullets.forEach(b => {
    const bullet = bulletsMapping[b.uuid];
    bullet.setPos(b.x, b.y);

    const y = Math.floor(b.y / 80);
    const x = Math.floor(b.x / 80);

    if ( (0 <= x && x <= 11) && (0 <= y && y <= 7)) {
      masses[y][x].typeName = bullet.typeName;
//      masses[y][x].addBullet(bullet)
    }
  });
  this.broadcast.emit(events.MOVE_BULLETS, movedBullets);
}

function onDestroyBullets(data) {
  console.log('[onDestroyBullets]')
  dump(data);
  if(!Array.isArray(data)) {
    data = [data];
  }

  // 複数のクライアントから届く可能性があるため"無い"状態は多発する
  console.log(bulletsMapping);
  const uuids = data
    .filter(uuid => bulletsMapping.hasOwnProperty(uuid))
    .map(uuid => {
      console.log("DELETE BULLET => ", uuid);
      cleanBullet(uuid);
      return uuid
    });

  if (uuids.length > 0) {
    this.broadcast.emit(events.DESTROY_BULLETS, uuids);
  }
}

function cleanBullet(uuid) {
  let destroyBullet = bulletsMapping[uuid];
  bullets.splice(bullets.indexOf(destroyBullet), 1);
  delete bulletsMapping[uuid];
}
