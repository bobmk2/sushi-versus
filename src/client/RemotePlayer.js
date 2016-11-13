import {DIFF_X, DIFF_Y} from './BulletChamber';
import Bullet from './Bullet';

class RemotePlayer {
  constructor(game, id, typeName, x, y, bulletRest) {
    this.playerId = id;
    this.game = game;

    this.image = game.add.sprite(x, y, typeName);
    this.image.scale.set(2);
    this.image.name = this.playerId.toString();
    this.image.anchor.setTo(0.5, 0.5);
    this.bulletRest = bulletRest;

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
    console.log('UPDATE');
    console.log(data);
    this.typeName = data.typeName;
    this.setPos(data.x, data.y);
    this.bulletRest = data.bulletChamber.rest;

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
  }

  static fromEmitData(game, data) {
    return new RemotePlayer(
      game,
      data.id,
      data.typeName,
      data.x,
      data.y,
      data.bulletChamber.rest
    )
  }
}

export default RemotePlayer;
