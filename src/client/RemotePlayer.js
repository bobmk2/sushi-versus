import {DIFF_X, DIFF_Y} from './BulletChamber';
import Bullet from './Bullet';

class RemotePlayer {
  constructor(game, id, typeName, x, y, bulletRest, chargingPower, invincibility) {
    this.playerId = id;
    this.game = game;

    this.image = game.add.sprite(x, y, typeName);
    this.image.scale.set(2);
    this.image.name = this.playerId.toString();
    this.image.anchor.setTo(0.5, 0.5);

    this.chargeEffect = game.add.image(x, y, typeName);
    this.chargeEffect.anchor.setTo(0.5,0.5);
    this.chargeEffect.scale.set(3.5);
    this.chargeEffect.alpha = 0.3;
    this.chargeEffect.visible = false;
    this.invincibility = invincibility;

    this.invincibilityTween = game.add.tween(this.image).to({alpha:0.1}, 200, Phaser.Easing.Linear.None, true, 0, 0, true).loop(true);
    if (this.invincibility) {
      this.invincibilityTween.start();
    } else {
      this.image.alpha = 1.0;
      this.invincibilityTween.stop();
    }

    this.bulletRest = bulletRest;
    this.chargingPower = chargingPower;

    var bullets = [
      new Bullet({game}, null, typeName, x - DIFF_X, y + DIFF_Y),
      new Bullet({game}, null, typeName, x - (DIFF_X / 2), y + DIFF_Y),
      new Bullet({game}, null, typeName, x, y + DIFF_Y),
      new Bullet({game}, null, typeName, x + (DIFF_X / 2), y + DIFF_Y),
      new Bullet({game}, null, typeName, x + DIFF_X, y + DIFF_Y)
    ];
    this.bullets = bullets;

    this._updateLastPosition();
  }

  updateStatus(data) {
    this.typeName = data.typeName;
    this.setPos(data.x, data.y);
    this.bulletRest = data.bulletChamber.rest;
    this.chargingPower = data.chargingPower;

    if (!this.invincibility && data.invincibility) {
      this.invincibilityTween.start();
    } else if (this.invincibility && !data.invincibility){
      this.image.alpha = 1.0;
      this.invincibilityTween.stop();
    }
    this.invincibility = data.invincibility;

    // 弾丸の描画を修正
    if (this.bulletRest === 5) {
      this.bullets.forEach(bullet => bullet.full());
    } else {
      for(let i =0; i < this.bulletRest; i++) {
        this.bullets[i].full();
      }
      this.bullets[this.bulletRest].charging();
      this.bullets.forEach((bullet, index) => {
        if (index < this.bulletRest) {
          bullet.full();
        } else if (index === this.bulletRest) {
          bullet.charging();
        } else {
          bullet.empty();
        }
      });
    }
  }

  update() {
    this.image.angle += this.chargingPower;
    if (this.chargingPower === 0) {
      this.image.angle = 0;
      this.chargeEffect.visible = false;
    } else if (this.chargingPower >= 30) {
      this.chargeEffect.visible = true;
      this.chargeEffect.angle = this.image.angle;
      this.chargeEffect.x = this.image.x;
      this.chargeEffect.y = this.image.y;
    }
  }

  setPos(x, y) {
    this.bullets.forEach((bullet, index) => {
      bullet.setPos(x - DIFF_X + ((DIFF_X/2) * index), y + DIFF_Y);
    });

    this.image.x = x;
    this.image.y = y;

    this._updateLastPosition();
  }

  _updateLastPosition() {
    this.lastPosition = {x: this.image.x, y: this.image.y};
  }

  remove() {
    this.image.kill();
    this.bullets.forEach(bullet => bullet.kill());
    this.chargeEffect.kill();
  }

  static fromEmitData(game, data) {
    return new RemotePlayer(
      game,
      data.id,
      data.typeName,
      data.x,
      data.y,
      data.bulletChamber.rest,
      data.chargingPower,
      data.invincibility
  )
  }
}

export default RemotePlayer;
