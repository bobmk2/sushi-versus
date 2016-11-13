'use strict';

var _Events = require('../websocket/Events');

var _Events2 = _interopRequireDefault(_Events);

var _ServerPlayer = require('./ServerPlayer');

var _ServerPlayer2 = _interopRequireDefault(_ServerPlayer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var app = express();

var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/../../public'));

app.get('/js/client.js', function (req, res) {
  res.sendFile('client.js', { root: __dirname + '/..' });
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

var socketIO = require('socket.io');
var server = http.createServer(app);
server.listen(port, function (err) {
  console.log('Express server started on port %s', port);

  players = [];
  socket = socketIO.listen(server);

  setEventHandlers();
});

var setEventHandlers = function setEventHandlers() {
  socket.sockets.on('connection', onSocketConnection);
};

function onSocketConnection(client) {
  util.log('player has connected: ' + client.id);
  client.on(_Events2.default.DISCONNECT, onClientDisconnect);
  client.on(_Events2.default.NEW_PLAYER, onNewPlayer);
  client.on(_Events2.default.MOVE_PLAYER, onMovePlayer);
  //client.on('show hmm', onShowHmm);
  //client.on('hide hmm', onHideHmm);
  //client.on('show message', onShowMessage);
  //client.on('drop tamago', onDropTamago);
}

function onClientDisconnect() {
  util.log('player has disconnected: ' + this.id);

  var removePlayer = playersMapping[this.id];
  if (typeof removePlayer === 'undefined') {
    util.log('Player not found: ' + this.id);
    return;
  }

  players.splice(players.indexOf(removePlayer), 1);
  delete playersMapping[this.id];
  this.broadcast.emit(_Events2.default.REMOVE_PLAYER, { id: this.id });
}

function onNewPlayer(data) {
  var _this = this;

  var newPlayer = new _ServerPlayer2.default(this.id, data.x, data.y);

  this.broadcast.emit(_Events2.default.NEW_PLAYER, {
    id: newPlayer.getPlayerId(),
    x: newPlayer.getX(),
    y: newPlayer.getY()
  });

  // 新規プレイヤーに他のプレイヤーのことを伝える
  players.forEach(function (player) {
    _this.emit(_Events2.default.NEW_PLAYER, player.getEmitData());
  });

  players.push(newPlayer);
  playersMapping[this.id] = newPlayer;
}

function onMovePlayer(data) {
  var movePlayer = playersMapping[this.id];
  if (typeof movePlayer === 'undefined') {
    util.log('Player not found: ' + this.id);
    return;
  }
  movePlayer.setPos(data.x, data.y);

  // プレイヤーの移動を全体に伝える
  this.broadcast.emit(_Events2.default.MOVE_PLAYER, movePlayer.getEmitData());
}