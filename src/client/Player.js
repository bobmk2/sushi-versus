import BulletChamber from './BulletChamber';

class Player {
  constructor(game, typeName, startX, startY) {
    this.game = game;

    this.typeName = typeName;
    this.speed = 2;

    this.speed_1ms = (this.speed * 60) / 1000;

    this.bullets = 5;

    this.bulletSpeed = 4;

    this.image = game.add.sprite(startX, startY, typeName);
    this.name = 'player';
    this.image.scale.set(2);
    this.image.anchor.setTo(0.5, 0.5);
    this.image.smoothed = false;
    game.physics.arcade.enable(this.image);

    this.bulletChamber = new BulletChamber(this.game, this, typeName, this.image.x, this.image.y);

    this.chargingDirection = null;
    this.chargingStart = -1;

    this._updateLastPosition();

    this._requiredEmit = false;
  }

  requiredEmit() {
    this._requiredEmit = true;
  }
  isRequiredEmit() {
    return this._requiredEmit;
  }
  emitted() {
    this._requiredEmit = false;
  }

  getSpeed() {
    return this.speed;
  }

  getDivisionLine() {
    const top = this.image.y - 21;
    const bottom = this.image.y + 21;
    const left = this.image.x - 32;
    const right = this.image.x + 32;

    return {top, bottom, left, right}
  }

  move(x, y) {
    this.image.x += x;
    this.image.y += y;

    this._updateLastPosition();

    this.requiredEmit();
  }

  update() {
    this.bulletChamber.update();
  }

  shoot() {
    if (this.bulletChamber.getRest() === 0 || this.chargingDirection === null) {
      return null;
    }
    const now = Date.now();

    this.bulletChamber.shoot(); // 残弾を減らす

    var move = null;
    switch(this.chargingDirection) {
      case 'up':
        move = {x: 0, y: -this.bulletSpeed};
        break;
      case 'down':
        move = {x: 0, y: this.bulletSpeed};
        break;
      case 'left':
        move = {x: -this.bulletSpeed, y: 0};
        break;
      case 'right':
        move = {x: this.bulletSpeed, y: 0};
        break;
    }

    this.chargingDirection = null;
    this.chargingStart = -1;

    this.requiredEmit();

    return {typeName: this.typeName, x: this.image.x, y: this.image.y, moveX: move.x, moveY: move.y};
  }

  charging({up, down, left, right}) {
    if ((!up && !down && !left && !right)
      || this.chargingDirection !== null
      || this.bulletChamber.getRest() === 0) {
      return;
    }

    if (up) {
      this.chargingDirection = 'up';
    } else if (down) {
      this.chargingDirection = 'down';
    } else if (left) {
      this.chargingDirection = 'left';
    } else if (right) {
      this.chargingDirection = 'right';
    }

    this.chargingStart = Date.now();
  }

  pos(x, y) {
    this.image.x = x;
    this.image.y = y;

    this._updateLastPosition();
  }

  getPos() {
    return {x: this.image.x, y: this.image.y};
  }

  _updateLastPosition() {
    this.bulletChamber.setPos(this.image.x, this.image.y);

    this.lastPosition = {x: this.image.x, y: this.image.y};
  }

  remove() {
    this.image.kill();
  }

  getEmitData() {
    return {
      typeName: this.typeName,
      x: this.image.x,
      y: this.image.y,
      bulletChamber: this.bulletChamber.getEmitData()
    }
  }
}

export default Player;
