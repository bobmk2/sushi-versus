"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GAMEFIELD_WIDTH = 960;
var GAMEFIELD_HEIGHT = 640;
var MASS_COUNT_X = 12;
var MASS_COUNT_Y = 8;
var MASS_SIZE = 80;

var ServerEnemy = function () {
  function ServerEnemy(_ref) {
    var id = _ref.id;
    (0, _classCallCheck3.default)(this, ServerEnemy);

    this.id = id;

    // ランダムに場所を決める
    this.x = Math.floor(Math.random() * MASS_COUNT_X) * 80 + 40;
    this.y = Math.floor(Math.random() * MASS_COUNT_Y) * 80 + 40;

    var speed = 1.25;
    this.speed = speed;
    this.speed_1ms = speed * 60 / 1000;

    this.launching = true;
    this.popTime = Date.now();
  }

  (0, _createClass3.default)(ServerEnemy, [{
    key: "getEmitData",
    value: function getEmitData() {
      return {
        id: this.id,
        x: this.x,
        y: this.y,
        launching: this.launching
      };
    }
  }, {
    key: "update",
    value: function update() {
      if (this.launching && Date.now() - this.popTime > 3000) {
        this.launching = false;
        this.lastMovedTime = Date.now();
      }
    }
  }, {
    key: "move",
    value: function move(_players) {
      var _this = this;

      // 登場準備中は何もしない
      if (this.launching) {
        return;
      }

      if (_players.length === 0) {
        return;
      }
      var players = _players.filter(function (player) {
        return !player._launching;
      }).filter(function (player) {
        return !player._invincibility;
      }).filter(function (player) {
        return !player._death;
      });
      if (players.length === 0) {
        return;
      }

      // 最も近いプレイヤーに最短距離で近づく
      // FIXME: 大量のプレイヤーがいると絶対ボトルネックになる

      var distances = players.map(function (player) {
        return {
          player: player,
          distance: Math.sqrt(Math.pow(_this.x - player._x, 2) + Math.pow(_this.y - player._y, 2))
        };
      });

      distances.sort(function (a, b) {
        if (a.distance < b.distance) {
          return -1;
        } else if (a.distance > b.distance) {
          return 1;
        }
        return 0;
      });

      var target = distances[0].player;

      var radian = Math.atan2(target._y - this.y, target._x - this.x);

      // 移動距離
      var now = Date.now();
      var moveX = Math.cos(radian) * ((now - this.lastMovedTime) * this.speed_1ms);
      var moveY = Math.sin(radian) * ((now - this.lastMovedTime) * this.speed_1ms);
      this.lastMovedTime = now;

      this.x += moveX;
      this.y += moveY;
    }
  }, {
    key: "getInvasionMass",
    value: function getInvasionMass() {
      if (this.launching) {
        return [];
      }
      // TODO 4角見る
      var x = Math.floor(this.x / MASS_SIZE);
      var y = Math.floor(this.y / MASS_SIZE);

      if (x < 0 || MASS_COUNT_X <= x) {
        return [];
      }
      if (y < 0 || MASS_COUNT_Y <= y) {
        return [];
      }

      return [x + "-" + y];
    }
  }]);
  return ServerEnemy;
}();

exports.default = ServerEnemy;