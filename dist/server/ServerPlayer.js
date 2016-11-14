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
  function Player(_ref) {
    var id = _ref.id,
        typeName = _ref.typeName,
        x = _ref.x,
        y = _ref.y,
        bulletChamber = _ref.bulletChamber,
        chargingPower = _ref.chargingPower,
        invincibility = _ref.invincibility,
        death = _ref.death,
        launching = _ref.launching;
    (0, _classCallCheck3.default)(this, Player);

    this._playerId = id;
    this._x = x;
    this._y = y;
    this._typeName = typeName;
    this._bulletChamber = bulletChamber;
    this._chargingPower = chargingPower;
    this._invincibility = invincibility;
    this._death = death;
    this._launching = launching;
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
      this._x = x;
      this._y = y;
    }
  }, {
    key: "updateStatus",
    value: function updateStatus(data) {
      console.log("UPDATE");
      console.log(data);

      this._typeName = data.typeName;
      this.setPos(data.x, data.y);
      this._bulletChamber = data.bulletChamber;
      this._chargingPower = data.chargingPower;
      this._invincibility = data.invincibility;
      this._death = data.death;
      this._launching = data.launching;
    }
  }, {
    key: "getEmitData",
    value: function getEmitData() {
      return {
        id: this._playerId,
        typeName: this._typeName,
        x: this._x,
        y: this._y,
        bulletChamber: this._bulletChamber,
        chargingPower: this._chargingPower,
        invincibility: this._invincibility,
        death: this._death,
        launching: this._launching
      };
    }
  }]);
  return Player;
}();

exports.default = Player;