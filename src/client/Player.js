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

    this.chargingPower = 0;
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

    if (this.chargingDirection !== null) {
      const last = this.chargingPower;
      this.chargingPower = (Date.now() - this.chargingStart) / 50;
      if (this.chargingPower > 30) {
        this.chargingPower = 30;
      }
      this.image.angle += this.chargingPower;
      if (last !== this.chargingPower) {
        this.requiredEmit();
      }
    }
  }

  shoot() {
    if (this.bulletChamber.getRest() === 0 || this.chargingDirection === null) {
      return null;
    }
    const chargingTime = Date.now() - this.chargingStart;

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

    let shotBullets = [];
    if (chargingTime > 1500) {
      // 弾を3発打つ
      this.bulletChamber.shoot();
      this.bulletChamber.shoot();
      this.bulletChamber.shoot();

      // 上下なら左右に広がる / 左右なら上下に広がる
      switch(this.chargingDirection) {
        case 'up':
        case 'down':
          shotBullets.push({typeName: this.typeName, x: this.image.x - 80, y: this.image.y, moveX: move.x, moveY: move.y});
          shotBullets.push({typeName: this.typeName, x: this.image.x, y: this.image.y, moveX: move.x, moveY: move.y});
          shotBullets.push({typeName: this.typeName, x: this.image.x + 80, y: this.image.y, moveX: move.x, moveY: move.y});
          break;
        case 'left':
        case 'right':
          shotBullets.push({typeName: this.typeName, x: this.image.x, y: this.image.y - 80, moveX: move.x, moveY: move.y});
          shotBullets.push({typeName: this.typeName, x: this.image.x, y: this.image.y, moveX: move.x, moveY: move.y});
          shotBullets.push({typeName: this.typeName, x: this.image.x, y: this.image.y + 80, moveX: move.x, moveY: move.y});
          break;
      }

    } else {
      this.bulletChamber.shoot(); // 残弾を減らす
      shotBullets.push({typeName: this.typeName, x: this.image.x, y: this.image.y, moveX: move.x, moveY: move.y});
    }

    this.image.angle = 0;
    this.chargingDirection = null;
    this.chargingStart = -1;
    this.chargingPower = 0;

    this.requiredEmit();

    return shotBullets;
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
      bulletChamber: this.bulletChamber.getEmitData(),
      chargingPower: this.chargingPower
    }
  }
}

export default Player;
