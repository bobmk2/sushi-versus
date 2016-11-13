"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Player = function () {
  function Player(id, x, y) {
    (0, _classCallCheck3.default)(this, Player);

    this._playerId = id;
    this._x = x;
    this._y = y;
  }

  (0, _createClass3.default)(Player, [{
    key: "getPlayerId",
    value: function getPlayerId() {
      return this._playerId;
    }
  }, {
    key: "getX",
    value: function getX() {
      return this.x;
    }
  }, {
    key: "getY",
    value: function getY() {
      return this.y;
    }
  }, {
    key: "setPos",
    value: function setPos(x, y) {
      this.x = x;
      this.y = y;
    }
  }, {
    key: "getEmitData",
    value: function getEmitData() {
      return {
        id: this._playerId,
        x: this._x,
        y: this._y
      };
    }
  }]);
  return Player;
}();

exports.default = Player;