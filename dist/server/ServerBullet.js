"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ServerBullet = function () {
  function ServerBullet(playerId, _ref) {
    var uuid = _ref.uuid,
        x = _ref.x,
        y = _ref.y,
        moveX = _ref.moveX,
        moveY = _ref.moveY,
        typeName = _ref.typeName,
        status = _ref.status;
    (0, _classCallCheck3.default)(this, ServerBullet);

    this.playerId = playerId;

    this.uuid = uuid;
    this.x = x;
    this.y = y;
    this.moveX = moveX;
    this.moveY = moveY;
    this.typeName = typeName;
    this.status = status;

    this._destroy = false;
  }

  (0, _createClass3.default)(ServerBullet, [{
    key: "toEmitData",
    value: function toEmitData() {
      return {
        uuid: this.uuid,
        x: this.x,
        y: this.y,
        moveX: this.moveX,
        moveY: this.moveY,
        typeName: this.typeName
      };
    }
  }, {
    key: "setPos",
    value: function setPos(x, y) {
      this.x = x;
      this.y = y;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this._destroy = true;
    }
  }, {
    key: "isDestroy",
    value: function isDestroy() {
      return this._destroy;
    }
  }], [{
    key: "fromEmitData",
    value: function fromEmitData(playerId, data) {
      return new ServerBullet(playerId, data);
    }
  }]);
  return ServerBullet;
}();

exports.default = ServerBullet;