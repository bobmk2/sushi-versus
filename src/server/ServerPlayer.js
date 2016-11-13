class Player {
  constructor({id, typeName, x, y, bulletChamber}) {
    this._playerId = id;
    this._x = x;
    this._y = y;
    this._typeName = typeName;
    this._bulletChamber = bulletChamber;
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
  }

  getEmitData() {
    return {
      id: this._playerId,
      typeName: this._typeName,
      x: this._x,
      y: this._y,
      bulletChamber: this._bulletChamber
    }
  }
}

export default Player;