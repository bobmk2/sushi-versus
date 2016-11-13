class Bullet {

  constructor({game, group}, uuid, typeName, x, y, moveX = 0, moveY = 0) {
    this.game = game;
    this.group = group;
    this.uuid = uuid;
    this.typeName = typeName;
    this._x = x;
    this._y = y;
    this._moveX = moveX;
    this._moveY = moveY;

    // 1msあたりの移動量
    this._moveX_1ms = ((this._moveX * 60) / 1000);
    this._moveY_1ms = ((this._moveY * 60) / 1000);

    // groupが渡されたときのみコリジョン判定させる
    if (typeof group !== 'undefined') {
      this.image = group.create(x, y, 'ikura');
      this.image.checkWorldBounds = true;
      this.image.events.onOutOfBounds.add(this.onOutOfBounds, this);
      this.image.name = uuid;
    } else {
      this.image = game.add.sprite(x, y, 'ikura');
    }
    this.image.scale.set(1);
    this.image.smoothed = false;
    this.image.anchor.setTo(0.5, 0.5);

    this.shooting = false;

    this.image.animations.add('empty', [4], 1,false);
    if (typeName === 'tamago') {
      this.image.animations.add('charging', [1], 1,false);
      this.image.animations.add('full', [0], 1,false);
    } else if (typeName === 'maguro') {
      this.image.animations.add('charging', [3], 1,false);
      this.image.animations.add('full', [2], 1,false);
    }

    this.chargeStartTime = 0;

    // 最初は満タン
    this.full();

    this.destroyFlag = false;

    this.lastUpdateTime = Date.now();
  }

  isDestroyed() {
    return this.destroyFlag;
  }

  destroy() {
    console.log("DESTORY FLAG ON => ", this.uuid);
    this.destroyFlag = true;
  }

  // 範囲外に出たら削除する
  onOutOfBounds() {
    this.destroy();
  }

  shoot() {
    if (this.shooting) {return;}
    this.shooting = true;
  }

  update() {
    if (this.status === 1) {
      if (Date.now() - this.chargeStartTime > 1500) {
        this.full();
      }
    }

    if (!this.shooting) {
      return;
    }

    const now = Date.now();

    // フレーム単位ではなく、時間を見て動かす

    this.image.x += (this._moveX_1ms * (now - this.lastUpdateTime));
    this.image.y += (this._moveY_1ms * (now - this.lastUpdateTime));

    this.lastUpdateTime = now;
  }

  setPos(x, y) {
    this.image.x = x;
    this.image.y = y;
  }

  empty() {
    this.image.animations.play('empty');
    this.status = 0;
  }
  charging() {
    this.image.animations.play('charging');
    this.status = 1;
    this.chargeStartTime = Date.now();
  }
  full() {
    this.image.animations.play('full');
    this.status = 2;
  }

  isFull() {
    return this.status === 2;
  }

  getStatus() {
    return this.status;
  }

  getEmitData() {
    return {
      uuid: this.uuid,
      x: this.image.x,
      y: this.image.y,
      moveX: this._moveX,
      moveY: this._moveY,
      typeName: this.typeName
    }
  }

  static fromEmitData({game, group}, data) {
    return new Bullet({game, group}, data.uuid, data.typeName, data.x, data.y, data.moveX, data.moveY);
  }

  kill() {
    console.log("BULLET KILL")

    if (typeof this.group !== 'undefined') {
      this.group.remove(this.image);
    }

    this.image.kill();
  }
}

export default Bullet;
