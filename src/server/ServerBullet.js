class ServerBullet {
  constructor(playerId, {uuid, x, y, moveX, moveY, typeName, status}) {
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

  static fromEmitData(playerId, data) {
    return new ServerBullet(playerId, data);
  }

  toEmitData() {
    return {
      uuid: this.uuid,
      x: this.x,
      y: this.y,
      moveX: this.moveX,
      moveY: this.moveY,
      typeName: this.typeName
    }
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  destroy() {
    this._destroy = true;
  }
  isDestroy() {
    return this._destroy;
  }
}

export default ServerBullet;
