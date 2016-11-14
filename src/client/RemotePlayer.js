import {DIFF_X, DIFF_Y} from './BulletChamber';
import Bullet from './Bullet';

class RemotePlayer {
  constructor(game, id, typeName, x, y, bulletRest, chargingPower, invincibility, death, launching) {
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

    this.deadFlag = death;

    this.invincibilityTween = game.add.tween(this.image).to({alpha:0.1}, 200, Phaser.Easing.Linear.None, true, 0, 0, true).loop(true);
    if (this.invincibility) {
      if (this.launching) {
        // 何もしない
      } else {
        this.invincibilityTween.start();
      }
    } else {
      this.image.alpha = 1.0;
      this.invincibilityTween.stop();
    }

    this.bulletRest = bulletRest;
    this.chargingPower = chargingPower;

    this.launching = launching;
    const launchingEffect = game.add.sprite(x, y, 'launching-effect');
    launchingEffect.scale.set(2.5);
    launchingEffect.anchor.set(0.5);
    launchingEffect.animations.add('maguro', [1], 1, false);
    launchingEffect.animations.add('tamago', [2], 1, false);
    launchingEffect.animations.play(typeName);
    game.add.tween(launchingEffect.scale).to({x: 2, y:2}, 500, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);
    game.add.tween(launchingEffect).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);
    this.launchingEffect = launchingEffect;

    if (launching) {
      this.image.visible = false;
      this.chargeEffect.visible =false;
    } else {
      launchingEffect.kill();
    }

    var bullets = [
      new Bullet({game}, null, typeName, x - DIFF_X, y + DIFF_Y),
      new Bullet({game}, null, typeName, x - (DIFF_X / 2), y + DIFF_Y),
      new Bullet({game}, null, typeName, x, y + DIFF_Y),
      new Bullet({game}, null, typeName, x + (DIFF_X / 2), y + DIFF_Y),
      new Bullet({game}, null, typeName, x + DIFF_X, y + DIFF_Y)
    ];
    this.bullets = bullets;

    // 最初から死んでたら何も描画させない
    if (this.deadFlag) {
      this.deadFlag = true;
      this.image.kill();
      this.chargeEffect.kill();
      this.bullets.forEach(bullet => {
        bullet.kill();
      });
      this.launchingEffect.kill();
    }

    this._updateLastPosition();
  }

  updateStatus(data) {
    this.typeName = data.typeName;
    this.setPos(data.x, data.y);
    this.bulletRest = data.bulletChamber.rest;
    this.chargingPower = data.chargingPower;

    if(!this.deadFlag && data.death) {
      this.die();
    }
    this.deadFlag = data.death;

    if (this.deadFlag) {
      return;
    }

    if (this.launching && !data.launching) {
      if (this.launchingEffect.alive) {
        this.launchingEffect.kill();
      }
      this.image.visible = true;
      this.chargeEffect.visible =true;
    }
    this.launching = data.launching;

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

  die() {
    if (this.deadFlag) {
      return;
    }
    this.deadFlag = true;

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

    this.image.visible = false;
    const image = this.image;
    tween.onComplete.add(()=>{
      image.kill();
      effect.kill();
    }, this);

    // 弾も破裂させる
    this.bullets.forEach(bullet => {
      bullet.startBurstEffect();
      bullet.kill();
    });
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
    if (this.image.alive) {
      this.image.kill();
    }
    this.bullets.forEach(bullet => {
      if (bullet.image.alive) {
        bullet.kill();
      }
    });
    if (this.chargeEffect.alive) {
      this.chargeEffect.kill();
    }
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
      data.invincibility,
      data.death,
      data.launching
  )
  }
}

export default RemotePlayer;
