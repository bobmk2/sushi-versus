import BulletChamber from './BulletChamber';

class Player {
  constructor(game, typeName, startX, startY) {
    this.game = game;

    this.typeName = typeName;
    this.speed = 2;

    this.speed_1ms = (this.speed * 60) / 1000;

    this.bullets = 5;

    this.bulletSpeed = 4;

    const arrow = game.add.sprite(startX, startY - 45, 'arrow');
    arrow.scale.set(2);
    arrow.anchor.set(0.5);
    this.arrow = arrow;

    this.image = game.add.sprite(startX, startY, typeName);
    this.image.visible = false;

    this.invincibilityTween = game.add.tween(this.image).to({alpha:0.1}, 200, Phaser.Easing.Linear.None, true, 0, 0, true).loop(true);
    this.invincibilityTween.pause();

    this.chargeEffect = game.add.image(startX, startY, typeName);
    this.chargeEffect.anchor.set(0.5);
    this.chargeEffect.scale.set(3.5);
    this.chargeEffect.alpha = 0.3;
    this.chargeEffect.visible = false;

    const launchingEffect = game.add.sprite(startX, startY, 'launching-effect');
    launchingEffect.scale.set(2.5);
    launchingEffect.anchor.set(0.5);
    launchingEffect.animations.add('maguro', [1], 1, false);
    launchingEffect.animations.add('tamago', [2], 1, false);
    launchingEffect.animations.play(typeName);
    game.add.tween(launchingEffect.scale).to({x: 2, y:2}, 500, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);
    game.add.tween(launchingEffect).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);
    this.launchingEffect = launchingEffect;

    this.bulletChamber = new BulletChamber(this.game, this, typeName, this.image.x, this.image.y);
    this.bulletChamber.setVisible(false);

    this.chargingDirection = null;
    this.chargingStart = -1;

    // 3秒警告を出す
    this.launching = true;
    this.launchedTime = Number.MAX_VALUE;

    this._updateLastPosition();

    this._requiredEmit = false;

    this.chargingPower = 0;

    this.invincibility = true;

    this.popTime = Date.now();

    this.deadFlag = false;
  }

  isInvincibility() {
    return this.invincibility;
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
    if (this.isDead() || this.launching) {
      return;
    }

    this.image.x += x;
    this.image.y += y;

    this._updateLastPosition();

    this.requiredEmit();
  }

  update() {
    const now = Date.now();

    if (this.launching) {

      // 3秒後に登場
      if ((now - this.popTime) >= 3000) {
        this.launching = false;
        this.launchedTime = now;
        this.image.visible = true;
        this.invincibilityTween.resume();
        this.launchingEffect.kill();

        this.bulletChamber.setVisible(true);

        this.game.physics.arcade.enable(this.image);
        this.name = 'player';
        this.image.scale.set(2);
        this.image.anchor.setTo(0.5, 0.5);
        this.image.smoothed = false;
        this.requiredEmit();
      }
      return;
    }

    if (this.chargingDirection !== null) {
      const last = this.chargingPower;
      this.chargingPower = (now - this.chargingStart) / 50;

      if (this.chargingPower > 30) {
        this.chargingPower = 30;

        this.chargeEffect.visible = true;

        this.chargeEffect.x = this.image.x;
        this.chargeEffect.y = this.image.y;
      }
      this.image.angle += this.chargingPower;
      this.chargeEffect.angle = this.image.angle;

      if (last !== this.chargingPower) {
        this.requiredEmit();
      }
    } else {
      // チャージ中は回復しない
      this.bulletChamber.update();
    }

    // 2秒間は無敵 + いる場所を自分の色に変える
    if (this.invincibility && (now - this.launchedTime) >= 2000) {
      this.invincibility = false;

      this.image.alpha = 1.0;
      this.invincibilityTween.stop();

      this.requiredEmit();
    }
  }

  shoot() {
    if (this.isDead() || this.launching) {
      return null;
    }

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
      // 1発の消費で弾を3発打つ
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

    this.chargeEffect.visible = false;
    this.chargeEffect.angle = 0;

    this.requiredEmit();

    return shotBullets;
  }

  charging({up, down, left, right}) {
    if (this.isDead()) {
      return;
    }
    if (this.launching) {
      return;
    }

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
    if (this.isDead()) {
      return;
    }

    this.image.x = x;
    this.image.y = y;

    this._updateLastPosition();
  }

  getPos() {
    return {x: this.image.x, y: this.image.y};
  }

  _updateLastPosition() {
    this.arrow.x = this.image.x;
    this.arrow.y = this.image.y - 45;
    this.bulletChamber.setPos(this.image.x, this.image.y);

    this.lastPosition = {x: this.image.x, y: this.image.y};
  }

  remove() {
    this.image.kill();
    this.chargeEffect.kill();
  }

  getEmitData() {
    return {
      typeName: this.typeName,
      x: this.image.x,
      y: this.image.y,
      bulletChamber: this.bulletChamber.getEmitData(),
      chargingPower: this.chargingPower,
      invincibility: this.invincibility,
      death: this.deadFlag,
      launching: this.launching
    }
  }

  die() {
    if (this.deadFlag) {
      return;
    }
    this.deadFlag = true;

    this.invincibility = false;
    this.invincibilityTween.stop();

    this.image.angle = 0;
    this.chargingDirection = null;
    this.chargingStart = -1;
    this.chargingPower = 0;
    this.chargeEffect.visible = false;
    this.chargeEffect.angle = 0;

    // 死亡エフェクト
    const effect = this.game.add.sprite(this.image.x, this.image.y, this.typeName);
    effect.scale.set(2);
    effect.anchor.setTo(0.5, 0.5);
    effect.smoothed = false;

    const tween = this.game.add.tween(effect.scale).to({x:5, y:5}, 2000, Phaser.Easing.Exponential.Out, true, 0, 0, false);
    this.game.add.tween(effect).to({alpha:0}, 2000, Phaser.Easing.Exponential.Out, true, 0, 0, false);

    this.arrow.kill();

    this.image.visible = false;
    const image = this.image;
    tween.onComplete.add(()=>{
      image.kill();
      effect.kill();
    }, this);

    // 弾も破裂させる
    this.bulletChamber.burst();

    this.requiredEmit();
  }

  isDead() {
    return this.deadFlag;
  }

  isLaunching() {
    return this.launching;
  }
}

export default Player;
