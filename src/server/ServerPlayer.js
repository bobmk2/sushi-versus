class Player {
  constructor({id, typeName, x, y, bulletChamber, chargingPower}) {
    this._playerId = id;
    this._x = x;
    this._y = y;
    this._typeName = typeName;
    this._bulletChamber = bulletChamber;
    this._chargingPower = chargingPower;
  }

  getPlayerId() {
    return this._playerId;
  }

  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }

  setPos(x, y) {
    this._x = x;
    this._y = y;
  }

  updateStatus(data) {
    this._typeName = data.typeName;
    this.setPos(data.x, data.y);
    this._bulletChamber = data.bulletChamber;
    this._chargingPower = data.chargingPower;
  }

  getEmitData() {
    return {
      id: this._playerId,
      typeName: this._typeName,
      x: this._x,
      y: this._y,
      bulletChamber: this._bulletChamber,
      chargingPower: this._chargingPower
    }
  }
}

export default Player;
