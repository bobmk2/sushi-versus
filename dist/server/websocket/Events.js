'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var CONNECT = 'connect';
var DISCONNECT = 'disconnect';
var NEW_PLAYER = 'new-player';
var REMOVE_PLAYER = 'remove-player';
var INITIAL_MASSES = 'initial-masses';
//const MOVE_PLAYER = 'move_player';
var CREATE_BULLETS = 'create-bullets';
var MOVE_BULLETS = 'move-bullets';
var UPDATE_PLAYER_STATUS = 'update-player-status';
var DESTROY_BULLETS = 'destory-bullets';
var CHANGE_MASS_TYPENAME = 'change-mass-typename';

var POP_ENEMY = 'pop-enemy';
var UPDATE_ENEMY_STATUS = 'update-enemy-status';
var KILL_ENEMY = 'kill-enemy';
var APPEND_SCORE = 'append-score';

exports.default = {
  CONNECT: CONNECT,
  DISCONNECT: DISCONNECT,
  NEW_PLAYER: NEW_PLAYER,
  REMOVE_PLAYER: REMOVE_PLAYER,
  MOVE_BULLETS: MOVE_BULLETS,
  INITIAL_MASSES: INITIAL_MASSES,
  UPDATE_PLAYER_STATUS: UPDATE_PLAYER_STATUS,
  CREATE_BULLETS: CREATE_BULLETS,
  DESTROY_BULLETS: DESTROY_BULLETS,
  CHANGE_MASS_TYPENAME: CHANGE_MASS_TYPENAME,
  POP_ENEMY: POP_ENEMY,
  UPDATE_ENEMY_STATUS: UPDATE_ENEMY_STATUS,
  KILL_ENEMY: KILL_ENEMY,
  APPEND_SCORE: APPEND_SCORE
};